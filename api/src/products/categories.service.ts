import { Injectable } from '@nestjs/common';
import { SearchService } from '../search/search.service';
import { FilesService } from "../files/files.service";
import console = require('console');

const ES_INDEX_CATEGORY = 'categories'
@Injectable()
export class CategoriesService {
    constructor(readonly esService: SearchService,
        readonly filesService: FilesService) {}

        async search (keyword: string){
            const size = 10
            const from = 0
            const body = {
                size,
                from,
                query: {   
                    bool: {
                        must: [
                          {
                            query_string: {
                                fields: [ "display_name","parentName.*"],
                                query: '*' + keyword + '*',
                                analyze_wildcard: true
                             }
                          },
                          {
                            match: {
                                has_children: false 
                            }
                          }
                        ]
                      }
                    
                },
                _source: ['display_name', 'id', 'parentName']
            }      
            
            const { body: { 
                hits: { 
                    total, 
                    hits 
                } } } = await this.esService.search(ES_INDEX_CATEGORY, body)
            const count = total.value
            let categories = []
            if(count){
                categories = hits.map((item: any) => {
                    return{
                        _id: item._id,
                        ...item._source,
                     }
                })
            }
            return {
                count,
                size,
                from,
                categories
            }
        }
        async createIndex(){

            const existing = await this.esService.checkIndexExisting(ES_INDEX_CATEGORY)
            if(!existing){
                this.esService.createIndex(ES_INDEX_CATEGORY, this.indicateBody())
                await this.collectCategories()
             }
         
        }
        async collectCategories (){
            const tree = getCategories()
           


            for(let category1 of tree){
                await this.createWithChildren(category1)
            }

        }
        async createWithChildren(category: any){
            try{ /*
                display_name: "Áo hai dây và ba lỗ",
                name: "Tanks & Camisoles",
                children: [],
                parent_id: 200099,
                id: 200350 */
                const has_children = category.children.length ? true : false
                const record: any = [
                    { index: { _index: ES_INDEX_CATEGORY } }, { ...category, has_children }]
                
                const {  body: {items} } = await this.esService.createByBulk(ES_INDEX_CATEGORY, record, '');
                // const categoryID = items[0].index._id
                console.log('Create display_name: ' + category.display_name)
                if(has_children){
                    for(let children of category.children)
                    await this.createWithChildren(children)
                }
            }catch (err) {
                console.log(err)
            }
        }
        async reIndex(){
            try{
                let size = 50
                let from = 0
                let indexTotal = 0
                while(from < 300){
                    const { body: { 
                        hits: { 
                            total, 
                            hits 
                        } } } = await this.esService.findBySingleField(
                            ES_INDEX_CATEGORY, null, size, from,[{"id": "desc"}])
                    const count = total.value
                    if(count === 0) break
                  
                    for(let category of hits){
                        const { 
                            parents, 
                            parentName 
                        } = await this.createIndexByParentID(category._source.parent_id)
                        console.log('---->', category._id,    parents, 
                        parentName)
                        await this.esService.update(ES_INDEX_CATEGORY, category._id ,{
                            parents, parentName
                        }, '')
                        
                    }
                    indexTotal += count
                    console.log('from:' + from)
                    from++
                }
                return { indexTotal }
            }catch (err) {
                console.log(err)
            }
        }
        async createIndexByParentID(parent_id: number){
            let parents = []
            let parentName = []
            if(parent_id !== 0){
                let parentIDCheck = parent_id
                let k = 0
                while(k < 5){
                    let parent: any = await this.get(parentIDCheck)
                    if(parent === null) break
                    parents.push(parent.id)
                    parentName.push(parent.display_name)
                    if(parent.parent_id === 0)  break
                    parentIDCheck = parent.parent_id
                    k++
                }
            }
            return { parents, parentName }
        }
        async get(id: any){
            const { body: { 
                hits: { 
                    total, 
                    hits 
                } } } = await this.esService.findBySingleField(ES_INDEX_CATEGORY, {id}, 2, 0)
            const count = total.value

            if(count){
                delete hits[0]._source['children']
                return {...hits[0]._source}
            }else{
                console.log('[Alert] duplicate id', id)
            }
            return null
        }
        indicateBody() {
            return {
                settings: {
                    analysis: {
                        analyzer: {
                            autocomplete_analyzer: {
                                tokenizer: 'autocomplete',
                                filter: ['lowercase'],
                            },
                            autocomplete_search_analyzer: {
                                tokenizer: 'keyword',
                                filter: ['lowercase'],
                            },
                        },
                        tokenizer: {
                            autocomplete: {
                                type: 'edge_ngram',
                                min_gram: 1,
                                max_gram: 30,
                                token_chars: ['letter', 'digit', 'whitespace'],
                            },
                        },
                    },
                },
                mappings: {
                    properties: {
                        id:{ type: 'long'},
                        name: {
                            type: 'text',
                            fields: {
                                complete: {
                                    type: 'text',
                                    analyzer: 'autocomplete_analyzer',
                                    search_analyzer: 'autocomplete_search_analyzer',
                                },
                            },
                        },
                    }
                }
            }
        }

}


const getCategories = () => {
    return [{
            display_name: "Thời Trang Nữ",
            name: "Women Clothes",
            
            children: [{
                    
                    display_name: "Áo",
                    name: "Tops",

                    
                    children: [{
                            
                            display_name: "Áo hai dây và ba lỗ",
                            name: "Tanks & Camisoles",
                            
                            
                            children: [],
                            parent_id: 200099,
                            id: 200350
                        },
                        {
                            
                            display_name: "Áo ống",
                            name: "Tube Tops",
                            
                            
                            children: [],
                            parent_id: 200099,
                            id: 200351
                        },
                        {
                            
                            display_name: "Áo thun",
                            name: "T-shirts",
                            
                            
                            children: [],
                            parent_id: 200099,
                            id: 200352
                        },
                        {
                            
                            display_name: "Áo sơ mi",
                            name: "Shirts & Blouses",
                            
                            
                            children: [],
                            parent_id: 200099,
                            id: 200353
                        },
                        {
                            
                            display_name: "Áo polo",
                            name: "Polo Shirts",
                            
                            
                            children: [],
                            parent_id: 200099,
                            id: 200354
                        },
                        {
                            
                            display_name: "Áo liền thân",
                            name: "Bodysuits",
                            
                            
                            children: [],
                            parent_id: 200099,
                            id: 200355
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200099,
                            id: 200356
                        }
                    ],
                    parent_id: 100000,
                    id: 200099
                },
                {
                    
                    display_name: "Quần",
                    name: "Pants & Leggings",

                    
                    children: [{
                            
                            display_name: "Quần legging",
                            name: "Leggings & Treggings",
                            
                            
                            children: [],
                            parent_id: 200100,
                            id: 200357
                        },
                        {
                            
                            display_name: "Quần dài",
                            name: "Pants",
                            
                            
                            children: [],
                            parent_id: 200100,
                            id: 200358
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200100,
                            id: 200359
                        }
                    ],
                    parent_id: 100000,
                    id: 200100
                },
                {
                    
                    display_name: "Quần đùi",
                    name: "Shorts",

                    
                    children: [{
                            
                            display_name: "Quần đùi",
                            name: "Shorts",
                            
                            
                            children: [],
                            parent_id: 200101,
                            id: 200360
                        },
                        {
                            
                            display_name: "Quần váy",
                            name: "Skorts",
                            
                            
                            children: [],
                            parent_id: 200101,
                            id: 200361
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200101,
                            id: 200362
                        }
                    ],
                    parent_id: 100000,
                    id: 200101
                },
                {
                    
                    display_name: "Váy",
                    name: "Skirts",
                    
                    
                    children: [],
                    parent_id: 100000,
                    id: 200102
                },
                {
                    
                    display_name: "Quần jeans",
                    name: "Jeans",
                    
                    
                    children: [],
                    parent_id: 100000,
                    id: 200103
                },
                {
                    
                    display_name: "Đầm",
                    name: "Dresses",
                    
                    
                    children: [],
                    parent_id: 100000,
                    id: 200104
                },
                {
                    
                    display_name: "Váy cưới",
                    name: "Wedding Dresses",
                    
                    
                    children: [],
                    parent_id: 100000,
                    id: 200105
                },
                {
                    
                    display_name: "Đồ liền thân",
                    name: "Jumpsuits, Playsuits & Overalls",

                    
                    children: [{
                            
                            display_name: "Đồ bay (Jumpsuits)",
                            name: "Jumpsuits",
                            
                            
                            children: [],
                            parent_id: 200106,
                            id: 200363
                        },
                        {
                            
                            display_name: "Đồ bay ngắn (playsuits)",
                            name: "Playsuits",
                            
                            
                            children: [],
                            parent_id: 200106,
                            id: 200364
                        },
                        {
                            
                            display_name: "Quần yếm",
                            name: "Overalls",
                            
                            
                            children: [],
                            parent_id: 200106,
                            id: 200365
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200106,
                            id: 200366
                        }
                    ],
                    parent_id: 100000,
                    id: 200106
                },
                {
                    
                    display_name: "Áo khoác",
                    name: "Jackets, Coats & Vests",

                    
                    children: [{
                            
                            display_name: "Áo khoác mùa đông",
                            name: "Winter Jackets & Coats",
                            
                            
                            children: [],
                            parent_id: 200107,
                            id: 200367
                        },
                        {
                            
                            display_name: "Áo choàng",
                            name: "Capes",
                            
                            
                            children: [],
                            parent_id: 200107,
                            id: 200368
                        },
                        {
                            
                            display_name: "Áo blazer",
                            name: "Blazers",
                            
                            
                            children: [],
                            parent_id: 200107,
                            id: 200369
                        },
                        {
                            
                            display_name: "Áo khoác ngoài",
                            name: "Jackets",
                            
                            
                            children: [],
                            parent_id: 200107,
                            id: 200370
                        },
                        {
                            
                            display_name: "Áo vest",
                            name: "Vests",
                            
                            
                            children: [],
                            parent_id: 200107,
                            id: 200371
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200107,
                            id: 200372
                        }
                    ],
                    parent_id: 100000,
                    id: 200107
                },
                {
                    
                    display_name: "Áo len",
                    name: "Sweaters & Cardigans",
                    
                    
                    children: [],
                    parent_id: 100000,
                    id: 200108
                },
                {
                    
                    display_name: "Hoodie và Áo nỉ",
                    name: "Hoodies & Sweatshirts",

                    
                    children: [{
                            
                            display_name: "Áo khoác nỉ",
                            name: "Sweatshirts",
                            
                            
                            children: [],
                            parent_id: 200109,
                            id: 200373
                        },
                        {
                            
                            display_name: "Áo hoodies",
                            name: "Hoodies",
                            
                            
                            children: [],
                            parent_id: 200109,
                            id: 200374
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200109,
                            id: 200375
                        }
                    ],
                    parent_id: 100000,
                    id: 200109
                },
                {
                    
                    display_name: "Bộ",
                    name: "Sets",

                    
                    children: [{
                            
                            display_name: "Bộ đồ đôi",
                            name: "Couple Sets",
                            
                            
                            children: [],
                            parent_id: 200110,
                            id: 200376
                        },
                        {
                            
                            display_name: "Bộ đồ gia đình",
                            name: "Family Sets",
                            
                            
                            children: [],
                            parent_id: 200110,
                            id: 200377
                        },
                        {
                            
                            display_name: "Đồ lẻ",
                            name: "Individual Sets",
                            
                            
                            children: [],
                            parent_id: 200110,
                            id: 200378
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200110,
                            id: 200379
                        }
                    ],
                    parent_id: 100000,
                    id: 200110
                },
                {
                    
                    display_name: "Đồ lót",
                    name: "Lingerie & Underwear",

                    
                    children: [{
                            
                            display_name: "Bộ đồ lót",
                            name: "Sets",
                            
                            
                            children: [],
                            parent_id: 200111,
                            id: 200380
                        },
                        {
                            
                            display_name: "Áo ngực",
                            name: "Bras",
                            
                            
                            children: [],
                            parent_id: 200111,
                            id: 200381
                        },
                        {
                            
                            display_name: "Quần lót",
                            name: "Panties",
                            
                            
                            children: [],
                            parent_id: 200111,
                            id: 200382
                        },
                        {
                            
                            display_name: "Đồ lót giữ nhiệt",
                            name: "Thermal Innerwear",
                            
                            
                            children: [],
                            parent_id: 200111,
                            id: 200383
                        },
                        {
                            
                            display_name: "Phụ kiện đồ lót",
                            name: "Bra Accessories",
        
                            
                            children: [],
                            parent_id: 200111,
                            id: 200384
                        },
                        {
                            
                            display_name: "Đồ định hình",
                            name: "Shapewear",
                            
                            
                            children: [],
                            parent_id: 200111,
                            id: 200385
                        },
                        {
                            
                            display_name: "Đồ lót bảo hộ",
                            name: "Safety Pants",
                            
                            
                            children: [],
                            parent_id: 200111,
                            id: 200386
                        },
                        {
                            
                            display_name: "Đồ lót gợi cảm",
                            name: "Sexy Lingerie",
                            
                            
                            children: [],
                            parent_id: 200111,
                            id: 200387
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200111,
                            id: 200388
                        }
                    ],
                    parent_id: 100000,
                    id: 200111
                },
                {
                    
                    display_name: "Đồ ngủ",
                    name: "Sleepwear & Pajamas",

                    
                    children: [{
                            
                            display_name: "Pyjama",
                            name: "Pajamas",
                            
                            
                            children: [],
                            parent_id: 200112,
                            id: 200389
                        },
                        {
                            
                            display_name: "Váy ngủ",
                            name: "Night Dresses",
                            
                            
                            children: [],
                            parent_id: 200112,
                            id: 200390
                        },
                        {
                            
                            display_name: "Áo choàng ngủ, Áo khoác kimono",
                            name: "Kimonos & Robes",
                            
                            
                            children: [],
                            parent_id: 200112,
                            id: 200391
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200112,
                            id: 200392
                        }
                    ],
                    parent_id: 100000,
                    id: 200112
                },
                {
                    
                    display_name: "Đồ Bầu",
                    name: "Maternity Wear",

                    
                    children: [{
                            
                            display_name: "Áo ngực cho con bú",
                            name: "Nursing Bras",
                            
                            
                            children: [],
                            parent_id: 200113,
                            id: 200393
                        },
                        {
                            
                            display_name: "Đầm bầu",
                            name: "Maternity Dresses",
                            
                            
                            children: [],
                            parent_id: 200113,
                            id: 200394
                        },
                        {
                            
                            display_name: "Áo bầu",
                            name: "Maternity Tops",
                            
                            
                            children: [],
                            parent_id: 200113,
                            id: 200395
                        },
                        {
                            
                            display_name: "Đồ mặc cho con bú",
                            name: "Breastfeeding Wear",
                            
                            
                            children: [],
                            parent_id: 200113,
                            id: 200396
                        },
                        {
                            
                            display_name: "Bộ đồ bầu",
                            name: "Maternity Sets",
                            
                            
                            children: [],
                            parent_id: 200113,
                            id: 200397
                        },
                        {
                            
                            display_name: "Quần bầu, Váy bầu",
                            name: "Maternity Bottoms",
                            
                            
                            children: [],
                            parent_id: 200113,
                            id: 200398
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200113,
                            id: 200399
                        }
                    ],
                    parent_id: 100000,
                    id: 200113
                },
                {
                    
                    display_name: "Đồ truyền thống",
                    name: "Traditional Wear",

                    
                    children: [{
                            
                            display_name: "Áo",
                            name: "Tops",
                            
                            
                            children: [],
                            parent_id: 200114,
                            id: 200400
                        },
                        {
                            
                            display_name: "Quần và chân váy",
                            name: "Bottoms",
                            
                            
                            children: [],
                            parent_id: 200114,
                            id: 200401
                        },
                        {
                            
                            display_name: "Bộ",
                            name: "Sets",
                            
                            
                            children: [],
                            parent_id: 200114,
                            id: 200402
                        },
                        {
                            
                            display_name: "Đầm",
                            name: "Dresses",
                            
                            
                            children: [],
                            parent_id: 200114,
                            id: 200403
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200114,
                            id: 200404
                        }
                    ],
                    parent_id: 100000,
                    id: 200114
                },
                {
                    
                    display_name: "Đồ hóa trang",
                    name: "Costumes",
                    
                    
                    children: [],
                    parent_id: 100000,
                    id: 200115
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 100000,
                    id: 200116
                },
                {
                    
                    display_name: "Vải",
                    name: "Fabric",

                    
                    children: [{
                            
                            display_name: "Vải cotton",
                            name: "Cotton",
                            
                            
                            children: [],
                            parent_id: 200117,
                            id: 200407
                        },
                        {
                            
                            display_name: "Vải len",
                            name: "Wool",
                            
                            
                            children: [],
                            parent_id: 200117,
                            id: 200408
                        },
                        {
                            
                            display_name: "Vải nhung, lụa, satin",
                            name: "Velvet, Silk & Satin",
                            
                            
                            children: [],
                            parent_id: 200117,
                            id: 200409
                        },
                        {
                            
                            display_name: "Vải da",
                            name: "Leather",
                            
                            
                            children: [],
                            parent_id: 200117,
                            id: 200410
                        },
                        {
                            
                            display_name: "Vải nylon",
                            name: "Vinyl & Nylon",
                            
                            
                            children: [],
                            parent_id: 200117,
                            id: 200411
                        },
                        {
                            
                            display_name: "Vải denim",
                            name: "Denim",
                            
                            
                            children: [],
                            parent_id: 200117,
                            id: 200412
                        },
                        {
                            
                            display_name: "Vải canvas",
                            name: "Canvas",
                            
                            
                            children: [],
                            parent_id: 200117,
                            id: 200413
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200117,
                            id: 200416
                        }
                    ],
                    parent_id: 100000,
                    id: 200117
                },
                {
                    
                    display_name: "Vớ/ Tất",
                    name: "Socks & Stockings",

                    
                    children: [{
                            
                            display_name: "Tất",
                            name: "Socks",
                            
                            
                            children: [],
                            parent_id: 200118,
                            id: 200417
                        },
                        {
                            
                            display_name: "Quần tất",
                            name: "Pantyhose",
                            
                            
                            children: [],
                            parent_id: 200118,
                            id: 200418
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200118,
                            id: 200419
                        }
                    ],
                    parent_id: 100000,
                    id: 200118
                }
            ],
            parent_id: 0,
            id: 100000
        },
        {

            display_name: "Thời Trang Nam",
            name: "Men Clothes",

            
            children: [{
                    
                    display_name: "Quần jean",
                    name: "Jeans",
                    
                    
                    children: [],
                    parent_id: 200011,
                    id: 200047
                },  
                {
                    
                    display_name: "Hoodie & Áo nỉ",
                    name: "Hoodies & Sweatshirts",

                    
                    children: [{
                            
                            display_name: "Áo hoodie",
                            name: "Hoodies",
                            
                            
                            children: [],
                            parent_id: 200048,
                            id: 200226
                        },
                        {
                            
                            display_name: "Áo nỉ",
                            name: "Sweatshirts",
                            
                            
                            children: [],
                            parent_id: 200048,
                            id: 200227
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200048,
                            id: 200228
                        }
                    ],
                    parent_id: 200011,
                    id: 200048
                },
                {
                    
                    display_name: "Áo len",
                    name: "Sweaters & Cardigans",
                    
                    
                    children: [],
                    parent_id: 200011,
                    id: 200049
                },
                {
                    
                    display_name: "Áo khoác",
                    name: "Jackets, Coats & Vests",

                    
                    children: [{
                            
                            display_name: "Áo khoác mùa đông & Áo choàng",
                            name: "Winter Jackets & Coats",
                            
                            
                            children: [],
                            parent_id: 200050,
                            id: 200229
                        },
                        {
                            
                            display_name: "Áo khoác",
                            name: "Jackets",
                            
                            
                            children: [],
                            parent_id: 200050,
                            id: 200230
                        },
                        {
                            
                            display_name: "Áo khoác vest",
                            name: "Vests",
                            
                            
                            children: [],
                            parent_id: 200050,
                            id: 200231
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200050,
                            id: 200232
                        }
                    ],
                    parent_id: 200011,
                    id: 200050
                },
                {
                    
                    display_name: "Com lê",
                    name: "Suits",

                    
                    children: [{
                            
                            display_name: "Bộ Com lê",
                            name: "Suit Sets",
                            
                            
                            children: [],
                            parent_id: 200051,
                            id: 200233
                        },
                        {
                            
                            display_name: "Áo Khoác & Blazer",
                            name: "Suit Jackets & Blazers",
                            
                            
                            children: [],
                            parent_id: 200051,
                            id: 200234
                        },
                        {
                            
                            display_name: "Quần âu",
                            name: "Suit Pants",
                            
                            
                            children: [],
                            parent_id: 200051,
                            id: 200235
                        },
                        {
                            
                            display_name: "Áo vest & Gi lê",
                            name: "Suit Vests & Waistcoats",
                            
                            
                            children: [],
                            parent_id: 200051,
                            id: 200236
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200051,
                            id: 200237
                        }
                    ],
                    parent_id: 200011,
                    id: 200051
                },
                {
                    
                    display_name: "Quần dài",
                    name: "Pants",

                    
                    children: [{
                            
                            display_name: "Quần túi hộp",
                            name: "Cargo",
                            
                            
                            children: [],
                            parent_id: 200052,
                            id: 200238
                        },
                        {
                            
                            display_name: "Quần jogger",
                            name: "Joggers",
                            
                            
                            children: [],
                            parent_id: 200052,
                            id: 200239
                        },
                        {
                            
                            display_name: "Quần dài",
                            name: "Pants",
                            
                            
                            children: [],
                            parent_id: 200052,
                            id: 200240
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200052,
                            id: 200241
                        }
                    ],
                    parent_id: 200011,
                    id: 200052
                },
                {
                    
                    display_name: "Quần đùi",
                    name: "Shorts",
                    
                    
                    children: [],
                    parent_id: 200011,
                    id: 200053
                },
                {
                    
                    display_name: "Áo",
                    name: "Tops",

                    
                    children: [{
                            
                            display_name: "Áo sơ mi",
                            name: "Shirts",
                            
                            
                            children: [],
                            parent_id: 200054,
                            id: 200242
                        },
                        {
                            
                            display_name: "Áo polo",
                            name: "Polo Shirts",
                            
                            
                            children: [],
                            parent_id: 200054,
                            id: 200243
                        },
                        {
                            
                            display_name: "Áo thun",
                            name: "T-Shirts",
                            
                            
                            children: [],
                            parent_id: 200054,
                            id: 200244
                        },
                        {
                            
                            display_name: "Áo ba lỗ",
                            name: "Tanks",
                            
                            
                            children: [],
                            parent_id: 200054,
                            id: 200245
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200054,
                            id: 200246
                        }
                    ],
                    parent_id: 200011,
                    id: 200054
                },
                {
                    
                    display_name: "Đồ lót",
                    name: "Innerwear & Underwear",

                    
                    children: [{
                            
                            display_name: "Quần lót",
                            name: "Underwear",
                            
                            
                            children: [],
                            parent_id: 200055,
                            id: 200247
                        },
                        {
                            
                            display_name: "Áo lót",
                            name: "Undershirts",
                            
                            
                            children: [],
                            parent_id: 200055,
                            id: 200248
                        },
                        {
                            
                            display_name: "Đồ lót giữ nhiệt",
                            name: "Thermal Innerwear",
                            
                            
                            children: [],
                            parent_id: 200055,
                            id: 200249
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200055,
                            id: 200250
                        }
                    ],
                    parent_id: 200011,
                    id: 200055
                },
                {
                    
                    display_name: "Đồ ngủ",
                    name: "Sleepwear",
                    
                    
                    children: [],
                    parent_id: 200011,
                    id: 200056
                },
                {
                    
                    display_name: "Bộ",
                    name: "Sets",
                    
                    
                    children: [],
                    parent_id: 200011,
                    id: 200057
                },
                {
                    
                    display_name: "Trang phục truyền thống",
                    name: "Traditional Wear",

                    
                    children: [{
                            
                            display_name: "Áo",
                            name: "Tops",
                            
                            
                            children: [],
                            parent_id: 200058,
                            id: 200251
                        },
                        {
                            
                            display_name: "Quần",
                            name: "Bottoms",
                            
                            
                            children: [],
                            parent_id: 200058,
                            id: 200252
                        },
                        {
                            
                            display_name: "Bộ",
                            name: "Sets",
                            
                            
                            children: [],
                            parent_id: 200058,
                            id: 200253
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200058,
                            id: 200254
                        }
                    ],
                    parent_id: 200011,
                    id: 200058
                },
                {
                    
                    display_name: "Đồ hóa trang",
                    name: "Costumes",
                    
                    
                    children: [],
                    parent_id: 200011,
                    id: 200059
                },
                {
                    
                    display_name: "Trang phục ngành nghề",
                    name: "Occupational Attire",
                    
                    
                    children: [],
                    parent_id: 200011,
                    id: 200060
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200011,
                    id: 200061
                },
                {
                    
                    display_name: "Vớ/ Tất",
                    name: "Socks",
                    
                    
                    children: [],
                    parent_id: 200011,
                    id: 200062
                }
            ],
            parent_id: 0,
            id: 200011
        },
        {

            display_name: "Sắc Đẹp",
            name: "Beauty",

            
            children: [{
                    
                    display_name: "Chăm sóc tay, chân & móng",
                    name: "Hand, Foot & Nail Care",

                    
                    children: [{
                            
                            display_name: "Chăm sóc tay",
                            name: "Hand Care",
        
                            
                            children: [],
                            parent_id: 200658,
                            id: 200865
                        },
                        {
                            
                            display_name: "Chăm sóc chân",
                            name: "Foot Care",
        
                            
                            children: [],
                            parent_id: 200658,
                            id: 200866
                        },
                        {
                            
                            display_name: "Chăm sóc móng",
                            name: "Nail Care",
        
                            
                            children: [],
                            parent_id: 200658,
                            id: 200867
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200658,
                            id: 200868
                        }
                    ],
                    parent_id: 200630,
                    id: 200658
                },
                {
                    
                    display_name: "Chăm sóc tóc",
                    name: "Hair Care",

                    
                    children: [{
                            
                            display_name: "Dầu gội",
                            name: "Shampoo",
                            
                            
                            children: [],
                            parent_id: 200659,
                            id: 200869
                        },
                        {
                            
                            display_name: "Thuốc nhuộm tóc",
                            name: "Hair Colour",
                            
                            
                            children: [],
                            parent_id: 200659,
                            id: 200870
                        },
                        {
                            
                            display_name: "Sản phẩm dưỡng tóc",
                            name: "Hair Treatment",
                            
                            
                            children: [],
                            parent_id: 200659,
                            id: 200871
                        },
                        {
                            
                            display_name: "Dầu xả",
                            name: "Hair and Scalp Conditioner",
                            
                            
                            children: [],
                            parent_id: 200659,
                            id: 200872
                        },
                        {
                            
                            display_name: "Sản phẩm tạo kiểu tóc",
                            name: "Hair Styling",
                            
                            
                            children: [],
                            parent_id: 200659,
                            id: 200873
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200659,
                            id: 200874
                        }
                    ],
                    parent_id: 200630,
                    id: 200659
                },
                {
                    
                    display_name: "Chăm sóc nam giới",
                    name: "Men's Care",

                    
                    children: [{
                            
                            display_name: "Sữa tắm & chăm sóc cơ thể",
                            name: "Bath & Body Care",
                            
                            
                            children: [],
                            parent_id: 200660,
                            id: 200875
                        },
                        {
                            
                            display_name: "Chăm sóc da",
                            name: "Skincare",
        
                            
                            children: [],
                            parent_id: 200660,
                            id: 200876
                        },
                        {
                            
                            display_name: "Sản phẩm cạo râu & hớt tóc",
                            name: "Shaving & Grooming",
        
                            
                            children: [],
                            parent_id: 200660,
                            id: 200877
                        },
                        {
                            
                            display_name: "Chăm sóc tóc",
                            name: "Hair Care",
                            
                            
                            children: [],
                            parent_id: 200660,
                            id: 200878
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200660,
                            id: 200879
                        }
                    ],
                    parent_id: 200630,
                    id: 200660
                },
                {
                    
                    display_name: "Nước hoa",
                    name: "Perfumes & Fragrances",
                    
                    
                    children: [],
                    parent_id: 200630,
                    id: 200661
                },
                {
                    
                    display_name: "Trang điểm",
                    name: "Makeup",

                    
                    children: [{
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200662,
                            id: 200880
                        },
                        {
                            
                            display_name: "Trang điểm mặt",
                            name: "Face",
        
                            
                            children: [],
                            parent_id: 200662,
                            id: 200881
                        },
                        {
                            
                            display_name: "Trang điểm mắt",
                            name: "Eyes",
        
                            
                            children: [],
                            parent_id: 200662,
                            id: 200882
                        },
                        {
                            
                            display_name: "Trang điểm môi",
                            name: "Lips",
        
                            
                            children: [],
                            parent_id: 200662,
                            id: 200883
                        },
                        {
                            
                            display_name: "Tẩy trang",
                            name: "Makeup Removers",
                            
                            
                            children: [],
                            parent_id: 200662,
                            id: 200884
                        }
                    ],
                    parent_id: 200630,
                    id: 200662
                },
                {
                    
                    display_name: "Dụng cụ làm đẹp",
                    name: "Beauty Tools",

                    
                    children: [{
                            
                            display_name: "Dụng cụ trang điểm",
                            name: "Makeup Accessories",
        
                            
                            children: [],
                            parent_id: 200663,
                            id: 200885
                        },
                        {
                            
                            display_name: "Dụng cụ chăm sóc da mặt",
                            name: "Facial Care Tools",
        
                            
                            children: [],
                            parent_id: 200663,
                            id: 200886
                        },
                        {
                            
                            display_name: "Dụng cụ làm thon gọn cơ thể",
                            name: "Body Slimming Tools",
                            
                            
                            children: [],
                            parent_id: 200663,
                            id: 200887
                        },
                        {
                            
                            display_name: "Dụng cụ tẩy lông",
                            name: "Hair Removal Tools",
                            
                            
                            children: [],
                            parent_id: 200663,
                            id: 200888
                        },
                        {
                            
                            display_name: "Dụng cụ chăm sóc tóc",
                            name: "Hair Tools",
        
                            
                            children: [],
                            parent_id: 200663,
                            id: 200889
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200663,
                            id: 200890
                        }
                    ],
                    parent_id: 200630,
                    id: 200663
                },
                {
                    
                    display_name: "Chăm sóc da mặt",
                    name: "Skincare",

                    
                    children: [{
                            
                            display_name: "Sữa rửa mặt",
                            name: "Facial Cleanser",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200891
                        },
                        {
                            
                            display_name: "Nước cân bằng da",
                            name: "Toner",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200892
                        },
                        {
                            
                            display_name: "Kem dưỡng ẩm",
                            name: "Facial Moisturizer",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200893
                        },
                        {
                            
                            display_name: "Dầu dưỡng ẩm",
                            name: "Facial Oil",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200894
                        },
                        {
                            
                            display_name: "Xịt khoáng",
                            name: "Facial Mist",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200895
                        },
                        {
                            
                            display_name: "Tinh chất dưỡng",
                            name: "Facial Serum & Essence",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200896
                        },
                        {
                            
                            display_name: "Tẩy tế bào chết",
                            name: "Face Scrub & Peel",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200897
                        },
                        {
                            
                            display_name: "Mặt nạ",
                            name: "Face Mask & Packs",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200898
                        },
                        {
                            
                            display_name: "Sản phẩm dưỡng mắt",
                            name: "Eye Treatment",
        
                            
                            children: [],
                            parent_id: 200664,
                            id: 200899
                        },
                        {
                            
                            display_name: "Sản phẩm dưỡng môi",
                            name: "Lip Treatment",
        
                            
                            children: [],
                            parent_id: 200664,
                            id: 200900
                        },
                        {
                            
                            display_name: "Kem chống nắng cho mặt",
                            name: "Face Sunscreen",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200901
                        },
                        {
                            
                            display_name: "Kem dưỡng sau chống nắng",
                            name: "After Sun Face Care",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200902
                        },
                        {
                            
                            display_name: "Giấy thấm dầu",
                            name: "Blotting Paper",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200903
                        },
                        {
                            
                            display_name: "Sản phẩm trị mụn",
                            name: "Acne Treatment",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200904
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200905
                        }
                    ],
                    parent_id: 200630,
                    id: 200664
                },
                {
                    
                    display_name: "Bộ sản phẩm làm đẹp",
                    name: "Beauty Sets & Packages",
                    
                    
                    children: [],
                    parent_id: 200630,
                    id: 200665
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200630,
                    id: 200666
                },
                {
                    
                    display_name: "Tắm & chăm sóc cơ thể",
                    name: "Bath & Body Care",

                    
                    children: [{
                            
                            display_name: "Xà phòng & sữa tắm",
                            name: "Body Wash & Soap",
                            
                            
                            children: [],
                            parent_id: 202002,
                            id: 202003
                        },
                        {
                            
                            display_name: "Tẩy tế bào chết cơ thể",
                            name: "Body Scrub & Peel",
                            
                            
                            children: [],
                            parent_id: 202002,
                            id: 202004
                        },
                        {
                            
                            display_name: "Mặt nạ ủ cơ thể",
                            name: "Body Masks",
                            
                            
                            children: [],
                            parent_id: 202002,
                            id: 202005
                        },
                        {
                            
                            display_name: "Dầu dưỡng da",
                            name: "Body Oil",
                            
                            
                            children: [],
                            parent_id: 202002,
                            id: 202006
                        },
                        {
                            
                            display_name: "Kem & sữa dưỡng thể",
                            name: "Body Cream, Lotion & Butter",
                            
                            
                            children: [],
                            parent_id: 202002,
                            id: 202007
                        },
                        {
                            
                            display_name: "Khử mùi cơ thể",
                            name: "Body Deodorants",
                            
                            
                            children: [],
                            parent_id: 202002,
                            id: 202008
                        },
                        {
                            
                            display_name: "Dầu massage",
                            name: "Massage Oil",
                            
                            
                            children: [],
                            parent_id: 202002,
                            id: 202009
                        },
                        {
                            
                            display_name: "Kem tẩy lông & wax lông",
                            name: "Hair Removal Cream & Wax",
                            
                            
                            children: [],
                            parent_id: 202002,
                            id: 202010
                        },
                        {
                            
                            display_name: "Chống nắng",
                            name: "Sun Care",
        
                            
                            children: [],
                            parent_id: 202002,
                            id: 202011
                        },
                        {
                            
                            display_name: "Chăm sóc ngực",
                            name: "Breast Care",
                            
                            
                            children: [],
                            parent_id: 202002,
                            id: 202012
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 202002,
                            id: 202013
                        }
                    ],
                    parent_id: 200630,
                    id: 202002
                }
            ],
            parent_id: 0,
            id: 200630
        },
        {

            display_name: "Sức Khỏe",
            name: "Health",

            
            children: [{
                    
                    display_name: "Thực phẩm chức năng",
                    name: "Food Supplement",

                    
                    children: [{
                            
                            display_name: "Hỗ trợ kiểm soát cân nặng",
                            name: "Weight Management",
                            
                            
                            children: [],
                            parent_id: 200002,
                            id: 200003
                        },
                        {
                            
                            display_name: "Hỗ trợ làm đẹp",
                            name: "Beauty Supplements",
                            
                            
                            children: [],
                            parent_id: 200002,
                            id: 200004
                        },
                        {
                            
                            display_name: "Hỗ trợ tăng cơ",
                            name: "Fitness",
                            
                            
                            children: [],
                            parent_id: 200002,
                            id: 200005
                        },
                        {
                            
                            display_name: "Hỗ trợ sức khỏe",
                            name: "Well Being",
                            
                            
                            children: [],
                            parent_id: 200002,
                            id: 200006
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200002,
                            id: 200007
                        }
                    ],
                    parent_id: 200001,
                    id: 200002
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200001,
                    id: 200008
                },
                {
                    
                    display_name: "Vật tư y tế",
                    name: "Medical Supplies",

                    
                    children: [{
                            
                            display_name: "Thuốc không kê đơn",
                            name: "Over-the-counter Medicine",
                            
                            
                            children: [],
                            parent_id: 200018,
                            id: 200119
                        },
                        {
                            
                            display_name: "Thuốc gia truyền",
                            name: "Traditional Medicine",
                            
                            
                            children: [],
                            parent_id: 200018,
                            id: 200120
                        },
                        {
                            
                            display_name: "Kiểm tra và theo dõi sức khỏe",
                            name: "Health Monitors & Tests",
        
                            
                            children: [],
                            parent_id: 200018,
                            id: 200121
                        },
                        {
                            
                            display_name: "Cân sức khỏe và phân tích cơ thể",
                            name: "Scale & Body Fat Analyzers",
                            
                            
                            children: [],
                            parent_id: 200018,
                            id: 200122
                        },
                        {
                            
                            display_name: "Chăm sóc mũi",
                            name: "Nasal Care",
                            
                            
                            children: [],
                            parent_id: 200018,
                            id: 200123
                        },
                        {
                            
                            display_name: "Dụng cụ sơ cứu",
                            name: "First Aid Supplies",
        
                            
                            children: [],
                            parent_id: 200018,
                            id: 200124
                        },
                        {
                            
                            display_name: "Ống nghe y tế",
                            name: "Stethoscopes",
                            
                            
                            children: [],
                            parent_id: 200018,
                            id: 200125
                        },
                        {
                            
                            display_name: "Thuốc giảm đau",
                            name: "Pain Relievers",
                            
                            
                            children: [],
                            parent_id: 200018,
                            id: 200126
                        },
                        {
                            
                            display_name: "Dụng cụ thí nghiệm",
                            name: "Laboratory Tools",
                            
                            
                            children: [],
                            parent_id: 200018,
                            id: 200127
                        },
                        {
                            
                            display_name: "Bao tay và khẩu trang y tế",
                            name: "Medical Gloves & Masks",
                            
                            
                            children: [],
                            parent_id: 200018,
                            id: 200128
                        },
                        {
                            
                            display_name: "Hỗ trợ chấn thương và khuyết tật",
                            name: "Injury & Disability Support",
        
                            
                            children: [],
                            parent_id: 200018,
                            id: 200129
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200018,
                            id: 200130
                        }
                    ],
                    parent_id: 200001,
                    id: 200018
                },
                {
                    
                    display_name: "Chăm sóc cá nhân",
                    name: "Personal Care",

                    
                    children: [{
                            
                            display_name: "Dung dịch sát khuẩn tay",
                            name: "Hand Sanitizers",
                            
                            
                            children: [],
                            parent_id: 200019,
                            id: 200131
                        },
                        {
                            
                            display_name: "Chăm sóc mắt",
                            name: "Eye Care",
        
                            
                            children: [],
                            parent_id: 200019,
                            id: 200132
                        },
                        {
                            
                            display_name: "Chăm sóc tai",
                            name: "Ear Care",
                            
                            
                            children: [],
                            parent_id: 200019,
                            id: 200133
                        },
                        {
                            
                            display_name: "Vệ sinh răng miệng",
                            name: "Oral Care",
        
                            
                            children: [],
                            parent_id: 200019,
                            id: 200134
                        },
                        {
                            
                            display_name: "Tã người lớn",
                            name: "Adult Diapers & Incontinence",
                            
                            
                            children: [],
                            parent_id: 200019,
                            id: 200135
                        },
                        {
                            
                            display_name: "Chăm sóc phụ nữ",
                            name: "Feminine Care",
        
                            
                            children: [],
                            parent_id: 200019,
                            id: 200136
                        },
                        {
                            
                            display_name: "Dụng cụ massage và trị liệu",
                            name: "Massage & Therapy Devices",
                            
                            
                            children: [],
                            parent_id: 200019,
                            id: 200137
                        },
                        {
                            
                            display_name: "Chống muỗi & xua đuổi côn trùng",
                            name: "Insect Repellents",
                            
                            
                            children: [],
                            parent_id: 200019,
                            id: 200138
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200019,
                            id: 200139
                        }
                    ],
                    parent_id: 200001,
                    id: 200019
                },
                {
                    
                    display_name: "Hỗ trợ tình dục",
                    name: "Sexual Wellness",

                    
                    children: [{
                            
                            display_name: "Bao cao su",
                            name: "Condoms",
                            
                            
                            children: [],
                            parent_id: 200020,
                            id: 200140
                        },
                        {
                            
                            display_name: "Bôi trơn",
                            name: "Lubricants",
                            
                            
                            children: [],
                            parent_id: 200020,
                            id: 200141
                        },
                        {
                            
                            display_name: "Tăng cường sinh lý",
                            name: "Performance Enhancement",
                            
                            
                            children: [],
                            parent_id: 200020,
                            id: 200143
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200020,
                            id: 200144
                        }
                    ],
                    parent_id: 200001,
                    id: 200020
                }
            ],
            parent_id: 0,
            id: 200001
        },
        {

            display_name: "Phụ Kiện Thời Trang",
            name: "Fashion Accessories",

            
            children: [{
                    
                    display_name: "Nhẫn",
                    name: "Rings",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200021
                },
                {
                    
                    display_name: "Bông tai",
                    name: "Earrings",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200022
                },
                {
                    
                    display_name: "Khăn choàng",
                    name: "Scarves & Shawls",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200023
                },
                {
                    
                    display_name: "Găng tay",
                    name: "Gloves",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200024
                },
                {
                    
                    display_name: "Phụ kiện tóc",
                    name: "Hair Accessories",

                    
                    children: [{
                            
                            display_name: "Băng đô tóc",
                            name: "Headbands",
                            
                            
                            children: [],
                            parent_id: 200025,
                            id: 200145
                        },
                        {
                            
                            display_name: "Đồ buộc tóc & Nơ",
                            name: "Hair Ties, Ribbons & Scrunchies",
                            
                            
                            children: [],
                            parent_id: 200025,
                            id: 200146
                        },
                        {
                            
                            display_name: "Kẹp tóc",
                            name: "Hair Clips & Hair Pins",
                            
                            
                            children: [],
                            parent_id: 200025,
                            id: 200147
                        },
                        {
                            
                            display_name: "Tóc giả & Tóc nối",
                            name: "Wigs & Extensions",
                            
                            
                            children: [],
                            parent_id: 200025,
                            id: 200148
                        },
                        {
                            
                            display_name: "Cài tóc, vương miện cài tóc",
                            name: "Headpieces, Tiaras & Flower Crowns",
                            
                            
                            children: [],
                            parent_id: 200025,
                            id: 200149
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200025,
                            id: 200150
                        }
                    ],
                    parent_id: 200009,
                    id: 200025
                },
                {
                    
                    display_name: "Vòng tay & Lắc tay",
                    name: "Bracelets & Bangles",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200026
                },
                {
                    
                    display_name: "Lắc chân",
                    name: "Anklets",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200027
                },
                {
                    
                    display_name: "Mũ",
                    name: "Hats & Caps",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200028
                },
                {
                    
                    display_name: "Dây chuyền",
                    name: "Necklaces",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200029
                },
                {
                    
                    display_name: "Kính mắt",
                    name: "Eyewear",

                    
                    children: [{
                            
                            display_name: "Kính mát",
                            name: "Sunglasses",
                            
                            
                            children: [],
                            parent_id: 200030,
                            id: 200151
                        },
                        {
                            
                            display_name: "Gọng kính",
                            name: "Frames & Glasses",
                            
                            
                            children: [],
                            parent_id: 200030,
                            id: 200152
                        },
                        {
                            
                            display_name: "Hộp kính và phụ kiện",
                            name: "Eyewear Cases & Accessories",
                            
                            
                            children: [],
                            parent_id: 200030,
                            id: 200153
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200030,
                            id: 200154
                        }
                    ],
                    parent_id: 200009,
                    id: 200030
                },
                {
                    
                    display_name: "Kim loại quý",
                    name: "Investment Precious Metals",

                    
                    children: [{
                            
                            display_name: "Platinum & Vàng",
                            name: "Platinum & K Gold",
                            
                            
                            children: [],
                            parent_id: 200031,
                            id: 200155
                        },
                        {
                            
                            display_name: "Bạc",
                            name: "Silver",
                            
                            
                            children: [],
                            parent_id: 200031,
                            id: 200156
                        },
                        {
                            
                            display_name: "Kim cương",
                            name: "Diamond",
                            
                            
                            children: [],
                            parent_id: 200031,
                            id: 200157
                        },
                        {
                            
                            display_name: "Ngọc bích, Cẩm thạch",
                            name: "Jade",
                            
                            
                            children: [],
                            parent_id: 200031,
                            id: 200158
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200031,
                            id: 200159
                        }
                    ],
                    parent_id: 200009,
                    id: 200031
                },
                {
                    
                    display_name: "Thắt lưng",
                    name: "Belts",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200032
                },
                {
                    
                    display_name: "Cà vạt & Nơ cổ",
                    name: "Neckties, Bow Ties & Cravats",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200033
                },
                {
                    
                    display_name: "Phụ kiện thêm",
                    name: "Additional Accessories",

                    
                    children: [{
                            
                            display_name: "Trâm & Ghim cài áo",
                            name: "Brooches & Pins",
                            
                            
                            children: [],
                            parent_id: 200034,
                            id: 200160
                        },
                        {
                            
                            display_name: "Miếng vá áo",
                            name: "Patches",
                            
                            
                            children: [],
                            parent_id: 200034,
                            id: 200161
                        },
                        {
                            
                            display_name: "Mặt dây chuyền và Charm",
                            name: "Charms, Pendants & Ornaments",
                            
                            
                            children: [],
                            parent_id: 200034,
                            id: 200162
                        },
                        {
                            
                            display_name: "Măng set nam",
                            name: "Cufflinks",
                            
                            
                            children: [],
                            parent_id: 200034,
                            id: 200163
                        },
                        {
                            
                            display_name: "Hình xăm dán",
                            name: "Tattoos",
                            
                            
                            children: [],
                            parent_id: 200034,
                            id: 200164
                        },
                        {
                            
                            display_name: "Khẩu trang thời trang",
                            name: "Masks",
                            
                            
                            children: [],
                            parent_id: 200034,
                            id: 200165
                        },
                        {
                            
                            display_name: "Khăn tay",
                            name: "Handkerchiefs",
                            
                            
                            children: [],
                            parent_id: 200034,
                            id: 200166
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200034,
                            id: 200167
                        }
                    ],
                    parent_id: 200009,
                    id: 200034
                },
                {
                    
                    display_name: "Bộ phụ kiện",
                    name: "Accessories Sets & Packages",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200035
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200036
                }
            ],
            parent_id: 0,
            id: 200009
        },
        {

            display_name: "Thiết Bị Điện Gia Dụng",
            name: "Home Appliances",

            
            children: [{
                    
                    display_name: "Máy chiếu & Phụ kiện",
                    name: "Projectors & Accessories",

                    
                    children: [{
                            
                            display_name: "Máy chiếu & Màn hình chiếu",
                            name: "Projectors & Projector Screens",
                            
                            
                            children: [],
                            parent_id: 200037,
                            id: 200168
                        },
                        {
                            
                            display_name: "Bút trình chiếu",
                            name: "Pointers",
                            
                            
                            children: [],
                            parent_id: 200037,
                            id: 200169
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200037,
                            id: 200170
                        }
                    ],
                    parent_id: 200010,
                    id: 200037
                },
                {
                    
                    display_name: "Thiết bị điện gia dụng nhỏ",
                    name: "Small Household Appliances",

                    
                    children: [{
                            
                            display_name: "Thiết bị vệ sinh chân & Thư giãn",
                            name: "Foot Baths & Spas",
                            
                            
                            children: [],
                            parent_id: 200038,
                            id: 200171
                        },
                        {
                            
                            display_name: "Máy tăm nước",
                            name: "Water Flossers",
                            
                            
                            children: [],
                            parent_id: 200038,
                            id: 200172
                        },
                        {
                            
                            display_name: "Máy may & Phụ kiện",
                            name: "Sewing Machines & Accessories",
                            
                            
                            children: [],
                            parent_id: 200038,
                            id: 200173
                        },
                        {
                            
                            display_name: "Điện thoại",
                            name: "Telephones",
        
                            
                            children: [],
                            parent_id: 200038,
                            id: 200174
                        },
                        {
                            
                            display_name: "Bàn là khô & Hơi nước",
                            name: "Irons & Steamers",
                            
                            
                            children: [],
                            parent_id: 200038,
                            id: 200175
                        },
                        {
                            
                            display_name: "Thiết bị xử lí không khí",
                            name: "Air Treatment",
        
                            
                            children: [],
                            parent_id: 200038,
                            id: 200176
                        },
                        {
                            
                            display_name: "Máy hút bụi & Thiết bị làm sạch sàn",
                            name: "Vacuum Cleaners & Floor Care Appliances",
                            
                            
                            children: [],
                            parent_id: 200038,
                            id: 200177
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200038,
                            id: 200178
                        }
                    ],
                    parent_id: 200010,
                    id: 200038
                },
                {
                    
                    display_name: "Thiết bị điện gia dụng lớn",
                    name: "Large Household Appliances",

                    
                    children: [{
                            
                            display_name: "Máy giặt & Máy sấy",
                            name: "Washing Machines & Dryers",
        
                            
                            children: [],
                            parent_id: 200039,
                            id: 200179
                        },
                        {
                            
                            display_name: "Máy nước nóng",
                            name: "Water Heaters",
                            
                            
                            children: [],
                            parent_id: 200039,
                            id: 200180
                        },
                        {
                            
                            display_name: "Thiết bị làm mát",
                            name: "Cooling",
        
                            
                            children: [],
                            parent_id: 200039,
                            id: 200181
                        },
                        {
                            
                            display_name: "Thiết bị sấy khô nệm & Giày",
                            name: "Futon & Shoe Dryers",
                            
                            
                            children: [],
                            parent_id: 200039,
                            id: 200182
                        },
                        {
                            
                            display_name: "Máy sưởi",
                            name: "Heaters",
                            
                            
                            children: [],
                            parent_id: 200039,
                            id: 200183
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200039,
                            id: 200184
                        }
                    ],
                    parent_id: 200010,
                    id: 200039
                },
                {
                    
                    display_name: "Tivi & Phụ kiện",
                    name: "TVs & Accessories",

                    
                    children: [{
                            
                            display_name: "Tivi",
                            name: "TVs",
                            
                            
                            children: [],
                            parent_id: 200040,
                            id: 200185
                        },
                        {
                            
                            display_name: "Ăng ten Tivi",
                            name: "TV Antennas",
                            
                            
                            children: [],
                            parent_id: 200040,
                            id: 200186
                        },
                        {
                            
                            display_name: "Tivi box & Đầu thu kĩ thuật số",
                            name: "TV Boxes & Receivers",
                            
                            
                            children: [],
                            parent_id: 200040,
                            id: 200187
                        },
                        {
                            
                            display_name: "Giá treo tivi",
                            name: "TV Brackets",
                            
                            
                            children: [],
                            parent_id: 200040,
                            id: 200188
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200040,
                            id: 200189
                        }
                    ],
                    parent_id: 200010,
                    id: 200040
                },
                {
                    
                    display_name: "Đồ gia dụng nhà bếp",
                    name: "Kitchen Appliances",

                    
                    children: [{
                            
                            display_name: "Máy lọc nước",
                            name: "Water Filters, Coolers & Dispensers",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200190
                        },
                        {
                            
                            display_name: "Ấm đun siêu tốc",
                            name: "Kettles",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200191
                        },
                        {
                            
                            display_name: "Tủ ủ rượu",
                            name: "Wine Fridges",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200192
                        },
                        {
                            
                            display_name: "Máy ép, Xay sinh tố & Máy làm sữa đậu nành",
                            name: "Juicers, Blenders & Soya Bean Machines",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200193
                        },
                        {
                            
                            display_name: "Máy pha cà phê & Phụ kiện",
                            name: "Coffee Machines & Accessories",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200194
                        },
                        {
                            
                            display_name: "Máy trộn thực phẩm",
                            name: "Mixers",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200195
                        },
                        {
                            
                            display_name: "Máy rửa bát đĩa",
                            name: "Dishwashers",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200196
                        },
                        {
                            
                            display_name: "Lò sưởi, Bếp từ & Bộ điều chỉnh gas",
                            name: "Stoves, Hobs & Gas Regulators",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200197
                        },
                        {
                            
                            display_name: "Nồi chiên không dầu",
                            name: "Air Fryers",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200198
                        },
                        {
                            
                            display_name: "Nồi chiên ngập dầu",
                            name: "Deep Fryers",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200199
                        },
                        {
                            
                            display_name: "Lò vi sóng",
                            name: "Microwaves",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200200
                        },
                        {
                            
                            display_name: "Lò nướng",
                            name: "Ovens",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200201
                        },
                        {
                            
                            display_name: "Máy nướng bánh",
                            name: "Toasters",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200202
                        },
                        {
                            
                            display_name: "Máy chế biến thực phẩm & Xay thịt",
                            name: "Food Processors & Meat Grinders",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200203
                        },
                        {
                            
                            display_name: "Nồi nấu đa năng",
                            name: "Multi-function Cookers",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200204
                        },
                        {
                            
                            display_name: "Nồi áp suất",
                            name: "Pressure Cookers",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200205
                        },
                        {
                            
                            display_name: "Nồi nấu chậm & Dụng cụ nấu chân không",
                            name: "Slow Cookers & Sous Vide Machines",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200206
                        },
                        {
                            
                            display_name: "Nồi cơm điện",
                            name: "Rice Cookers",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200207
                        },
                        {
                            
                            display_name: "Dụng cụ nấu đặc biệt",
                            name: "Specialty Cookware",
        
                            
                            children: [],
                            parent_id: 200041,
                            id: 200208
                        },
                        {
                            
                            display_name: "Tủ lạnh",
                            name: "Refrigerators",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200209
                        },
                        {
                            
                            display_name: "Tủ đông",
                            name: "Freezers",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200210
                        },
                        {
                            
                            display_name: "Máy hút khói",
                            name: "Hoods",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200211
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200212
                        }
                    ],
                    parent_id: 200010,
                    id: 200041
                },
                {
                    
                    display_name: "Mạch điện & Phụ tùng",
                    name: "Electrical Circuitry & Parts",

                    
                    children: [{
                            
                            display_name: "Ổ cắm điện & Dây nối",
                            name: "Electric Sockets & Extension Cords",
                            
                            
                            children: [],
                            parent_id: 200042,
                            id: 200213
                        },
                        {
                            
                            display_name: "Thiết bị an toàn điện tử",
                            name: "Electrical Safety",
                            
                            
                            children: [],
                            parent_id: 200042,
                            id: 200214
                        },
                        {
                            
                            display_name: "Thiết bị tiết kiệm điện",
                            name: "Electricity Savers",
                            
                            
                            children: [],
                            parent_id: 200042,
                            id: 200215
                        },
                        {
                            
                            display_name: "Chuông cửa",
                            name: "Doorbells",
                            
                            
                            children: [],
                            parent_id: 200042,
                            id: 200216
                        },
                        {
                            
                            display_name: "Công tắc",
                            name: "Switches",
                            
                            
                            children: [],
                            parent_id: 200042,
                            id: 200217
                        },
                        {
                            
                            display_name: "Thiết bị báo động nhà ở",
                            name: "House Alarms",
                            
                            
                            children: [],
                            parent_id: 200042,
                            id: 200218
                        },
                        {
                            
                            display_name: "Thiết bị chống sấm sét",
                            name: "Lightning Protection",
                            
                            
                            children: [],
                            parent_id: 200042,
                            id: 200219
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200042,
                            id: 200220
                        }
                    ],
                    parent_id: 200010,
                    id: 200042
                },
                {
                    
                    display_name: "Pin",
                    name: "Batteries",
                    
                    
                    children: [],
                    parent_id: 200010,
                    id: 200043
                },
                {
                    
                    display_name: "Thiết bị điều khiển từ xa",
                    name: "Remote Controls",
                    
                    
                    children: [],
                    parent_id: 200010,
                    id: 200045
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200010,
                    id: 200046
                }
            ],
            parent_id: 0,
            id: 200010
        },
        {

            display_name: "Giày Dép Nam",
            name: "Men Shoes",

            
            children: [{
                    
                    display_name: "Bốt",
                    name: "Boots",

                    
                    children: [{
                            
                            display_name: "Bốt thời trang",
                            name: "Fashion Boots",
                            
                            
                            children: [],
                            parent_id: 200063,
                            id: 200255
                        },
                        {
                            
                            display_name: "Bốt đi mưa",
                            name: "Rain Boots",
                            
                            
                            children: [],
                            parent_id: 200063,
                            id: 200256
                        },
                        {
                            
                            display_name: "Bốt bảo hộ",
                            name: "Safety Boots",
                            
                            
                            children: [],
                            parent_id: 200063,
                            id: 200257
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200063,
                            id: 200258
                        }
                    ],
                    parent_id: 200012,
                    id: 200063
                },
                {
                    
                    display_name: "Giày thể thao/ Sneakers",
                    name: "Sneakers",
                    
                    
                    children: [],
                    parent_id: 200012,
                    id: 200064
                },
                {
                    
                    display_name: "Giày sục",
                    name: "Slip Ons & Mules",
                    
                    
                    children: [],
                    parent_id: 200012,
                    id: 200065
                },
                {
                    
                    display_name: "Giày tây lười",
                    name: "Loafers & Boat Shoes",
                    
                    
                    children: [],
                    parent_id: 200012,
                    id: 200066
                },
                {
                    
                    display_name: "Giày Oxfords & Giày buộc dây",
                    name: "Oxfords & Lace-Ups",
                    
                    
                    children: [],
                    parent_id: 200012,
                    id: 200067
                },
                {
                    
                    display_name: "Xăng-đan & Dép",
                    name: "Sandals & Flip Flops",

                    
                    children: [{
                            
                            display_name: "Dép xỏ ngón",
                            name: "Flip Flops",
                            
                            
                            children: [],
                            parent_id: 200068,
                            id: 200259
                        },
                        {
                            
                            display_name: "Xăng-đan",
                            name: "Sandals",
                            
                            
                            children: [],
                            parent_id: 200068,
                            id: 200260
                        },
                        {
                            
                            display_name: "Dép đi trong nhà",
                            name: "Indoor Slippers",
                            
                            
                            children: [],
                            parent_id: 200068,
                            id: 200261
                        },
                        {
                            
                            display_name: "Dép mát-xa",
                            name: "Health Slippers",
                            
                            
                            children: [],
                            parent_id: 200068,
                            id: 200262
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200068,
                            id: 200263
                        }
                    ],
                    parent_id: 200012,
                    id: 200068
                },
                {
                    
                    display_name: "Phụ kiện giày dép",
                    name: "Shoe Care & Accessories",

                    
                    children: [{
                            
                            display_name: "Dụng cụ chăm sóc & Vệ sinh giày",
                            name: "Shoe Care & Cleaning Tools",
                            
                            
                            children: [],
                            parent_id: 200069,
                            id: 200264
                        },
                        {
                            
                            display_name: "Khử mùi giày dép",
                            name: "Shoe Deodorizers",
                            
                            
                            children: [],
                            parent_id: 200069,
                            id: 200265
                        },
                        {
                            
                            display_name: "Dây giày",
                            name: "Shoe Laces",
                            
                            
                            children: [],
                            parent_id: 200069,
                            id: 200266
                        },
                        {
                            
                            display_name: "Cây đón gót & Giữ form giày",
                            name: "Shoe Horns & Trees",
                            
                            
                            children: [],
                            parent_id: 200069,
                            id: 200267
                        },
                        {
                            
                            display_name: "Lót giày",
                            name: "Shoe Insoles",
                            
                            
                            children: [],
                            parent_id: 200069,
                            id: 200268
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200069,
                            id: 200269
                        }
                    ],
                    parent_id: 200012,
                    id: 200069
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200012,
                    id: 200070
                }
            ],
            parent_id: 0,
            id: 200012
        },
        {

            display_name: "Điện Thoại & Phụ Kiện",
            name: "Mobile & Gadgets",

            
            children: [{
                    
                    display_name: "Thẻ sim",
                    name: "Sim Cards",
                    
                    
                    children: [],
                    parent_id: 200013,
                    id: 200071
                },
                {
                    
                    display_name: "Máy tính bảng",
                    name: "Tablets",
                    
                    
                    children: [],
                    parent_id: 200013,
                    id: 200072
                },
                {
                    
                    display_name: "Điện thoại",
                    name: "Mobile Phones",
                    
                    
                    children: [],
                    parent_id: 200013,
                    id: 200073
                },
                {
                    
                    display_name: "Thiết bị đeo thông minh",
                    name: "Wearable Devices",

                    
                    children: [{
                            
                            display_name: "Đồng hồ thông minh & Vòng đeo tay sức khỏe",
                            name: "Smartwatches & Fitness Trackers",
                            
                            
                            children: [],
                            parent_id: 200074,
                            id: 200270
                        },
                        {
                            
                            display_name: "Thiết bị thực tế ảo",
                            name: "VR Devices",
                            
                            
                            children: [],
                            parent_id: 200074,
                            id: 200271
                        },
                        {
                            
                            display_name: "Thiết bị định vị GPS",
                            name: "GPS Trackers",
                            
                            
                            children: [],
                            parent_id: 200074,
                            id: 200272
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200074,
                            id: 200273
                        }
                    ],
                    parent_id: 200013,
                    id: 200074
                },
                {
                    
                    display_name: "Phụ kiện",
                    name: "Accessories",

                    
                    children: [{
                            
                            display_name: "Phụ kiện selfie",
                            name: "Selfie Accessories",
        
                            
                            children: [],
                            parent_id: 200075,
                            id: 200274
                        },
                        {
                            
                            display_name: "Ống kính điện thoại",
                            name: "Mobile Lens",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200275
                        },
                        {
                            
                            display_name: "Đèn flash điện thoại & Đèn selfie",
                            name: "Mobile Flashes & Selfie Lights",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200276
                        },
                        {
                            
                            display_name: "Quạt USB & Quạt điện thoại",
                            name: "USB & Mobile Fans",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200277
                        },
                        {
                            
                            display_name: "Bút cảm ứng",
                            name: "Stylus",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200278
                        },
                        {
                            
                            display_name: "Kẹp điện thoại",
                            name: "Phone Grips",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200279
                        },
                        {
                            
                            display_name: "Dây đeo điện thoại & Móc khóa",
                            name: "Phone Straps & Keychains",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200280
                        },
                        {
                            
                            display_name: "Thẻ nhớ",
                            name: "Memory Cards",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200281
                        },
                        {
                            
                            display_name: "Thiết bị trình chiếu",
                            name: "Casting Devices",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200282
                        },
                        {
                            
                            display_name: "Túi đựng điện thoại",
                            name: "Mobile Pouches",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200283
                        },
                        {
                            
                            display_name: "Cáp, sạc & bộ chuyển đổi",
                            name: "Cables, Chargers & Converters",
        
                            
                            children: [],
                            parent_id: 200075,
                            id: 200284
                        },
                        {
                            
                            display_name: "Đèn USB & Đèn điện thoại",
                            name: "USB & Mobile Lights",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200285
                        },
                        {
                            
                            display_name: "Bộ phát Wifi bỏ túi",
                            name: "Pocket Wifi",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200286
                        },
                        {
                            
                            display_name: "Sạc dự phòng & Pin",
                            name: "Powerbanks & Batteries",
        
                            
                            children: [],
                            parent_id: 200075,
                            id: 200287
                        },
                        {
                            
                            display_name: "Phụ kiện cho đồng hồ thông minh",
                            name: "Wearable Accessories",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200288
                        },
                        {
                            
                            display_name: "Miếng dán màn hình",
                            name: "Screen Protectors",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200289
                        },
                        {
                            
                            display_name: "Vỏ bao, Ốp lưng & Miếng dán",
                            name: "Cases, Covers, & Skins",
        
                            
                            children: [],
                            parent_id: 200075,
                            id: 200290
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200291
                        }
                    ],
                    parent_id: 200013,
                    id: 200075
                },
                {
                    
                    display_name: "Bộ đàm",
                    name: "Walkie Talkies",
                    
                    
                    children: [],
                    parent_id: 200013,
                    id: 200076
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200013,
                    id: 200077
                }
            ],
            parent_id: 0,
            id: 200013
        },
        {

            display_name: "Du lịch & Hành lý",
            name: "Travel & Luggage",

            
            children: [{
                    
                    display_name: "Vali",
                    name: "Luggage",
                    
                    
                    children: [],
                    parent_id: 200015,
                    id: 200085
                },
                {
                    
                    display_name: "Túi du lịch",
                    name: "Travel Bags",

                    
                    children: [{
                            
                            display_name: "Túi trống",
                            name: "Duffel & Weekender Bags",
                            
                            
                            children: [],
                            parent_id: 200086,
                            id: 200320
                        },
                        {
                            
                            display_name: "Túi gấp gọn",
                            name: "Foldable Bags",
                            
                            
                            children: [],
                            parent_id: 200086,
                            id: 200321
                        },
                        {
                            
                            display_name: "Túi dây rút",
                            name: "Drawstring Bags",
                            
                            
                            children: [],
                            parent_id: 200086,
                            id: 200322
                        },
                        {
                            
                            display_name: "Túi khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200086,
                            id: 200323
                        }
                    ],
                    parent_id: 200015,
                    id: 200086
                },
                {
                    
                    display_name: "Phụ kiện du lịch",
                    name: "Travel Accessories",

                    
                    children: [{
                            
                            display_name: "Ví hộ chiếu",
                            name: "Passport Holders & Covers",
                            
                            
                            children: [],
                            parent_id: 200087,
                            id: 200324
                        },
                        {
                            
                            display_name: "Túi du lịch nhiều ngăn",
                            name: "Travel Organizers",
                            
                            
                            children: [],
                            parent_id: 200087,
                            id: 200325
                        },
                        {
                            
                            display_name: "Áo trùm vali",
                            name: "Luggage Protectors & Covers",
                            
                            
                            children: [],
                            parent_id: 200087,
                            id: 200326
                        },
                        {
                            
                            display_name: "Thẻ hành lý",
                            name: "Luggage Tags",
                            
                            
                            children: [],
                            parent_id: 200087,
                            id: 200327
                        },
                        {
                            
                            display_name: "Dây đai vali",
                            name: "Luggage Straps",
                            
                            
                            children: [],
                            parent_id: 200087,
                            id: 200328
                        },
                        {
                            
                            display_name: "Khóa vali",
                            name: "Luggage Locks",
                            
                            
                            children: [],
                            parent_id: 200087,
                            id: 200329
                        },
                        {
                            
                            display_name: "Cân hành lý",
                            name: "Luggage Scales",
                            
                            
                            children: [],
                            parent_id: 200087,
                            id: 200330
                        },
                        {
                            
                            display_name: "Gối & Bịt mắt",
                            name: "Travel Pillows & Eye Covers",
                            
                            
                            children: [],
                            parent_id: 200087,
                            id: 200331
                        },
                        {
                            
                            display_name: "Bộ chiết mỹ phẩm",
                            name: "Travel Size Bottles & Containers",
                            
                            
                            children: [],
                            parent_id: 200087,
                            id: 200332
                        },
                        {
                            
                            display_name: "Phụ kiện khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200087,
                            id: 200333
                        }
                    ],
                    parent_id: 200015,
                    id: 200087
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200015,
                    id: 200088
                }
            ],
            parent_id: 0,
            id: 200015
        },
        {

            display_name: "Túi Ví Nữ",
            name: "Women Bags",

            
            children: [{
                    
                    display_name: "Ba lô",
                    name: "Backpacks",
                    
                    
                    children: [],
                    parent_id: 200016,
                    id: 200089
                },
                {
                    
                    display_name: "Cặp laptop",
                    name: "Laptop Bags",

                    
                    children: [{
                            
                            display_name: "Túi & cặp đứng laptop",
                            name: "Laptop Bags & Cases",
                            
                            
                            children: [],
                            parent_id: 200090,
                            id: 200334
                        },
                        {
                            
                            display_name: "Túi chống sốc laptop",
                            name: "Laptop Sleeves",
                            
                            
                            children: [],
                            parent_id: 200090,
                            id: 200335
                        },
                        {
                            
                            display_name: "Ba lô laptop",
                            name: "Laptop Backpacks",
                            
                            
                            children: [],
                            parent_id: 200090,
                            id: 200336
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200090,
                            id: 200337
                        }
                    ],
                    parent_id: 200016,
                    id: 200090
                },
                {
                    
                    display_name: "Ví dự tiệc & Ví cầm tay",
                    name: "Clutches & Wristlets",
                    
                    
                    children: [],
                    parent_id: 200016,
                    id: 200091
                },
                {
                    
                    display_name: "Túi đeo hông & Túi đeo ngực",
                    name: "Waist Bags & Chest Bags",
                    
                    
                    children: [],
                    parent_id: 200016,
                    id: 200092
                },
                {
                    
                    display_name: "Túi tote",
                    name: "Tote Bags",
                    
                    
                    children: [],
                    parent_id: 200016,
                    id: 200093
                },
                {
                    
                    display_name: "Túi quai xách",
                    name: "Top-handle Bags",
                    
                    
                    children: [],
                    parent_id: 200016,
                    id: 200094
                },
                {
                    
                    display_name: "Túi đeo chéo & Túi đeo vai",
                    name: "Crossbody & Shoulder Bags",
                    
                    
                    children: [],
                    parent_id: 200016,
                    id: 200095
                },
                {
                    
                    display_name: "Ví",
                    name: "Wallets",

                    
                    children: [{
                            
                            display_name: "Ví đựng thẻ",
                            name: "Card Holders",
                            
                            
                            children: [],
                            parent_id: 200096,
                            id: 200338
                        },
                        {
                            
                            display_name: "Ví mini đựng tiền",
                            name: "Coin Holders & Purses",
                            
                            
                            children: [],
                            parent_id: 200096,
                            id: 200339
                        },
                        {
                            
                            display_name: "Ví đựng điện thoại & chìa khóa",
                            name: "Phone & Key Wallets",
                            
                            
                            children: [],
                            parent_id: 200096,
                            id: 200340
                        },
                        {
                            
                            display_name: "Ví gập",
                            name: "Bifold & Trifold Wallets",
                            
                            
                            children: [],
                            parent_id: 200096,
                            id: 200341
                        },
                        {
                            
                            display_name: "Ví dài",
                            name: "Long Wallets",
                            
                            
                            children: [],
                            parent_id: 200096,
                            id: 200342
                        },
                        {
                            
                            display_name: "Ví khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200096,
                            id: 200343
                        }
                    ],
                    parent_id: 200016,
                    id: 200096
                },
                {
                    
                    display_name: "Phụ kiện túi",
                    name: "Bag Accessories",

                    
                    children: [{
                            
                            display_name: "Dây đeo túi",
                            name: "Bag Straps",
                            
                            
                            children: [],
                            parent_id: 200097,
                            id: 200344
                        },
                        {
                            
                            display_name: "Dụng cụ treo/đựng túi",
                            name: "Bag Holders",
                            
                            
                            children: [],
                            parent_id: 200097,
                            id: 200345
                        },
                        {
                            
                            display_name: "Charm và phụ kiện gắn túi",
                            name: "Charms & Twillies",
                            
                            
                            children: [],
                            parent_id: 200097,
                            id: 200346
                        },
                        {
                            
                            display_name: "Túi đa ngăn tiện ích",
                            name: "Bag Organizers",
                            
                            
                            children: [],
                            parent_id: 200097,
                            id: 200347
                        },
                        {
                            
                            display_name: "Dụng cụ vệ sinh và chăm sóc túi",
                            name: "Cleaning & Care Equipment",
                            
                            
                            children: [],
                            parent_id: 200097,
                            id: 200348
                        },
                        {
                            
                            display_name: "Phụ kiện khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200097,
                            id: 200349
                        }
                    ],
                    parent_id: 200016,
                    id: 200097
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200016,
                    id: 200098
                }
            ],
            parent_id: 0,
            id: 200016
        },
        {

            display_name: "Giày Dép Nữ",
            name: "Women Shoes",

            
            children: [{
                    
                    display_name: "Bốt",
                    name: "Boots",

                    
                    children: [{
                            
                            display_name: "Bốt đi mưa",
                            name: "Rain Boots",
                            
                            
                            children: [],
                            parent_id: 200556,
                            id: 200585
                        },
                        {
                            
                            display_name: "Bốt thời trang",
                            name: "Fashion Boots",
                            
                            
                            children: [],
                            parent_id: 200556,
                            id: 200586
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200556,
                            id: 200587
                        }
                    ],
                    parent_id: 200532,
                    id: 200556
                },
                {
                    
                    display_name: "Giày thể thao/ sneaker",
                    name: "Sneakers",
                    
                    
                    children: [],
                    parent_id: 200532,
                    id: 200557
                },
                {
                    
                    display_name: "Giày đế bằng",
                    name: "Flats",

                    
                    children: [{
                            
                            display_name: "Giày bale",
                            name: "Ballet Flats",
                            
                            
                            children: [],
                            parent_id: 200558,
                            id: 200588
                        },
                        {
                            
                            display_name: "Giày lười",
                            name: "Loafers & Boat Shoes",
                            
                            
                            children: [],
                            parent_id: 200558,
                            id: 200589
                        },
                        {
                            
                            display_name: "Giày Oxford & Giày buộc dây",
                            name: "Oxfords & Lace-Ups",
                            
                            
                            children: [],
                            parent_id: 200558,
                            id: 200590
                        },
                        {
                            
                            display_name: "Giày sục & Giày búp bê",
                            name: "Slip Ons, Mary Janes & Mules",
                            
                            
                            children: [],
                            parent_id: 200558,
                            id: 200591
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200558,
                            id: 200592
                        }
                    ],
                    parent_id: 200532,
                    id: 200558
                },
                {
                    
                    display_name: "Giày cao gót",
                    name: "Heels",
                    
                    
                    children: [],
                    parent_id: 200532,
                    id: 200559
                },
                {
                    
                    display_name: "Giày đế xuồng",
                    name: "Wedges",
                    
                    
                    children: [],
                    parent_id: 200532,
                    id: 200560
                },
                {
                    
                    display_name: "Xăng-đan và dép",
                    name: "Flat Sandals & Flip Flops",

                    
                    children: [{
                            
                            display_name: "Xăng-đan đế bằng",
                            name: "Flat Sandals",
                            
                            
                            children: [],
                            parent_id: 200561,
                            id: 200593
                        },
                        {
                            
                            display_name: "Dép kẹp/ dép xỏ ngón",
                            name: "Flip Flops",
                            
                            
                            children: [],
                            parent_id: 200561,
                            id: 200594
                        },
                        {
                            
                            display_name: "Dép mát-xa",
                            name: "Health Slippers",
                            
                            
                            children: [],
                            parent_id: 200561,
                            id: 200595
                        },
                        {
                            
                            display_name: "Dép đi trong nhà",
                            name: "Indoor Slippers",
                            
                            
                            children: [],
                            parent_id: 200561,
                            id: 200596
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200561,
                            id: 200597
                        }
                    ],
                    parent_id: 200532,
                    id: 200561
                },
                {
                    
                    display_name: "Phụ kiện & chăm sóc giày",
                    name: "Shoe Care & Accessories",

                    
                    children: [{
                            
                            display_name: "Đồ khử mùi giày",
                            name: "Shoe Deodorizers",
                            
                            
                            children: [],
                            parent_id: 200562,
                            id: 200598
                        },
                        {
                            
                            display_name: "Miếng lót giày",
                            name: "Insoles & Heel Liners",
                            
                            
                            children: [],
                            parent_id: 200562,
                            id: 200599
                        },
                        {
                            
                            display_name: "Cây đón gót & Giữ form giày",
                            name: "Shoe Horns & Trees",
                            
                            
                            children: [],
                            parent_id: 200562,
                            id: 200600
                        },
                        {
                            
                            display_name: "Đồ chăm sóc và làm sạch giày",
                            name: "Shoe Care & Cleaning Tools",
                            
                            
                            children: [],
                            parent_id: 200562,
                            id: 200601
                        },
                        {
                            
                            display_name: "Dây giày",
                            name: "Shoe Laces",
                            
                            
                            children: [],
                            parent_id: 200562,
                            id: 200602
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200562,
                            id: 200603
                        }
                    ],
                    parent_id: 200532,
                    id: 200562
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200532,
                    id: 200563
                }
            ],
            parent_id: 0,
            id: 200532
        },
        {

            display_name: "Túi Ví Nam",
            name: "Men Bags",

            
            children: [{
                    
                    display_name: "Ba lô",
                    name: "Backpacks",
                    
                    
                    children: [],
                    parent_id: 200533,
                    id: 200564
                },
                {
                    
                    display_name: "Cặp laptop",
                    name: "Laptop Bags",

                    
                    children: [{
                            
                            display_name: "Túi & cặp đựng laptop",
                            name: "Laptop Bags & Cases",
                            
                            
                            children: [],
                            parent_id: 200565,
                            id: 200604
                        },
                        {
                            
                            display_name: "Túi chống sốc laptop",
                            name: "Laptop Sleeves",
                            
                            
                            children: [],
                            parent_id: 200565,
                            id: 200605
                        },
                        {
                            
                            display_name: "Ba lô laptop",
                            name: "Laptop Backpacks",
                            
                            
                            children: [],
                            parent_id: 200565,
                            id: 200606
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200565,
                            id: 200607
                        }
                    ],
                    parent_id: 200533,
                    id: 200565
                },
                {
                    
                    display_name: "Túi tote",
                    name: "Tote Bags",
                    
                    
                    children: [],
                    parent_id: 200533,
                    id: 200566
                },
                {
                    
                    display_name: "Cặp xách công sở",
                    name: "Briefcases",
                    
                    
                    children: [],
                    parent_id: 200533,
                    id: 200567
                },
                {
                    
                    display_name: "Ví cầm tay",
                    name: "Clutches",
                    
                    
                    children: [],
                    parent_id: 200533,
                    id: 200568
                },
                {
                    
                    display_name: "Túi đeo hông & Túi đeo ngực",
                    name: "Waist Bags & Chest Bags",
                    
                    
                    children: [],
                    parent_id: 200533,
                    id: 200569
                },
                {
                    
                    display_name: "Túi đeo chéo",
                    name: "Crossbody & Shoulder Bags",
                    
                    
                    children: [],
                    parent_id: 200533,
                    id: 200570
                },
                {
                    
                    display_name: "Bóp/ Ví",
                    name: "Wallets",

                    
                    children: [{
                            
                            display_name: "Ví đựng thẻ",
                            name: "Card Holders",
                            
                            
                            children: [],
                            parent_id: 200571,
                            id: 200608
                        },
                        {
                            
                            display_name: "Ví đựng tiền xu",
                            name: "Coin Holders & Purses",
                            
                            
                            children: [],
                            parent_id: 200571,
                            id: 200609
                        },
                        {
                            
                            display_name: "Ví đựng điện thoại & chìa khóa",
                            name: "Phone & Key Wallets",
                            
                            
                            children: [],
                            parent_id: 200571,
                            id: 200610
                        },
                        {
                            
                            display_name: "Ví gập đôi & gập ba",
                            name: "Bifold & Trifold Wallets",
                            
                            
                            children: [],
                            parent_id: 200571,
                            id: 200611
                        },
                        {
                            
                            display_name: "Ví dài",
                            name: "Long Wallets",
                            
                            
                            children: [],
                            parent_id: 200571,
                            id: 200612
                        },
                        {
                            
                            display_name: "Ví khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200571,
                            id: 200613
                        }
                    ],
                    parent_id: 200533,
                    id: 200571
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200533,
                    id: 200572
                }
            ],
            parent_id: 0,
            id: 200533
        },
        {

            display_name: "Đồng Hồ",
            name: "Watches",

            
            children: [{
                    
                    display_name: "Đồng hồ nữ",
                    name: "Women Watches",
                    
                    
                    children: [],
                    parent_id: 200534,
                    id: 200573
                },
                {
                    
                    display_name: "Đồng hồ nam",
                    name: "Men Watches",
                    
                    
                    children: [],
                    parent_id: 200534,
                    id: 200574
                },
                {
                    
                    display_name: "Bộ đồng hồ & Đồng hồ cặp",
                    name: "Set & Couple Watches",
                    
                    
                    children: [],
                    parent_id: 200534,
                    id: 200575
                },
                {
                    
                    display_name: "Phụ kiện đồng hồ",
                    name: "Watches Accessories",

                    
                    children: [{
                            
                            display_name: "Dây đồng hồ",
                            name: "Straps",
                            
                            
                            children: [],
                            parent_id: 200576,
                            id: 200614
                        },
                        {
                            
                            display_name: "Dụng cụ sửa chữa",
                            name: "Service Tools",
                            
                            
                            children: [],
                            parent_id: 200576,
                            id: 200615
                        },
                        {
                            
                            display_name: "Khóa đồng hồ",
                            name: "Buckles",
                            
                            
                            children: [],
                            parent_id: 200576,
                            id: 200616
                        },
                        {
                            
                            display_name: "Pin đồng hồ",
                            name: "Batteries",
                            
                            
                            children: [],
                            parent_id: 200576,
                            id: 200617
                        },
                        {
                            
                            display_name: "Hộp đựng đồng hồ",
                            name: "Boxes",
                            
                            
                            children: [],
                            parent_id: 200576,
                            id: 200618
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200576,
                            id: 200619
                        }
                    ],
                    parent_id: 200534,
                    id: 200576
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200534,
                    id: 200577
                }
            ],
            parent_id: 0,
            id: 200534
        },
        {

            display_name: "Thiết Bị Âm Thanh",
            name: "Audio",

            
            children: [{
                    
                    display_name: "Tai nghe nhét tai & chụp tai",
                    name: "Earphones, Headphones & Headsets",
                    
                    
                    children: [],
                    parent_id: 200535,
                    id: 200578
                },
                {
                    
                    display_name: "Máy nghe nhạc",
                    name: "Media Players",

                    
                    children: [{
                            
                            display_name: "MP3 & MP4",
                            name: "MP3 & MP4 Players",
                            
                            
                            children: [],
                            parent_id: 200579,
                            id: 200620
                        },
                        {
                            
                            display_name: "CD, DVD & Bluray",
                            name: "CD, DVD, & Blu-ray Players",
                            
                            
                            children: [],
                            parent_id: 200579,
                            id: 200621
                        },
                        {
                            
                            display_name: "Máy ghi âm",
                            name: "Voice Recorders",
                            
                            
                            children: [],
                            parent_id: 200579,
                            id: 200622
                        },
                        {
                            
                            display_name: "Radio & Cát-sét",
                            name: "Radio & Cassette Players",
                            
                            
                            children: [],
                            parent_id: 200579,
                            id: 200623
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200579,
                            id: 200624
                        }
                    ],
                    parent_id: 200535,
                    id: 200579
                },
                {
                    
                    display_name: "Micro thu âm",
                    name: "Microphones",
                    
                    
                    children: [],
                    parent_id: 200535,
                    id: 200580
                },
                {
                    
                    display_name: "Amply và đầu chỉnh âm",
                    name: "Amplifiers & Mixers",
                    
                    
                    children: [],
                    parent_id: 200535,
                    id: 200581
                },
                {
                    
                    display_name: "Dàn âm thanh",
                    name: "Home Audio & Speakers",

                    
                    children: [{
                            
                            display_name: "Loa",
                            name: "Speakers",
                            
                            
                            children: [],
                            parent_id: 200582,
                            id: 200625
                        },
                        {
                            
                            display_name: "Hệ thống âm thanh giải trí tại gia",
                            name: "Home Theater Systems",
                            
                            
                            children: [],
                            parent_id: 200582,
                            id: 200626
                        },
                        {
                            
                            display_name: "Thu sóng AV",
                            name: "AV Receivers",
                            
                            
                            children: [],
                            parent_id: 200582,
                            id: 200627
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200582,
                            id: 200628
                        }
                    ],
                    parent_id: 200535,
                    id: 200582
                },
                {
                    
                    display_name: "Cáp âm thanh/ video & Đầu chuyển",
                    name: "Audio & Video Cables & Converters",
                    
                    
                    children: [],
                    parent_id: 200535,
                    id: 200583
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200535,
                    id: 200584
                }
            ],
            parent_id: 0,
            id: 200535
        },
        {

            display_name: "Thực phẩm và đồ uống",
            name: "Food & Beverages",

            
            children: [{
                    
                    display_name: "Đồ chế biến sẵn",
                    name: "Convenience / Ready-to-eat",

                    
                    children: [{
                            
                            display_name: "Đồ ăn chế biến sẵn",
                            name: "Cooked Food",
                            
                            
                            children: [],
                            parent_id: 200645,
                            id: 200780
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200645,
                            id: 200781
                        },
                        {
                            
                            display_name: "Cơm và cháo ăn liền",
                            name: "Instant Rice & Porridge",
                            
                            
                            children: [],
                            parent_id: 200645,
                            id: 200782
                        },
                        {
                            
                            display_name: "Lẩu ăn liền",
                            name: "Instant Hotpot",
                            
                            
                            children: [],
                            parent_id: 200645,
                            id: 200783
                        },
                        {
                            
                            display_name: "Mì ăn liền",
                            name: "Instant Noodles",
                            
                            
                            children: [],
                            parent_id: 200645,
                            id: 200784
                        }
                    ],
                    parent_id: 200629,
                    id: 200645
                },
                {
                    
                    display_name: "Đồ ăn vặt",
                    name: "Snacks",

                    
                    children: [{
                            
                            display_name: "Kẹo",
                            name: "Sweets & Candy",
                            
                            
                            children: [],
                            parent_id: 200646,
                            id: 200785
                        },
                        {
                            
                            display_name: "Sô cô la",
                            name: "Chocolate",
                            
                            
                            children: [],
                            parent_id: 200646,
                            id: 200786
                        },
                        {
                            
                            display_name: "Bánh quy",
                            name: "Biscuits, Cookies & Wafers",
                            
                            
                            children: [],
                            parent_id: 200646,
                            id: 200787
                        },
                        {
                            
                            display_name: "Khoai tây lát",
                            name: "Chips & Crisps",
                            
                            
                            children: [],
                            parent_id: 200646,
                            id: 200788
                        },
                        {
                            
                            display_name: "Các loại hạt sấy khô",
                            name: "Seeds",
                            
                            
                            children: [],
                            parent_id: 200646,
                            id: 200789
                        },
                        {
                            
                            display_name: "Bỏng ngô",
                            name: "Popcorn",
                            
                            
                            children: [],
                            parent_id: 200646,
                            id: 200790
                        },
                        {
                            
                            display_name: "Các loại rong biển ăn liền",
                            name: "Seaweed",
                            
                            
                            children: [],
                            parent_id: 200646,
                            id: 200791
                        },
                        {
                            
                            display_name: "Các loại đậu sấy khô",
                            name: "Nuts",
                            
                            
                            children: [],
                            parent_id: 200646,
                            id: 200792
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200646,
                            id: 200793
                        },
                        {
                            
                            display_name: "Pudding, thạch & kẹo dẻo",
                            name: "Pudding, Jellies & Marshmallow",
                            
                            
                            children: [],
                            parent_id: 200646,
                            id: 200794
                        },
                        {
                            
                            display_name: "Thức ăn khô",
                            name: "Dried Snacks",
        
                            
                            children: [],
                            parent_id: 200646,
                            id: 200795
                        }
                    ],
                    parent_id: 200629,
                    id: 200646
                },
                {
                    
                    display_name: "Nhu yếu phẩm",
                    name: "Food Staples",

                    
                    children: [{
                            
                            display_name: "Thực phẩm khô",
                            name: "Dried Goods",
        
                            
                            children: [],
                            parent_id: 200647,
                            id: 200796
                        },
                        {
                            
                            display_name: "Mì",
                            name: "Noodles",
                            
                            
                            children: [],
                            parent_id: 200647,
                            id: 200797
                        },
                        {
                            
                            display_name: "Gạo",
                            name: "Rice",
                            
                            
                            children: [],
                            parent_id: 200647,
                            id: 200798
                        },
                        {
                            
                            display_name: "Mì Ý",
                            name: "Pasta",
                            
                            
                            children: [],
                            parent_id: 200647,
                            id: 200799
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200647,
                            id: 200800
                        },
                        {
                            
                            display_name: "Thực phẩm đóng hộp",
                            name: "Canned Food",
        
                            
                            children: [],
                            parent_id: 200647,
                            id: 200801
                        },
                        {
                            
                            display_name: "Rau củ ngâm",
                            name: "Preserved Vegetables",
                            
                            
                            children: [],
                            parent_id: 200647,
                            id: 200802
                        }
                    ],
                    parent_id: 200629,
                    id: 200647
                },
                {
                    
                    display_name: "Nguyên liệu nấu ăn",
                    name: "Cooking Essentials",

                    
                    children: [{
                            
                            display_name: "Dầu ăn",
                            name: "Oil",
                            
                            
                            children: [],
                            parent_id: 200648,
                            id: 200803
                        },
                        {
                            
                            display_name: "Gia vị & Hương liệu",
                            name: "Seasonings & Condiments",
        
                            
                            children: [],
                            parent_id: 200648,
                            id: 200804
                        },
                        {
                            
                            display_name: "Đường",
                            name: "Sugar",
                            
                            
                            children: [],
                            parent_id: 200648,
                            id: 200805
                        },
                        {
                            
                            display_name: "Chất tạo ngọt",
                            name: "Sweetener",
                            
                            
                            children: [],
                            parent_id: 200648,
                            id: 200806
                        },
                        {
                            
                            display_name: "Sốt & súp ăn liền",
                            name: "Stock, Gravy & Instant Soup",
                            
                            
                            children: [],
                            parent_id: 200648,
                            id: 200807
                        },
                        {
                            
                            display_name: "Gói/ bột gia vị",
                            name: "Cooking Paste & Kit",
                            
                            
                            children: [],
                            parent_id: 200648,
                            id: 200808
                        },
                        {
                            
                            display_name: "Phụ gia thực phẩm",
                            name: "Flavour Enhancers",
                            
                            
                            children: [],
                            parent_id: 200648,
                            id: 200809
                        },
                        {
                            
                            display_name: "Bột phủ",
                            name: "Flour Coating",
                            
                            
                            children: [],
                            parent_id: 200648,
                            id: 200810
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200648,
                            id: 200811
                        }
                    ],
                    parent_id: 200629,
                    id: 200648
                },
                {
                    
                    display_name: "Đồ làm bánh",
                    name: "Baking Needs",

                    
                    children: [{
                            
                            display_name: "Hương liệu",
                            name: "Baking Flavoring",
                            
                            
                            children: [],
                            parent_id: 200649,
                            id: 200812
                        },
                        {
                            
                            display_name: "Bột nở và muối nở",
                            name: "Baking Powder & Soda",
                            
                            
                            children: [],
                            parent_id: 200649,
                            id: 200813
                        },
                        {
                            
                            display_name: "Bột pha sẵn",
                            name: "Baking Premix Flour",
                            
                            
                            children: [],
                            parent_id: 200649,
                            id: 200814
                        },
                        {
                            
                            display_name: "Bột mì",
                            name: "Flour",
                            
                            
                            children: [],
                            parent_id: 200649,
                            id: 200815
                        },
                        {
                            
                            display_name: "Chất tạo màu",
                            name: "Food Coloring",
                            
                            
                            children: [],
                            parent_id: 200649,
                            id: 200816
                        },
                        {
                            
                            display_name: "Đồ trang trí",
                            name: "Baking Decoration",
                            
                            
                            children: [],
                            parent_id: 200649,
                            id: 200817
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200649,
                            id: 200818
                        }
                    ],
                    parent_id: 200629,
                    id: 200649
                },
                {
                    
                    display_name: "Ngũ cốc & mứt",
                    name: "Breakfast Cereals & Spread",

                    
                    children: [{
                            
                            display_name: "Mật ong và siro",
                            name: "Honey & Maple Syrups",
                            
                            
                            children: [],
                            parent_id: 200650,
                            id: 200819
                        },
                        {
                            
                            display_name: "Mứt",
                            name: "Jam & Spread",
                            
                            
                            children: [],
                            parent_id: 200650,
                            id: 200820
                        },
                        {
                            
                            display_name: "Ngũ cốc",
                            name: "Cereal, Granola & Oats",
                            
                            
                            children: [],
                            parent_id: 200650,
                            id: 200821
                        },
                        {
                            
                            display_name: "Thanh dinh dưỡng",
                            name: "Breakfast Bar",
                            
                            
                            children: [],
                            parent_id: 200650,
                            id: 200822
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200650,
                            id: 200823
                        }
                    ],
                    parent_id: 200629,
                    id: 200650
                },
                {
                    
                    display_name: "Đồ uống",
                    name: "Beverages",

                    
                    children: [{
                            
                            display_name: "Cà phê",
                            name: "Coffee",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200824
                        },
                        {
                            
                            display_name: "Trà & trà túi lọc",
                            name: "Tea & Tea Bags",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200825
                        },
                        {
                            
                            display_name: "Thức uống Sô cô la",
                            name: "Chocolate Drinks",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200826
                        },
                        {
                            
                            display_name: "Nước tăng lực",
                            name: "Energy & Isotonic Drinks",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200827
                        },
                        {
                            
                            display_name: "Nước tinh khiết",
                            name: "Water",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200828
                        },
                        {
                            
                            display_name: "Nước trái cây lên men",
                            name: "Juice & Juice Vinegar",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200829
                        },
                        {
                            
                            display_name: "Siro pha",
                            name: "Cordial & Syrups",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200830
                        },
                        {
                            
                            display_name: "Nước có ga",
                            name: "Carbonated Drinks & Tonics",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200831
                        },
                        {
                            
                            display_name: "Bột pha",
                            name: "Powdered Drink Mixes",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200832
                        },
                        {
                            
                            display_name: "Đồ tráng miệng",
                            name: "Dessert Drink",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200833
                        },
                        {
                            
                            display_name: "Trà thảo mộc",
                            name: "Traditional & Herbal Drinks",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200834
                        },
                        {
                            
                            display_name: "Topping",
                            name: "Drink Toppings",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200835
                        },
                        {
                            
                            display_name: "Sữa thực vật",
                            name: "Non-dairy Milk",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200836
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200837
                        }
                    ],
                    parent_id: 200629,
                    id: 200651
                },
                {
                    
                    display_name: "Sữa - trứng",
                    name: "Dairy & Eggs",

                    
                    children: [{
                            
                            display_name: "Sữa",
                            name: "Milk",
        
                            
                            children: [],
                            parent_id: 200652,
                            id: 200838
                        },
                        {
                            
                            display_name: "Sữa chua",
                            name: "Yogurt & Cultured Milk",
                            
                            
                            children: [],
                            parent_id: 200652,
                            id: 200839
                        },
                        {
                            
                            display_name: "Bột kem béo",
                            name: "Creamers",
                            
                            
                            children: [],
                            parent_id: 200652,
                            id: 200840
                        },
                        {
                            
                            display_name: "Bơ động vật & thực vật",
                            name: "Butter & Margarine",
                            
                            
                            children: [],
                            parent_id: 200652,
                            id: 200841
                        },
                        {
                            
                            display_name: "Phô mai & bột phô mai",
                            name: "Cheese & Cheese Powder",
                            
                            
                            children: [],
                            parent_id: 200652,
                            id: 200842
                        },
                        {
                            
                            display_name: "Kem",
                            name: "Ice cream",
                            
                            
                            children: [],
                            parent_id: 200652,
                            id: 200843
                        },
                        {
                            
                            display_name: "Trứng",
                            name: "Eggs",
                            
                            
                            children: [],
                            parent_id: 200652,
                            id: 200844
                        },
                        {
                            
                            display_name: "Đậu phụ",
                            name: "Beancurd",
                            
                            
                            children: [],
                            parent_id: 200652,
                            id: 200845
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200652,
                            id: 200846
                        }
                    ],
                    parent_id: 200629,
                    id: 200652
                },
                {
                    
                    display_name: "Các loại bánh",
                    name: "Bakery",

                    
                    children: [{
                            
                            display_name: "Bánh mì",
                            name: "Breads",
                            
                            
                            children: [],
                            parent_id: 200654,
                            id: 200856
                        },
                        {
                            
                            display_name: "Bánh kem",
                            name: "Cakes & Pies",
                            
                            
                            children: [],
                            parent_id: 200654,
                            id: 200857
                        },
                        {
                            
                            display_name: "Bánh ngọt/ pastry",
                            name: "Pastry",
                            
                            
                            children: [],
                            parent_id: 200654,
                            id: 200858
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200654,
                            id: 200859
                        }
                    ],
                    parent_id: 200629,
                    id: 200654
                },
                {
                    
                    display_name: "Đồ uống có cồn",
                    name: "Alcoholic Beverages",

                    
                    children: [{
                        region_setting: {
                            low_stock_value: 0,
                            enable_size_chart: false
                        },
                        display_name: "Bia và trái cây lên men",
                        name: "Beer & Cider",
                        
                        
                        children: [],
                        parent_id: 200655,
                        id: 200860
                    }],
                    parent_id: 200629,
                    id: 200655
                },
                {
                    
                    display_name: "Bộ quà tặng",
                    name: "Gift Set & Hampers",
                    
                    
                    children: [],
                    parent_id: 200629,
                    id: 200656
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200629,
                    id: 200657
                }
            ],
            parent_id: 0,
            id: 200629
        },
        {

            display_name: "Chăm Sóc Thú Cưng",
            name: "Pets",

            
            children: [{
                    
                    display_name: "Thức ăn cho thú cưng",
                    name: "Pet Food",

                    
                    children: [{
                            
                            display_name: "Thức ăn cho chó",
                            name: "Dog Food",
                            
                            
                            children: [],
                            parent_id: 200667,
                            id: 200906
                        },
                        {
                            
                            display_name: "Snack cho chó",
                            name: "Dog Treats",
                            
                            
                            children: [],
                            parent_id: 200667,
                            id: 200907
                        },
                        {
                            
                            display_name: "Thức ăn cho mèo",
                            name: "Cat Food",
                            
                            
                            children: [],
                            parent_id: 200667,
                            id: 200908
                        },
                        {
                            
                            display_name: "Snack cho mèo",
                            name: "Cat Treats",
                            
                            
                            children: [],
                            parent_id: 200667,
                            id: 200909
                        },
                        {
                            
                            display_name: "Thức ăn cho thú nhỏ",
                            name: "Small Pet Food",
                            
                            
                            children: [],
                            parent_id: 200667,
                            id: 200910
                        },
                        {
                            
                            display_name: "Snack cho thú nhỏ",
                            name: "Small Pet Treats",
                            
                            
                            children: [],
                            parent_id: 200667,
                            id: 200911
                        },
                        {
                            
                            display_name: "Thức ăn cho cá",
                            name: "Aquarium Pet Food",
                            
                            
                            children: [],
                            parent_id: 200667,
                            id: 200912
                        },
                        {
                            
                            display_name: "Thức ăn cho chim",
                            name: "Bird Feed",
                            
                            
                            children: [],
                            parent_id: 200667,
                            id: 200913
                        },
                        {
                            
                            display_name: "Thức ăn cho bò sát",
                            name: "Reptile Food",
                            
                            
                            children: [],
                            parent_id: 200667,
                            id: 200914
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200667,
                            id: 200915
                        }
                    ],
                    parent_id: 200631,
                    id: 200667
                },
                {
                    
                    display_name: "Phụ kiện cho thú cưng",
                    name: "Pet Accessories",

                    
                    children: [{
                            
                            display_name: "Bát & dụng cụ ăn",
                            name: "Bowls & Feeders",
                            
                            
                            children: [],
                            parent_id: 200668,
                            id: 200916
                        },
                        {
                            
                            display_name: "Thiết bị du lịch",
                            name: "Travel Essentials",
                            
                            
                            children: [],
                            parent_id: 200668,
                            id: 200917
                        },
                        {
                            
                            display_name: "Vòng cổ, dây dắt & rọ mõm",
                            name: "Leashes, Collars, Harnesses & Muzzles",
                            
                            
                            children: [],
                            parent_id: 200668,
                            id: 200918
                        },
                        {
                            
                            display_name: "Đồ chơi",
                            name: "Toys",
        
                            
                            children: [],
                            parent_id: 200668,
                            id: 200919
                        },
                        {
                            
                            display_name: "Nội thất cho thú cưng",
                            name: "Pet Furniture",
        
                            
                            children: [],
                            parent_id: 200668,
                            id: 200920
                        },
                        {
                            
                            display_name: "Phụ kiện thủy sinh",
                            name: "Aquarium Needs",
                            
                            
                            children: [],
                            parent_id: 200668,
                            id: 200921
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200668,
                            id: 200922
                        }
                    ],
                    parent_id: 200631,
                    id: 200668
                },
                {
                    
                    display_name: "Vệ sinh cho thú cưng",
                    name: "Litter & Toilet",

                    
                    children: [{
                            
                            display_name: "Khay & Bồn vệ sinh cho mèo",
                            name: "Cat Litter & Boxes",
                            
                            
                            children: [],
                            parent_id: 200669,
                            id: 200923
                        },
                        {
                            
                            display_name: "Lót chuồng cho thú nhỏ",
                            name: "Small Pet Bedding & Litter",
                            
                            
                            children: [],
                            parent_id: 200669,
                            id: 200924
                        },
                        {
                            
                            display_name: "Tã cho thú cưng",
                            name: "Diapers",
                            
                            
                            children: [],
                            parent_id: 200669,
                            id: 200925
                        },
                        {
                            
                            display_name: "Khay huấn luyện vệ sinh cho chó",
                            name: "Dog Training Pads & Trays",
                            
                            
                            children: [],
                            parent_id: 200669,
                            id: 200926
                        },
                        {
                            
                            display_name: "Túi & Xẻng dọn vệ sinh",
                            name: "Poop Bags & Scoopers",
                            
                            
                            children: [],
                            parent_id: 200669,
                            id: 200927
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200669,
                            id: 200928
                        }
                    ],
                    parent_id: 200631,
                    id: 200669
                },
                {
                    
                    display_name: "Làm đẹp cho thú cưng",
                    name: "Pet Grooming",

                    
                    children: [{
                            
                            display_name: "Chăm sóc lông",
                            name: "Hair Care",
                            
                            
                            children: [],
                            parent_id: 200670,
                            id: 200929
                        },
                        {
                            
                            display_name: "Chăm sóc răng miệng",
                            name: "Oral Care",
                            
                            
                            children: [],
                            parent_id: 200670,
                            id: 200930
                        },
                        {
                            
                            display_name: "Chăm sóc móng",
                            name: "Claw Care",
                            
                            
                            children: [],
                            parent_id: 200670,
                            id: 200931
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200670,
                            id: 200932
                        }
                    ],
                    parent_id: 200631,
                    id: 200670
                },
                {
                    
                    display_name: "Quần áo & phụ kiện",
                    name: "Pet Clothing & Accessories",

                    
                    children: [{
                            
                            display_name: "Quần áo thú cưng",
                            name: "Pet Clothing",
                            
                            
                            children: [],
                            parent_id: 200671,
                            id: 200933
                        },
                        {
                            
                            display_name: "Áo mưa chó mèo",
                            name: "Wet Weather Gear",
                            
                            
                            children: [],
                            parent_id: 200671,
                            id: 200934
                        },
                        {
                            
                            display_name: "Giày, tất & bảo vệ móng",
                            name: "Boots, Socks & Paw Protectors",
                            
                            
                            children: [],
                            parent_id: 200671,
                            id: 200935
                        },
                        {
                            
                            display_name: "Phụ kiện đeo cổ",
                            name: "Neck Accessories",
                            
                            
                            children: [],
                            parent_id: 200671,
                            id: 200936
                        },
                        {
                            
                            display_name: "Kính mắt",
                            name: "Eyewear",
                            
                            
                            children: [],
                            parent_id: 200671,
                            id: 200937
                        },
                        {
                            
                            display_name: "Phụ kiện lông",
                            name: "Hair Accessories",
                            
                            
                            children: [],
                            parent_id: 200671,
                            id: 200938
                        },
                        {
                            
                            display_name: "Mũ nón thú cưng",
                            name: "Hats",
                            
                            
                            children: [],
                            parent_id: 200671,
                            id: 200939
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200671,
                            id: 200940
                        }
                    ],
                    parent_id: 200631,
                    id: 200671
                },
                {
                    
                    display_name: "Chăm sóc sức khỏe",
                    name: "Pet Healthcare",

                    
                    children: [{
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200672,
                            id: 200943
                        },
                        {
                            
                            display_name: "Vitamin & chất bổ sung dinh dưỡng",
                            name: "Vitamins & Supplements",
                            
                            
                            children: [],
                            parent_id: 200672,
                            id: 200944
                        }
                    ],
                    parent_id: 200631,
                    id: 200672
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200631,
                    id: 200673
                }
            ],
            parent_id: 0,
            id: 200631
        },
        {

            display_name: "Mẹ & Bé",
            name: "Mom & Baby",

            
            children: [{
                    
                    display_name: "Đồ dùng du lịch cho bé",
                    name: "Baby Travel Essentials",

                    
                    children: [{
                            
                            display_name: "Địu em bé",
                            name: "Baby Carrier",
                            
                            
                            children: [],
                            parent_id: 200674,
                            id: 200945
                        },
                        {
                            
                            display_name: "Xe đẩy",
                            name: "Strollers & Travel Systems",
                            
                            
                            children: [],
                            parent_id: 200674,
                            id: 200946
                        },
                        {
                            
                            display_name: "Phụ kiện xe đẩy",
                            name: "Stroller Accessories",
                            
                            
                            children: [],
                            parent_id: 200674,
                            id: 200947
                        },
                        {
                            
                            display_name: "Ghế ngồi ô tô & xe máy",
                            name: "Car & Motorbike Seats",
                            
                            
                            children: [],
                            parent_id: 200674,
                            id: 200948
                        },
                        {
                            
                            display_name: "Phụ kiện ghế ngồi ô tô & xe máy",
                            name: "Car & Motorbike Seats Accessories",
                            
                            
                            children: [],
                            parent_id: 200674,
                            id: 200949
                        },
                        {
                            
                            display_name: "Túi đựng bỉm sữa",
                            name: "Diaper Bags",
                            
                            
                            children: [],
                            parent_id: 200674,
                            id: 200950
                        },
                        {
                            
                            display_name: "Dây & Đai dắt trẻ",
                            name: "Child Harnesses & Leashes",
                            
                            
                            children: [],
                            parent_id: 200674,
                            id: 200951
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200674,
                            id: 200952
                        }
                    ],
                    parent_id: 200632,
                    id: 200674
                },
                {
                    
                    display_name: "Đồ dùng ăn dặm cho bé",
                    name: "Feeding Essentials",

                    
                    children: [{
                            
                            display_name: "Bình sữa",
                            name: "Bottle-feeding",
        
                            
                            children: [],
                            parent_id: 200675,
                            id: 200953
                        },
                        {
                            
                            display_name: "Đồ dùng cho con bú",
                            name: "Breastfeeding",
        
                            
                            children: [],
                            parent_id: 200675,
                            id: 200954
                        },
                        {
                            
                            display_name: "Ghế ăn dặm",
                            name: "Highchairs & Booster Seats",
                            
                            
                            children: [],
                            parent_id: 200675,
                            id: 200955
                        },
                        {
                            
                            display_name: "Đồ dùng cho bé",
                            name: "Utensils",
        
                            
                            children: [],
                            parent_id: 200675,
                            id: 200956
                        },
                        {
                            
                            display_name: "Yếm",
                            name: "Bibs",
                            
                            
                            children: [],
                            parent_id: 200675,
                            id: 200957
                        },
                        {
                            
                            display_name: "Ti giả",
                            name: "Pacifiers",
                            
                            
                            children: [],
                            parent_id: 200675,
                            id: 200958
                        },
                        {
                            
                            display_name: "Máy xay cắt thực phẩm",
                            name: "Food Processors",
                            
                            
                            children: [],
                            parent_id: 200675,
                            id: 200959
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200675,
                            id: 200960
                        }
                    ],
                    parent_id: 200632,
                    id: 200675
                },
                {
                    
                    display_name: "Phụ kiện cho mẹ",
                    name: "Maternity Accessories",

                    
                    children: [{
                            
                            display_name: "Đai hỗ trợ bụng",
                            name: "Supporting Belts",
                            
                            
                            children: [],
                            parent_id: 200676,
                            id: 200961
                        },
                        {
                            
                            display_name: "Gối bầu",
                            name: "Maternity Pillows",
                            
                            
                            children: [],
                            parent_id: 200676,
                            id: 200962
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200676,
                            id: 200963
                        }
                    ],
                    parent_id: 200632,
                    id: 200676
                },
                {
                    
                    display_name: "Chăm sóc sức khỏe mẹ",
                    name: "Maternity Healthcare",

                    
                    children: [{
                            
                            display_name: "Sữa bầu",
                            name: "Maternity Milk",
                            
                            
                            children: [],
                            parent_id: 200677,
                            id: 200964
                        },
                        {
                            
                            display_name: "Vitamin & Thực phẩm bổ sung cho mẹ",
                            name: "Maternity Vitamins & Supplement",
                            
                            
                            children: [],
                            parent_id: 200677,
                            id: 200965
                        },
                        {
                            
                            display_name: "Kem dưỡng ẩm cho mẹ",
                            name: "Moisturizers & Creams",
                            
                            
                            children: [],
                            parent_id: 200677,
                            id: 200966
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200677,
                            id: 200967
                        }
                    ],
                    parent_id: 200632,
                    id: 200677
                },
                {
                    
                    display_name: "Đồ dùng phòng tắm & Chăm sóc cơ thể bé",
                    name: "Bath & Body Care",

                    
                    children: [{
                            
                            display_name: "Chậu tắm & Ghế tắm",
                            name: "Bathing Tubs & Seats",
                            
                            
                            children: [],
                            parent_id: 200678,
                            id: 200968
                        },
                        {
                            
                            display_name: "Áo choàng tắm, Khăn tắm & Khăn mặt",
                            name: "Bath Robes, Towels & Wash Cloths",
                            
                            
                            children: [],
                            parent_id: 200678,
                            id: 200969
                        },
                        {
                            
                            display_name: "Nón tắm",
                            name: "Shower Caps",
                            
                            
                            children: [],
                            parent_id: 200678,
                            id: 200970
                        },
                        {
                            
                            display_name: "Dụng cụ tắm & Phụ kiện",
                            name: "Bathing Tools & Accessories",
                            
                            
                            children: [],
                            parent_id: 200678,
                            id: 200971
                        },
                        {
                            
                            display_name: "Sản phẩm tắm & gội cho bé",
                            name: "Hair Care & Body Wash",
                            
                            
                            children: [],
                            parent_id: 200678,
                            id: 200972
                        },
                        {
                            
                            display_name: "Nước hoa cho bé",
                            name: "Baby Colognes & Fragrances",
                            
                            
                            children: [],
                            parent_id: 200678,
                            id: 200973
                        },
                        {
                            
                            display_name: "Bộ chăm sóc trẻ sơ sinh",
                            name: "Baby Grooming Tools",
                            
                            
                            children: [],
                            parent_id: 200678,
                            id: 200974
                        },
                        {
                            
                            display_name: "Khăn lau",
                            name: "Wipes",
                            
                            
                            children: [],
                            parent_id: 200678,
                            id: 200975
                        },
                        {
                            
                            display_name: "Giặt xả quần áo trẻ em",
                            name: "Baby Laundry Detergent",
                            
                            
                            children: [],
                            parent_id: 200678,
                            id: 200976
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200678,
                            id: 200977
                        }
                    ],
                    parent_id: 200632,
                    id: 200678
                },
                {
                    
                    display_name: "Đồ dùng phòng ngủ cho bé",
                    name: "Nursery",

                    
                    children: [{
                            
                            display_name: "Nôi & Cũi & Giường cho bé",
                            name: "Cribs & Cradles & Beds",
                            
                            
                            children: [],
                            parent_id: 200679,
                            id: 200978
                        },
                        {
                            
                            display_name: "Ghế rung, Ghế nhún & Xích đu tập đi",
                            name: "Bouncers, Rockers & Jumpers",
                            
                            
                            children: [],
                            parent_id: 200679,
                            id: 200979
                        },
                        {
                            
                            display_name: "Xe tập đi",
                            name: "Walkers",
                            
                            
                            children: [],
                            parent_id: 200679,
                            id: 200980
                        },
                        {
                            
                            display_name: "Nệm và chăn ga",
                            name: "Mattresses & Bedding",
        
                            
                            children: [],
                            parent_id: 200679,
                            id: 200981
                        },
                        {
                            
                            display_name: "Kệ & Tủ",
                            name: "Storage & Organization",
                            
                            
                            children: [],
                            parent_id: 200679,
                            id: 200982
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200679,
                            id: 200983
                        }
                    ],
                    parent_id: 200632,
                    id: 200679
                },
                {
                    
                    display_name: "An toàn cho bé",
                    name: "Baby Safety",

                    
                    children: [{
                            
                            display_name: "Thiết bị giám sát trẻ",
                            name: "Monitors",
                            
                            
                            children: [],
                            parent_id: 200680,
                            id: 200984
                        },
                        {
                            
                            display_name: "Màn chống muỗi",
                            name: "Mosquito Netting",
                            
                            
                            children: [],
                            parent_id: 200680,
                            id: 200985
                        },
                        {
                            
                            display_name: "Bộ đệm cũi, Quây cũi & Thanh chắn giường",
                            name: "Bumpers, Rails & Guards",
                            
                            
                            children: [],
                            parent_id: 200680,
                            id: 200986
                        },
                        {
                            
                            display_name: "Bọc góc & Cạnh",
                            name: "Edge & Corner Guards",
                            
                            
                            children: [],
                            parent_id: 200680,
                            id: 200987
                        },
                        {
                            
                            display_name: "Thanh chắn cửa & Cầu thang",
                            name: "Baby Gates & Doorways",
                            
                            
                            children: [],
                            parent_id: 200680,
                            id: 200988
                        },
                        {
                            
                            display_name: "Khóa & Dây đai an toàn",
                            name: "Safety Locks & Straps",
                            
                            
                            children: [],
                            parent_id: 200680,
                            id: 200989
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200680,
                            id: 200990
                        }
                    ],
                    parent_id: 200632,
                    id: 200680
                },
                {
                    
                    display_name: "Sữa công thức & Thực phẩm cho bé",
                    name: "Milk Formula & Baby Food",

                    
                    children: [{
                            
                            display_name: "Sữa công thức",
                            name: "Milk Formula",
                            
                            
                            children: [],
                            parent_id: 200681,
                            id: 200991
                        },
                        {
                            
                            display_name: "Cháo, Thực phẩm xay nhuyễn & Ngũ cốc",
                            name: "Baby Porridge, Puree & Cereal",
                            
                            
                            children: [],
                            parent_id: 200681,
                            id: 200992
                        },
                        {
                            
                            display_name: "Đồ ăn nhẹ cho bé",
                            name: "Baby Snack",
                            
                            
                            children: [],
                            parent_id: 200681,
                            id: 200993
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200681,
                            id: 200994
                        }
                    ],
                    parent_id: 200632,
                    id: 200681
                },
                {
                    
                    display_name: "Chăm sóc sức khỏe bé",
                    name: "Baby Healthcare",

                    
                    children: [{
                            
                            display_name: "Vitamin & Thực phẩm bổ sung",
                            name: "Baby Vitamins & Supplements",
                            
                            
                            children: [],
                            parent_id: 200682,
                            id: 200995
                        },
                        {
                            
                            display_name: "Chăm sóc mũi cho bé",
                            name: "Nasal Care",
                            
                            
                            children: [],
                            parent_id: 200682,
                            id: 200996
                        },
                        {
                            
                            display_name: "Chăm sóc da cho bé",
                            name: "Baby Skincare",
        
                            
                            children: [],
                            parent_id: 200682,
                            id: 200997
                        },
                        {
                            
                            display_name: "Chăm sóc răng miệng cho bé",
                            name: "Baby Oral Care",
                            
                            
                            children: [],
                            parent_id: 200682,
                            id: 200998
                        },
                        {
                            
                            display_name: "Chống nắng cho bé",
                            name: "Sun Care",
                            
                            
                            children: [],
                            parent_id: 200682,
                            id: 200999
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200682,
                            id: 201000
                        }
                    ],
                    parent_id: 200632,
                    id: 200682
                },
                {
                    
                    display_name: "Tã & bô em bé",
                    name: "Diapering & Potty",

                    
                    children: [{
                            
                            display_name: "Bộ lót thay tã",
                            name: "Changing Pads & Kits",
                            
                            
                            children: [],
                            parent_id: 200683,
                            id: 201001
                        },
                        {
                            
                            display_name: "Bệ thu nhỏ bồn cầu & Bô vệ sinh",
                            name: "Potty Training & Commode Chairs",
                            
                            
                            children: [],
                            parent_id: 200683,
                            id: 201002
                        },
                        {
                            
                            display_name: "Tã dùng một lần",
                            name: "Disposable Diapers",
                            
                            
                            children: [],
                            parent_id: 200683,
                            id: 201003
                        },
                        {
                            
                            display_name: "Tã vải & Phụ kiện",
                            name: "Cloth Diapers & Accessories",
                            
                            
                            children: [],
                            parent_id: 200683,
                            id: 201004
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200683,
                            id: 201005
                        }
                    ],
                    parent_id: 200632,
                    id: 200683
                },
                {
                    
                    display_name: "Đồ chơi",
                    name: "Toys",

                    
                    children: [{
                            
                            display_name: "Đồ chơi cho trẻ sơ sinh & trẻ nhỏ",
                            name: "Baby & Toddler Toys",
        
                            
                            children: [],
                            parent_id: 200684,
                            id: 201006
                        },
                        {
                            
                            display_name: "Đồ chơi lắp ráp",
                            name: "Block Toys",
                            
                            
                            children: [],
                            parent_id: 200684,
                            id: 201007
                        },
                        {
                            
                            display_name: "Búp bê & Thú nhồi bông",
                            name: "Dolls & Stuffed Toys",
        
                            
                            children: [],
                            parent_id: 200684,
                            id: 201008
                        },
                        {
                            
                            display_name: "Đồ chơi nhập vai",
                            name: "Pretend Play",
                            
                            
                            children: [],
                            parent_id: 200684,
                            id: 201009
                        },
                        {
                            
                            display_name: "Xe đồ chơi",
                            name: "Toy Vehicles",
                            
                            
                            children: [],
                            parent_id: 200684,
                            id: 201010
                        },
                        {
                            
                            display_name: "Đồ chơi vận động & Ngoài trời",
                            name: "Sports & Outdoor Play",
        
                            
                            children: [],
                            parent_id: 200684,
                            id: 201011
                        },
                        {
                            
                            display_name: "Đồ chơi giáo dục",
                            name: "Educational Toys",
        
                            
                            children: [],
                            parent_id: 200684,
                            id: 201012
                        },
                        {
                            
                            display_name: "Đồ chơi Robot",
                            name: "Robot Toys",
                            
                            
                            children: [],
                            parent_id: 200684,
                            id: 201013
                        },
                        {
                            
                            display_name: "Slime & Đồ chơi nhựa dẻo",
                            name: "Slime & Squishy Toys",
                            
                            
                            children: [],
                            parent_id: 200684,
                            id: 201014
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200684,
                            id: 201015
                        }
                    ],
                    parent_id: 200632,
                    id: 200684
                },
                {
                    
                    display_name: "Bộ & Gói quà tặng",
                    name: "Gift Sets & Packages",
                    
                    
                    children: [],
                    parent_id: 200632,
                    id: 200685
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200632,
                    id: 200686
                }
            ],
            parent_id: 0,
            id: 200632
        },
        {

            display_name: "Thời trang trẻ em & trẻ sơ sinh",
            name: "Baby & Kids Fashion",

            
            children: [{
                    
                    display_name: "Quần áo trẻ em",
                    name: "Baby Clothes",

                    
                    children: [{
                            
                            display_name: "Áo khoác nhẹ",
                            name: "Regular Outerwear",
                            
                            
                            children: [],
                            parent_id: 200687,
                            id: 201016
                        },
                        {
                            
                            display_name: "Áo khoác mùa đông",
                            name: "Winter Outerwear",
                            
                            
                            children: [],
                            parent_id: 200687,
                            id: 201017
                        },
                        {
                            
                            display_name: "Váy",
                            name: "Dresses",
                            
                            
                            children: [],
                            parent_id: 200687,
                            id: 201018
                        },
                        {
                            
                            display_name: "Quần/Chân váy",
                            name: "Bottoms",
        
                            
                            children: [],
                            parent_id: 200687,
                            id: 201019
                        },
                        {
                            
                            display_name: "Đồ ngủ",
                            name: "Sleepwear",
                            
                            
                            children: [],
                            parent_id: 200687,
                            id: 201020
                        },
                        {
                            
                            display_name: "Áo",
                            name: "Tops",
                            
                            
                            children: [],
                            parent_id: 200687,
                            id: 201021
                        },
                        {
                            
                            display_name: "Bộ đồ liền thân",
                            name: "Bodysuits & Jumpsuits",
                            
                            
                            children: [],
                            parent_id: 200687,
                            id: 201022
                        },
                        {
                            
                            display_name: "Bộ quần áo",
                            name: "Sets",
                            
                            
                            children: [],
                            parent_id: 200687,
                            id: 201023
                        },
                        {
                            
                            display_name: "Đồ bơi",
                            name: "Swimwear",
                            
                            
                            children: [],
                            parent_id: 200687,
                            id: 201024
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200687,
                            id: 201025
                        }
                    ],
                    parent_id: 200633,
                    id: 200687
                },
                {
                    
                    display_name: "Bao tay trẻ em & Tất",
                    name: "Baby Mittens & Footwear",
                    
                    
                    children: [],
                    parent_id: 200633,
                    id: 200688
                },
                {
                    
                    display_name: "Phụ kiện trẻ em & trẻ sơ sinh",
                    name: "Baby & Kids Accessories",

                    
                    children: [{
                            
                            display_name: "Túi xách & vali",
                            name: "Bags & Luggage",
        
                            
                            children: [],
                            parent_id: 200689,
                            id: 201026
                        },
                        {
                            
                            display_name: "Mũ & mũ lưỡi trai",
                            name: "Hats & Caps",
                            
                            
                            children: [],
                            parent_id: 200689,
                            id: 201027
                        },
                        {
                            
                            display_name: "Mắt kính",
                            name: "Eyewear",
                            
                            
                            children: [],
                            parent_id: 200689,
                            id: 201028
                        },
                        {
                            
                            display_name: "Phụ kiện tóc",
                            name: "Hair Accessories",
                            
                            
                            children: [],
                            parent_id: 200689,
                            id: 201029
                        },
                        {
                            
                            display_name: "Găng tay",
                            name: "Gloves",
                            
                            
                            children: [],
                            parent_id: 200689,
                            id: 201030
                        },
                        {
                            
                            display_name: "Thắt lưng",
                            name: "Belts",
                            
                            
                            children: [],
                            parent_id: 200689,
                            id: 201031
                        },
                        {
                            
                            display_name: "Tất",
                            name: "Socks",
                            
                            
                            children: [],
                            parent_id: 200689,
                            id: 201032
                        },
                        {
                            
                            display_name: "Khăn",
                            name: "Scarves",
                            
                            
                            children: [],
                            parent_id: 200689,
                            id: 201033
                        },
                        {
                            
                            display_name: "Đồng hồ",
                            name: "Watches",
                            
                            
                            children: [],
                            parent_id: 200689,
                            id: 201034
                        },
                        {
                            
                            display_name: "Trang sức",
                            name: "Jewelry",
        
                            
                            children: [],
                            parent_id: 200689,
                            id: 201035
                        },
                        {
                            
                            display_name: "Đồ đi mưa",
                            name: "Rain Gear",
        
                            
                            children: [],
                            parent_id: 200689,
                            id: 201036
                        },
                        {
                            
                            display_name: "Chụp tai",
                            name: "Earmuffs",
                            
                            
                            children: [],
                            parent_id: 200689,
                            id: 201037
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200689,
                            id: 201038
                        }
                    ],
                    parent_id: 200633,
                    id: 200689
                },
                {
                    
                    display_name: "Quần áo bé trai",
                    name: "Boy Clothes",

                    
                    children: [{
                            
                            display_name: "Đồ hóa trang",
                            name: "Costumes",
                            
                            
                            children: [],
                            parent_id: 200690,
                            id: 201039
                        },
                        {
                            
                            display_name: "Đồ lót",
                            name: "Underwear & Innerwear",
                            
                            
                            children: [],
                            parent_id: 200690,
                            id: 201040
                        },
                        {
                            
                            display_name: "Đồ ngủ",
                            name: "Sleepwear",
                            
                            
                            children: [],
                            parent_id: 200690,
                            id: 201041
                        },
                        {
                            
                            display_name: "Đồ bơi",
                            name: "Swimwear",
                            
                            
                            children: [],
                            parent_id: 200690,
                            id: 201042
                        },
                        {
                            
                            display_name: "Áo",
                            name: "Tops",
        
                            
                            children: [],
                            parent_id: 200690,
                            id: 201043
                        },
                        {
                            
                            display_name: "Áo khoác",
                            name: "Outerwear",
        
                            
                            children: [],
                            parent_id: 200690,
                            id: 201044
                        },
                        {
                            
                            display_name: "Quần",
                            name: "Bottoms",
        
                            
                            children: [],
                            parent_id: 200690,
                            id: 201045
                        },
                        {
                            
                            display_name: "Com lê & đồ bộ",
                            name: "Suits & Sets",
                            
                            
                            children: [],
                            parent_id: 200690,
                            id: 201046
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200690,
                            id: 201047
                        }
                    ],
                    parent_id: 200633,
                    id: 200690
                },
                {
                    
                    display_name: "Quần áo bé gái",
                    name: "Girl Clothes",

                    
                    children: [{
                            
                            display_name: "Đồ hóa trang",
                            name: "Costumes",
                            
                            
                            children: [],
                            parent_id: 200691,
                            id: 201048
                        },
                        {
                            
                            display_name: "Đồ lót",
                            name: "Underwear & Innerwear",
                            
                            
                            children: [],
                            parent_id: 200691,
                            id: 201049
                        },
                        {
                            
                            display_name: "Đồ ngủ",
                            name: "Sleepwear",
                            
                            
                            children: [],
                            parent_id: 200691,
                            id: 201050
                        },
                        {
                            
                            display_name: "Đồ bơi",
                            name: "Swimwear",
                            
                            
                            children: [],
                            parent_id: 200691,
                            id: 201051
                        },
                        {
                            
                            display_name: "Áo",
                            name: "Tops",
        
                            
                            children: [],
                            parent_id: 200691,
                            id: 201052
                        },
                        {
                            
                            display_name: "Áo khoác",
                            name: "Outerwear",
        
                            
                            children: [],
                            parent_id: 200691,
                            id: 201053
                        },
                        {
                            
                            display_name: "Quần",
                            name: "Bottoms",
        
                            
                            children: [],
                            parent_id: 200691,
                            id: 201054
                        },
                        {
                            
                            display_name: "Đồ liền thân",
                            name: "Rompers, Jumpsuits & Overalls",
                            
                            
                            children: [],
                            parent_id: 200691,
                            id: 201055
                        },
                        {
                            
                            display_name: "Váy",
                            name: "Dresses",
                            
                            
                            children: [],
                            parent_id: 200691,
                            id: 201056
                        },
                        {
                            
                            display_name: "Com lê & đồ bộ",
                            name: "Suits & Sets",
                            
                            
                            children: [],
                            parent_id: 200691,
                            id: 201057
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200691,
                            id: 201058
                        }
                    ],
                    parent_id: 200633,
                    id: 200691
                },
                {
                    
                    display_name: "Giày bé trai",
                    name: "Boy Shoes",

                    
                    children: [{
                            
                            display_name: "Bốt",
                            name: "Boots",
                            
                            
                            children: [],
                            parent_id: 200692,
                            id: 201059
                        },
                        {
                            
                            display_name: "Dép quai hậu",
                            name: "Sandals",
                            
                            
                            children: [],
                            parent_id: 200692,
                            id: 201060
                        },
                        {
                            
                            display_name: "Giày thể thao",
                            name: "Sneakers",
                            
                            
                            children: [],
                            parent_id: 200692,
                            id: 201061
                        },
                        {
                            
                            display_name: "Dép lê",
                            name: "Flip Flops",
                            
                            
                            children: [],
                            parent_id: 200692,
                            id: 201062
                        },
                        {
                            
                            display_name: "Giày tây",
                            name: "Formal Shoes",
                            
                            
                            children: [],
                            parent_id: 200692,
                            id: 201063
                        },
                        {
                            
                            display_name: "Giày lười",
                            name: "Loafers",
                            
                            
                            children: [],
                            parent_id: 200692,
                            id: 201064
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200692,
                            id: 201065
                        }
                    ],
                    parent_id: 200633,
                    id: 200692
                },
                {
                    
                    display_name: "Giày bé gái",
                    name: "Girl Shoes",

                    
                    children: [{
                            
                            display_name: "Bốt",
                            name: "Boots",
                            
                            
                            children: [],
                            parent_id: 200693,
                            id: 201066
                        },
                        {
                            
                            display_name: "Dép quai hậu",
                            name: "Sandals",
                            
                            
                            children: [],
                            parent_id: 200693,
                            id: 201067
                        },
                        {
                            
                            display_name: "Giày thể thao",
                            name: "Sneakers",
                            
                            
                            children: [],
                            parent_id: 200693,
                            id: 201068
                        },
                        {
                            
                            display_name: "Giày lười",
                            name: "Loafers",
                            
                            
                            children: [],
                            parent_id: 200693,
                            id: 201069
                        },
                        {
                            
                            display_name: "Dép lê",
                            name: "Flip Flops",
                            
                            
                            children: [],
                            parent_id: 200693,
                            id: 201070
                        },
                        {
                            
                            display_name: "Giày bệt",
                            name: "Flats",
                            
                            
                            children: [],
                            parent_id: 200693,
                            id: 201071
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200693,
                            id: 201072
                        }
                    ],
                    parent_id: 200633,
                    id: 200693
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200633,
                    id: 200694
                }
            ],
            parent_id: 0,
            id: 200633
        },
        {

            display_name: "Gaming & Console",
            name: "Gaming & Consoles",

            
            children: [{
                    
                    display_name: "Máy chơi game",
                    name: "Console Machines",

                    
                    children: [{
                            
                            display_name: "Playstation",
                            name: "Playstation",
                            
                            
                            children: [],
                            parent_id: 200695,
                            id: 201073
                        },
                        {
                            
                            display_name: "Xbox",
                            name: "Xbox",
                            
                            
                            children: [],
                            parent_id: 200695,
                            id: 201074
                        },
                        {
                            
                            display_name: "Wii",
                            name: "Wii",
                            
                            
                            children: [],
                            parent_id: 200695,
                            id: 201075
                        },
                        {
                            
                            display_name: "Nintendo DS",
                            name: "Nintendo DS",
                            
                            
                            children: [],
                            parent_id: 200695,
                            id: 201076
                        },
                        {
                            
                            display_name: "Gameboy",
                            name: "Gameboy",
                            
                            
                            children: [],
                            parent_id: 200695,
                            id: 201077
                        },
                        {
                            
                            display_name: "Switch",
                            name: "Switch",
                            
                            
                            children: [],
                            parent_id: 200695,
                            id: 201078
                        },
                        {
                            
                            display_name: "PS Vita",
                            name: "PS Vita",
                            
                            
                            children: [],
                            parent_id: 200695,
                            id: 201079
                        },
                        {
                            
                            display_name: "PSP",
                            name: "PSP",
                            
                            
                            children: [],
                            parent_id: 200695,
                            id: 201080
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200695,
                            id: 201081
                        }
                    ],
                    parent_id: 200634,
                    id: 200695
                },
                {
                    
                    display_name: "Phụ kiện console",
                    name: "Console Accessories",
                    
                    
                    children: [],
                    parent_id: 200634,
                    id: 200696
                },
                {
                    
                    display_name: "Video Games",
                    name: "Video Games",

                    
                    children: [{
                            
                            display_name: "Game Playstation",
                            name: "Playstation",
                            
                            
                            children: [],
                            parent_id: 200697,
                            id: 201082
                        },
                        {
                            
                            display_name: "Game Xbox",
                            name: "Xbox",
                            
                            
                            children: [],
                            parent_id: 200697,
                            id: 201083
                        },
                        {
                            
                            display_name: "Game Wii",
                            name: "Wii",
                            
                            
                            children: [],
                            parent_id: 200697,
                            id: 201084
                        },
                        {
                            
                            display_name: "Game Nintendo DS",
                            name: "Nintendo DS",
                            
                            
                            children: [],
                            parent_id: 200697,
                            id: 201085
                        },
                        {
                            
                            display_name: "Game Gameboy",
                            name: "Gameboy",
                            
                            
                            children: [],
                            parent_id: 200697,
                            id: 201086
                        },
                        {
                            
                            display_name: "Game Switch",
                            name: "Switch",
                            
                            
                            children: [],
                            parent_id: 200697,
                            id: 201087
                        },
                        {
                            
                            display_name: "Game PS Vita",
                            name: "PS Vita",
                            
                            
                            children: [],
                            parent_id: 200697,
                            id: 201088
                        },
                        {
                            
                            display_name: "Game PSP",
                            name: "PSP",
                            
                            
                            children: [],
                            parent_id: 200697,
                            id: 201089
                        },
                        {
                            
                            display_name: "Game PC",
                            name: "PC Game",
                            
                            
                            children: [],
                            parent_id: 200697,
                            id: 201090
                        },
                        {
                            
                            display_name: "Game Máy Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200697,
                            id: 201091
                        }
                    ],
                    parent_id: 200634,
                    id: 200697
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200634,
                    id: 200698
                }
            ],
            parent_id: 0,
            id: 200634
        },
        {

            display_name: "Cameras & Flycam",
            name: "Cameras & Drones",

            
            children: [{
                    
                    display_name: "Máy ảnh",
                    name: "Cameras",

                    
                    children: [{
                            
                            display_name: "Máy ảnh kỹ thuật số",
                            name: "Point & Shoot",
                            
                            
                            children: [],
                            parent_id: 200699,
                            id: 201092
                        },
                        {
                            
                            display_name: "Máy ảnh không gương lật",
                            name: "Mirrorless Cameras",
                            
                            
                            children: [],
                            parent_id: 200699,
                            id: 201093
                        },
                        {
                            
                            display_name: "Máy quay hành động",
                            name: "Action Cameras",
                            
                            
                            children: [],
                            parent_id: 200699,
                            id: 201094
                        },
                        {
                            
                            display_name: "Máy quay phim",
                            name: "Video Camcorders",
                            
                            
                            children: [],
                            parent_id: 200699,
                            id: 201095
                        },
                        {
                            
                            display_name: "Máy ảnh chụp lấy liền",
                            name: "Instant Cameras",
                            
                            
                            children: [],
                            parent_id: 200699,
                            id: 201096
                        },
                        {
                            
                            display_name: "Máy ảnh film",
                            name: "Analog Cameras",
                            
                            
                            children: [],
                            parent_id: 200699,
                            id: 201097
                        },
                        {
                            
                            display_name: "Máy ảnh cơ/DSLRs",
                            name: "DSLRs",
                            
                            
                            children: [],
                            parent_id: 200699,
                            id: 201098
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200699,
                            id: 201099
                        }
                    ],
                    parent_id: 200635,
                    id: 200699
                },
                {
                    
                    display_name: "Camera giám sát",
                    name: "Security Cameras & Systems",

                    
                    children: [{
                            
                            display_name: "Camera giám sát kết nối internet",
                            name: "CCTV Security Cameras",
                            
                            
                            children: [],
                            parent_id: 200700,
                            id: 201100
                        },
                        {
                            
                            display_name: "Đầu ghi hình",
                            name: "DVRs",
                            
                            
                            children: [],
                            parent_id: 200700,
                            id: 201101
                        },
                        {
                            
                            display_name: "Camera giả chống trộm",
                            name: "Dummy Cameras",
                            
                            
                            children: [],
                            parent_id: 200700,
                            id: 201102
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200700,
                            id: 201104
                        }
                    ],
                    parent_id: 200635,
                    id: 200700
                },
                {
                    
                    display_name: "Ống kính",
                    name: "Lenses",
                    
                    
                    children: [],
                    parent_id: 200635,
                    id: 200701
                },
                {
                    
                    display_name: "Phụ kiện ống kính",
                    name: "Lens Accessories",

                    
                    children: [{
                            
                            display_name: "Ngàm ống kính & Ngàm chuyển đổi ống",
                            name: "Lens Mount & Adaptors",
                            
                            
                            children: [],
                            parent_id: 200702,
                            id: 201105
                        },
                        {
                            
                            display_name: "Nắp ống kính",
                            name: "Lens Caps",
                            
                            
                            children: [],
                            parent_id: 200702,
                            id: 201106
                        },
                        {
                            
                            display_name: "Kính lọc",
                            name: "Filters",
                            
                            
                            children: [],
                            parent_id: 200702,
                            id: 201107
                        },
                        {
                            
                            display_name: "Loa che sáng ống kính",
                            name: "Lens Hoods",
                            
                            
                            children: [],
                            parent_id: 200702,
                            id: 201108
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200702,
                            id: 201109
                        }
                    ],
                    parent_id: 200635,
                    id: 200702
                },
                {
                    
                    display_name: "Phụ kiện máy ảnh",
                    name: "Camera Accessories",

                    
                    children: [{
                            
                            display_name: "Đèn Flash",
                            name: "Flashes",
                            
                            
                            children: [],
                            parent_id: 200703,
                            id: 201110
                        },
                        {
                            
                            display_name: "Phụ kiện đèn Flash",
                            name: "Flash Accessories",
        
                            
                            children: [],
                            parent_id: 200703,
                            id: 201111
                        },
                        {
                            
                            display_name: "Tay cầm chống rung",
                            name: "Gimbals & Stabilizers",
                            
                            
                            children: [],
                            parent_id: 200703,
                            id: 201112
                        },
                        {
                            
                            display_name: "Thiết bị ánh sáng và phòng chụp",
                            name: "Lighting & Studio Equipments",
                            
                            
                            children: [],
                            parent_id: 200703,
                            id: 201113
                        },
                        {
                            
                            display_name: "Giấy & phim in ảnh",
                            name: "Photo Films & Papers",
                            
                            
                            children: [],
                            parent_id: 200703,
                            id: 201114
                        },
                        {
                            
                            display_name: "Máy in ảnh",
                            name: "Photo Printers",
                            
                            
                            children: [],
                            parent_id: 200703,
                            id: 201115
                        },
                        {
                            
                            display_name: "Túi đựng máy ảnh",
                            name: "Camera Cases & Bags",
                            
                            
                            children: [],
                            parent_id: 200703,
                            id: 201116
                        },
                        {
                            
                            display_name: "Bộ sạc pin",
                            name: "Battery Chargers",
                            
                            
                            children: [],
                            parent_id: 200703,
                            id: 201117
                        },
                        {
                            
                            display_name: "Đế pin",
                            name: "Batteries & Battery Grips",
                            
                            
                            children: [],
                            parent_id: 200703,
                            id: 201118
                        },
                        {
                            
                            display_name: "Chân máy ảnh",
                            name: "Tripods, Monopods, & Accessories",
                            
                            
                            children: [],
                            parent_id: 200703,
                            id: 201119
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200703,
                            id: 201120
                        }
                    ],
                    parent_id: 200635,
                    id: 200703
                },
                {
                    
                    display_name: "Phụ kiện chăm sóc máy ảnh",
                    name: "Camera Care",

                    
                    children: [{
                            
                            display_name: "Tủ & hộp chống ẩm",
                            name: "Dry Boxes & Cabinets",
                            
                            
                            children: [],
                            parent_id: 200704,
                            id: 201121
                        },
                        {
                            
                            display_name: "Bộ vệ sinh máy ảnh",
                            name: "Cleaning Kit",
                            
                            
                            children: [],
                            parent_id: 200704,
                            id: 201122
                        },
                        {
                            
                            display_name: "Gói hút ẩm",
                            name: "Silica Gel",
                            
                            
                            children: [],
                            parent_id: 200704,
                            id: 201123
                        },
                        {
                            
                            display_name: "Bóng thổi bụi",
                            name: "Blowers",
                            
                            
                            children: [],
                            parent_id: 200704,
                            id: 201124
                        },
                        {
                            
                            display_name: "Bút lau & bàn chải làm sạch ống kính",
                            name: "Lenspens & Brushes",
                            
                            
                            children: [],
                            parent_id: 200704,
                            id: 201125
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200704,
                            id: 201126
                        }
                    ],
                    parent_id: 200635,
                    id: 200704
                },
                {
                    
                    display_name: "Flycam",
                    name: "Drones",
                    
                    
                    children: [],
                    parent_id: 200635,
                    id: 200705
                },
                {
                    
                    display_name: "Phụ kiện Flycam",
                    name: "Drone Accessories",
                    
                    
                    children: [],
                    parent_id: 200635,
                    id: 200706
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200635,
                    id: 200707
                }
            ],
            parent_id: 0,
            id: 200635
        },
        {

            display_name: "Nhà cửa & Đời sống",
            name: "Home & Living",

            
            children: [{
                    
                    display_name: "Chất khử mùi, làm thơm nhà",
                    name: "Home Fragrance & Aromatherapy",

                    
                    children: [{
                            
                            display_name: "Chất khử mùi, làm thơm",
                            name: "Air Fresheners & Home Fragrance",
                            
                            
                            children: [],
                            parent_id: 200708,
                            id: 201127
                        },
                        {
                            
                            display_name: "Tinh dầu thơm",
                            name: "Essential Oils",
                            
                            
                            children: [],
                            parent_id: 200708,
                            id: 201128
                        },
                        {
                            
                            display_name: "Máy khuếch tán, tạo ẩm & xông tinh dầu",
                            name: "Diffusers, Humidifiers & Oil Burners",
                            
                            
                            children: [],
                            parent_id: 200708,
                            id: 201129
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200708,
                            id: 201130
                        }
                    ],
                    parent_id: 200636,
                    id: 200708
                },
                {
                    
                    display_name: "Đồ dùng phòng tắm",
                    name: "Bathrooms",

                    
                    children: [{
                            
                            display_name: "Bồn cầu, ghế và nắp bồn cầu",
                            name: "Toilet Bowls, Seats & Covers",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201131
                        },
                        {
                            
                            display_name: "Kệ đựng bàn chải, kệ nhả kem đánh răng",
                            name: "Toothbrush Holders & Toothpaste Dispensers",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201132
                        },
                        {
                            
                            display_name: "Kệ đựng xà phòng",
                            name: "Soap Dispensers, Holders & Boxes",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201133
                        },
                        {
                            
                            display_name: "Kệ để đồ phòng tắm",
                            name: "Bathroom Racks & Cabinets",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201134
                        },
                        {
                            
                            display_name: "Bồn tắm",
                            name: "Bathtubs",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201135
                        },
                        {
                            
                            display_name: "Khăn mặt, khăn tắm, áo choàng tắm",
                            name: "Towels & Bathrobes",
        
                            
                            children: [],
                            parent_id: 200709,
                            id: 201136
                        },
                        {
                            
                            display_name: "Vòi sen & vòi xịt vệ sinh",
                            name: "Showerheads & Bidet Sprays",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201137
                        },
                        {
                            
                            display_name: "Bông tắm",
                            name: "Bath Brushes & Loofahs",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201138
                        },
                        {
                            
                            display_name: "Rèm cửa nhà tắm",
                            name: "Shower Curtains",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201139
                        },
                        {
                            
                            display_name: "Ghế nhà tắm, ghế chống trượt",
                            name: "Shower Seats & Commodes",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201140
                        },
                        {
                            
                            display_name: "Tay cầm an toàn",
                            name: "Safety Handles",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201141
                        },
                        {
                            
                            display_name: "Mũ tắm",
                            name: "Shower Caps",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201142
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201143
                        }
                    ],
                    parent_id: 200636,
                    id: 200709
                },
                {
                    
                    display_name: "Chăn ga gối nệm",
                    name: "Bedding",

                    
                    children: [{
                            
                            display_name: "Chiếu điều hòa",
                            name: "Cooling Mats",
                            
                            
                            children: [],
                            parent_id: 200710,
                            id: 201144
                        },
                        {
                            
                            display_name: "Tấm bảo vệ nệm, topper",
                            name: "Mattress Protectors & Toppers",
                            
                            
                            children: [],
                            parent_id: 200710,
                            id: 201145
                        },
                        {
                            
                            display_name: "Chăn, mền",
                            name: "Blankets, Comforters & Quilts",
                            
                            
                            children: [],
                            parent_id: 200710,
                            id: 201146
                        },
                        {
                            
                            display_name: "Gối",
                            name: "Pillows",
                            
                            
                            children: [],
                            parent_id: 200710,
                            id: 201147
                        },
                        {
                            
                            display_name: "Ga trải giường, vỏ gối",
                            name: "Bedsheets, Pillowcases & Bolster Cases",
                            
                            
                            children: [],
                            parent_id: 200710,
                            id: 201148
                        },
                        {
                            
                            display_name: "Nệm",
                            name: "Mattresses",
                            
                            
                            children: [],
                            parent_id: 200710,
                            id: 201149
                        },
                        {
                            
                            display_name: "Mùng/ Màn chống muỗi",
                            name: "Mosquito Nets",
                            
                            
                            children: [],
                            parent_id: 200710,
                            id: 201150
                        },
                        {
                            
                            display_name: "Gối ôm",
                            name: "Bolsters",
                            
                            
                            children: [],
                            parent_id: 200710,
                            id: 201151
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200710,
                            id: 201152
                        }
                    ],
                    parent_id: 200636,
                    id: 200710
                },
                {
                    
                    display_name: "Trang trí nhà cửa",
                    name: "Decoration",

                    
                    children: [{
                            
                            display_name: "Hoa trang trí",
                            name: "Flowers",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201153
                        },
                        {
                            
                            display_name: "Vỏ bọc nội thất",
                            name: "Furniture & Appliance Covers",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201154
                        },
                        {
                            
                            display_name: "Rèm cửa, màn che",
                            name: "Curtains & Blinds",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201155
                        },
                        {
                            
                            display_name: "Khung ảnh & vật trang trí tường",
                            name: "Photo Frames & Wall Decoration",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201156
                        },
                        {
                            
                            display_name: "Decal, tranh dán tường",
                            name: "Wallpapers & Wall Stickers",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201157
                        },
                        {
                            
                            display_name: "Đồng hồ",
                            name: "Clocks",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201158
                        },
                        {
                            
                            display_name: "Thảm chùi chân",
                            name: "Floor Mats",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201159
                        },
                        {
                            
                            display_name: "Thảm trải sàn",
                            name: "Carpets & Rugs",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201160
                        },
                        {
                            
                            display_name: "Bình trang trí",
                            name: "Vases & Vessels",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201161
                        },
                        {
                            
                            display_name: "Nến & đồ đựng nến",
                            name: "Candles & Candleholders",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201162
                        },
                        {
                            
                            display_name: "Gương",
                            name: "Mirrors",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201163
                        },
                        {
                            
                            display_name: "Khăn trải bàn",
                            name: "Table Cloths",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201164
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201165
                        }
                    ],
                    parent_id: 200636,
                    id: 200711
                },
                {
                    
                    display_name: "Túi làm ấm",
                    name: "Hand Warmers, Hot Water Bags & Ice Bags",
                    
                    
                    children: [],
                    parent_id: 200636,
                    id: 200712
                },
                {
                    
                    display_name: "Nội thất",
                    name: "Furniture",

                    
                    children: [{
                            
                            display_name: "Đệm ngồi",
                            name: "Cushions",
                            
                            
                            children: [],
                            parent_id: 200713,
                            id: 201166
                        },
                        {
                            
                            display_name: "Miếng chặn cửa",
                            name: "Doorstoppers",
                            
                            
                            children: [],
                            parent_id: 200713,
                            id: 201167
                        },
                        {
                            
                            display_name: "Giường, khung giường",
                            name: "Bed Frames & Headboards",
                            
                            
                            children: [],
                            parent_id: 200713,
                            id: 201168
                        },
                        {
                            
                            display_name: "Bàn",
                            name: "Desks & Tables",
                            
                            
                            children: [],
                            parent_id: 200713,
                            id: 201169
                        },
                        {
                            
                            display_name: "Tủ quần áo",
                            name: "Wardrobes",
                            
                            
                            children: [],
                            parent_id: 200713,
                            id: 201170
                        },
                        {
                            
                            display_name: "Ghế, ghế dài, ghế đẩu",
                            name: "Benches, Chairs & Stools",
                            
                            
                            children: [],
                            parent_id: 200713,
                            id: 201171
                        },
                        {
                            
                            display_name: "Ghế sofa",
                            name: "Sofas",
                            
                            
                            children: [],
                            parent_id: 200713,
                            id: 201172
                        },
                        {
                            
                            display_name: "Tủ bếp",
                            name: "Cupboards & Cabinets",
                            
                            
                            children: [],
                            parent_id: 200713,
                            id: 201173
                        },
                        {
                            
                            display_name: "Kệ & Giá",
                            name: "Shelves & Racks",
                            
                            
                            children: [],
                            parent_id: 200713,
                            id: 201174
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200713,
                            id: 201175
                        }
                    ],
                    parent_id: 200636,
                    id: 200713
                },
                {
                    
                    display_name: "Làm vườn",
                    name: "Gardening",

                    
                    children: [{
                            
                            display_name: "Cây cảnh",
                            name: "Plants",
                            
                            
                            children: [],
                            parent_id: 200714,
                            id: 201176
                        },
                        {
                            
                            display_name: "Trang trí vườn",
                            name: "Garden Decorations",
                            
                            
                            children: [],
                            parent_id: 200714,
                            id: 201177
                        },
                        {
                            
                            display_name: "Đất trồng",
                            name: "Garden Soils & Growing Media",
                            
                            
                            children: [],
                            parent_id: 200714,
                            id: 201178
                        },
                        {
                            
                            display_name: "Phân bón",
                            name: "Fertilizer",
                            
                            
                            children: [],
                            parent_id: 200714,
                            id: 201179
                        },
                        {
                            
                            display_name: "Hạt giống & chất hỗ trợ trồng cây",
                            name: "Seeds & Bulbs",
                            
                            
                            children: [],
                            parent_id: 200714,
                            id: 201180
                        },
                        {
                            
                            display_name: "Chậu cây",
                            name: "Pots & Planters",
                            
                            
                            children: [],
                            parent_id: 200714,
                            id: 201181
                        },
                        {
                            
                            display_name: "Hệ thống tưới nước",
                            name: "Irrigation Systems",
                            
                            
                            children: [],
                            parent_id: 200714,
                            id: 201182
                        },
                        {
                            
                            display_name: "Dụng cụ làm vườn",
                            name: "Gardening Tools",
                            
                            
                            children: [],
                            parent_id: 200714,
                            id: 201183
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200714,
                            id: 201184
                        },
                        {
                            
                            display_name: "Máy cắt cỏ, dụng cụ cắt cỏ",
                            name: "Lawn Mowers",
                            
                            
                            children: [],
                            parent_id: 200714,
                            id: 201185
                        }
                    ],
                    parent_id: 200636,
                    id: 200714
                },
                {
                    
                    display_name: "Dụng cụ & Thiết bị tiện ích",
                    name: "Tools & Home Improvement",

                    
                    children: [{
                            
                            display_name: "Keo & chất kết chính công nghiệp",
                            name: "Industrial Adhesives & Tapes",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201186
                        },
                        {
                            
                            display_name: "Găng tay, kính bảo hộ & mặt nạ",
                            name: "Protective Gloves, Goggles & Masks",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201187
                        },
                        {
                            
                            display_name: "Chậu rửa & vòi nước",
                            name: "Sinks & Water Taps",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201188
                        },
                        {
                            
                            display_name: "Mái & sàn",
                            name: "Roofing & Flooring",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201189
                        },
                        {
                            
                            display_name: "Sơn & chất chống thấm tường",
                            name: "Wall Paints & Coatings",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201190
                        },
                        {
                            
                            display_name: "Dụng cụ",
                            name: "Tools",
        
                            
                            children: [],
                            parent_id: 200715,
                            id: 201191
                        },
                        {
                            
                            display_name: "Máy bơm nước & phụ kiện",
                            name: "Water Pumps, Parts & Accessories",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201192
                        },
                        {
                            
                            display_name: "Máy bơm khí & phụ kiện",
                            name: "Air Pumps, Parts & Accessories",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201193
                        },
                        {
                            
                            display_name: "Thang",
                            name: "Ladders",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201194
                        },
                        {
                            
                            display_name: "Xe đẩy",
                            name: "Trollies",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201195
                        },
                        {
                            
                            display_name: "Mái hiên, bạt phủ",
                            name: "Shades, Awnings & Tarpaulins",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201196
                        },
                        {
                            
                            display_name: "Vật liệu xây dựng",
                            name: "Construction Materials",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201197
                        },
                        {
                            
                            display_name: "Cửa & cửa sổ",
                            name: "Doors & Windows",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201198
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201199
                        }
                    ],
                    parent_id: 200636,
                    id: 200715
                },
                {
                    
                    display_name: "Dụng cụ chăm sóc nhà cửa",
                    name: "Home Care Supplies",

                    
                    children: [{
                            
                            display_name: "Dây phơi & giá phơi quần áo",
                            name: "Clotheslines & Drying Racks",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201200
                        },
                        {
                            
                            display_name: "Bàn chải vệ sinh",
                            name: "Cleaning Brushes",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201201
                        },
                        {
                            
                            display_name: "Chổi",
                            name: "Brooms",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201202
                        },
                        {
                            
                            display_name: "Chổi phủi bụi",
                            name: "Dusters",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201203
                        },
                        {
                            
                            display_name: "Cây lau nhà",
                            name: "Mops",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201204
                        },
                        {
                            
                            display_name: "Chậu, xô & gáo nước",
                            name: "Basins, Buckets & Water Dippers",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201205
                        },
                        {
                            
                            display_name: "Miếng bọt biển, miếng chà vệ sinh",
                            name: "Sponges & Scouring Pads",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201206
                        },
                        {
                            
                            display_name: "Thùng rác",
                            name: "Trash & Recycling Bins",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201207
                        },
                        {
                            
                            display_name: "Túi nilon & túi rác",
                            name: "Plastic Bags & Trash Bags",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201208
                        },
                        {
                            
                            display_name: "Khăn vệ sinh",
                            name: "Cleaning Cloths",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201209
                        },
                        {
                            
                            display_name: "Thuốc và dụng cụ diệt côn trùng",
                            name: "Pest & Weed Control",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201210
                        },
                        {
                            
                            display_name: "Khăn giấy, giấy ướt",
                            name: "Tissue & Paper Towels",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201211
                        },
                        {
                            
                            display_name: "Giấy vệ sinh",
                            name: "Toilet Paper",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201212
                        },
                        {
                            
                            display_name: "Chất tẩy rửa",
                            name: "Cleaning Agents",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201213
                        },
                        {
                            
                            display_name: "Phụ kiện giặt là",
                            name: "Laundry Care",
        
                            
                            children: [],
                            parent_id: 200716,
                            id: 201214
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201215
                        }
                    ],
                    parent_id: 200636,
                    id: 200716
                },
                {
                    
                    display_name: "Dụng cụ nhà bếp",
                    name: "Kitchenware",

                    
                    children: [{
                            
                            display_name: "Lò nướng & phụ kiện",
                            name: "Grills & Accessories",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201216
                        },
                        {
                            
                            display_name: "Dụng cụ nướng & trang trí bánh",
                            name: "Bakewares & Decorations",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201217
                        },
                        {
                            
                            display_name: "Chảo",
                            name: "Pans",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201218
                        },
                        {
                            
                            display_name: "Nồi",
                            name: "Pots",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201219
                        },
                        {
                            
                            display_name: "Hộp đựng thực phẩm",
                            name: "Food Storage",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201220
                        },
                        {
                            
                            display_name: "Màng bọc thực phẩm",
                            name: "Cling Wrap",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201221
                        },
                        {
                            
                            display_name: "Giấy bạc",
                            name: "Aluminium Foil",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201222
                        },
                        {
                            
                            display_name: "Dụng cụ pha trà, cà phê",
                            name: "Tea, Coffee & Bartending Equipments",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201223
                        },
                        {
                            
                            display_name: "Kệ để đồ nhà bếp",
                            name: "Kitchen Racks",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201224
                        },
                        {
                            
                            display_name: "Tạp dề & gắng tay nấu nướng",
                            name: "Aprons & Kitchen Gloves",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201225
                        },
                        {
                            
                            display_name: "Cây vét bột & đồ gắp thức ăn",
                            name: "Spatulas & Cooking Tweezers",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201226
                        },
                        {
                            
                            display_name: "Thớt",
                            name: "Chopping Boards",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201227
                        },
                        {
                            
                            display_name: "Dao & kéo",
                            name: "Knives & Kitchen Scissors",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201228
                        },
                        {
                            
                            display_name: "Phới đánh trứng",
                            name: "Whisks & Beaters",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201229
                        },
                        {
                            
                            display_name: "Dụng cụ mở hộp",
                            name: "Can & Bottle Openers",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201230
                        },
                        {
                            
                            display_name: "Dụng cụ đo lường",
                            name: "Measuring Glasses & Spoons",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201231
                        },
                        {
                            
                            display_name: "Dụng cụ lọc",
                            name: "Strainers",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201232
                        },
                        {
                            
                            display_name: "Bàn nạo, dụng cụ bào, cắt",
                            name: "Graters, Peelers & Cutters",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201233
                        },
                        {
                            
                            display_name: "Cân nhà bếp",
                            name: "Kitchen Weighing Scales",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201234
                        },
                        {
                            
                            display_name: "Dụng cụ hút chân không",
                            name: "Sealers",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201235
                        },
                        {
                            
                            display_name: "Bật lửa, diêm và mồi lửa",
                            name: "Lighters, Matches & Fire Starters",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201236
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201237
                        }
                    ],
                    parent_id: 200636,
                    id: 200717
                },
                {
                    
                    display_name: "Bộ đồ bàn ăn",
                    name: "Dinnerware",

                    
                    children: [{
                            
                            display_name: "Bình nước",
                            name: "Jugs, Pitchers & Accessories",
                            
                            
                            children: [],
                            parent_id: 200718,
                            id: 201238
                        },
                        {
                            
                            display_name: "Bộ ấm trà",
                            name: "Tea Pots & Sets",
                            
                            
                            children: [],
                            parent_id: 200718,
                            id: 201239
                        },
                        {
                            
                            display_name: "Cốc, ly, tách uống nước",
                            name: "Cups, Mugs & Glasses",
                            
                            
                            children: [],
                            parent_id: 200718,
                            id: 201240
                        },
                        {
                            
                            display_name: "Bình nước & phụ kiện",
                            name: "Water Bottles & Accessories",
                            
                            
                            children: [],
                            parent_id: 200718,
                            id: 201241
                        },
                        {
                            
                            display_name: "Tô",
                            name: "Bowls",
                            
                            
                            children: [],
                            parent_id: 200718,
                            id: 201242
                        },
                        {
                            
                            display_name: "Dĩa",
                            name: "Plates",
                            
                            
                            children: [],
                            parent_id: 200718,
                            id: 201243
                        },
                        {
                            
                            display_name: "Bộ dao kéo",
                            name: "Cutleries",
                            
                            
                            children: [],
                            parent_id: 200718,
                            id: 201244
                        },
                        {
                            
                            display_name: "Ống hút",
                            name: "Straws",
                            
                            
                            children: [],
                            parent_id: 200718,
                            id: 201245
                        },
                        {
                            
                            display_name: "Lồng bàn",
                            name: "Food Covers",
                            
                            
                            children: [],
                            parent_id: 200718,
                            id: 201246
                        },
                        {
                            
                            display_name: "Khay, tấm lót bàn ăn",
                            name: "Placemats & Coasters",
                            
                            
                            children: [],
                            parent_id: 200718,
                            id: 201247
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200718,
                            id: 201248
                        }
                    ],
                    parent_id: 200636,
                    id: 200718
                },
                {
                    
                    display_name: "Đèn",
                    name: "Lighting",
                    
                    
                    children: [],
                    parent_id: 200636,
                    id: 200719
                },
                {
                    
                    display_name: "Bảo hộ gia đình",
                    name: "Safety & Security",

                    
                    children: [{
                            
                            display_name: "Két sắt",
                            name: "Safes",
                            
                            
                            children: [],
                            parent_id: 200720,
                            id: 201249
                        },
                        {
                            
                            display_name: "Thiết bị chữa cháy",
                            name: "Fire Fighting Equipments",
                            
                            
                            children: [],
                            parent_id: 200720,
                            id: 201250
                        },
                        {
                            
                            display_name: "Khóa, ổ khóa",
                            name: "Door Hardware & Locks",
                            
                            
                            children: [],
                            parent_id: 200720,
                            id: 201251
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200720,
                            id: 201252
                        }
                    ],
                    parent_id: 200636,
                    id: 200720
                },
                {
                    
                    display_name: "Sắp xếp nhà cửa",
                    name: "Home Organizers",

                    
                    children: [{
                            
                            display_name: "Mắc áo",
                            name: "Hangers & Pegs",
                            
                            
                            children: [],
                            parent_id: 200721,
                            id: 201253
                        },
                        {
                            
                            display_name: "Hộp đựng, giỏ đựng đồ",
                            name: "Storage Boxes, Bags & Baskets",
                            
                            
                            children: [],
                            parent_id: 200721,
                            id: 201254
                        },
                        {
                            
                            display_name: "Kệ giày, hộp giày",
                            name: "Shoe Storage Boxes",
                            
                            
                            children: [],
                            parent_id: 200721,
                            id: 201255
                        },
                        {
                            
                            display_name: "Móc treo",
                            name: "Hooks",
                            
                            
                            children: [],
                            parent_id: 200721,
                            id: 201256
                        },
                        {
                            
                            display_name: "Túi giặt, giỏ đựng quần áo",
                            name: "Laundry Bags & Baskets",
                            
                            
                            children: [],
                            parent_id: 200721,
                            id: 201257
                        },
                        {
                            
                            display_name: "Kệ sách để bàn",
                            name: "Desk Organizers",
                            
                            
                            children: [],
                            parent_id: 200721,
                            id: 201258
                        },
                        {
                            
                            display_name: "Sắp xếp tủ quần áo",
                            name: "Wardrobe Organizers",
                            
                            
                            children: [],
                            parent_id: 200721,
                            id: 201259
                        },
                        {
                            
                            display_name: "Hộp đựng trang sức",
                            name: "Jewelry Organizers",
                            
                            
                            children: [],
                            parent_id: 200721,
                            id: 201260
                        },
                        {
                            
                            display_name: "Hộp khăn giấy",
                            name: "Tissue Holders",
                            
                            
                            children: [],
                            parent_id: 200721,
                            id: 201261
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200721,
                            id: 201262
                        }
                    ],
                    parent_id: 200636,
                    id: 200721
                },
                {
                    
                    display_name: "Trang trí tiệc tùng",
                    name: "Party Supplies",

                    
                    children: [{
                            
                            display_name: "Bong bóng",
                            name: "Balloons",
                            
                            
                            children: [],
                            parent_id: 200722,
                            id: 201263
                        },
                        {
                            
                            display_name: "Kẹp gỗ",
                            name: "Wooden Clips",
                            
                            
                            children: [],
                            parent_id: 200722,
                            id: 201264
                        },
                        {
                            
                            display_name: "Phông nền, biểu ngữ",
                            name: "Backdrops & Banners",
                            
                            
                            children: [],
                            parent_id: 200722,
                            id: 201265
                        },
                        {
                            
                            display_name: "Thiệp",
                            name: "Cards",
                            
                            
                            children: [],
                            parent_id: 200722,
                            id: 201266
                        },
                        {
                            
                            display_name: "Chén, đĩa dùng một lần",
                            name: "Disposable Tableware",
                            
                            
                            children: [],
                            parent_id: 200722,
                            id: 201267
                        },
                        {
                            
                            display_name: "Mũ, mặt nạ dự tiệc",
                            name: "Party Hats & Masks",
                            
                            
                            children: [],
                            parent_id: 200722,
                            id: 201268
                        },
                        {
                            
                            display_name: "Băng đeo chéo",
                            name: "Sashes",
                            
                            
                            children: [],
                            parent_id: 200722,
                            id: 201269
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200722,
                            id: 201270
                        }
                    ],
                    parent_id: 200636,
                    id: 200722
                },
                {
                    
                    display_name: "Đồ thờ cúng, đồ phong thủy",
                    name: "Fengshui & Religious Supplies",
                    
                    
                    children: [],
                    parent_id: 200636,
                    id: 200723
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200636,
                    id: 200724
                }
            ],
            parent_id: 0,
            id: 200636
        },
        {

            display_name: "Thể Thao & Dã Ngoại",
            name: "Sports & Outdoors",

            
            children: [{
                    
                    display_name: "Dụng Cụ Thể Thao & Dã Ngoại",
                    name: "Sports & Outdoor Recreation Equipments",

                    
                    children: [{
                            
                            display_name: "Câu Cá",
                            name: "Fishing",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201271
                        },
                        {
                            
                            display_name: "Đạp Xe",
                            name: "Cycling",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201272
                        },
                        {
                            
                            display_name: "Cắm Trại & Dã ngoại",
                            name: "Camping & Hiking",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201273
                        },
                        {
                            
                            display_name: "Leo Núi",
                            name: "Rock Climbing",
                            
                            
                            children: [],
                            parent_id: 200725,
                            id: 201274
                        },
                        {
                            
                            display_name: "Thể Thao Ván Trượt",
                            name: "Boardsports",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201275
                        },
                        {
                            
                            display_name: "Bóng Đá, Futsal & Cầu Mây",
                            name: "Soccer, Futsal & Sepak Takraw",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201277
                        },
                        {
                            
                            display_name: "Bóng Rổ",
                            name: "Basketball",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201278
                        },
                        {
                            
                            display_name: "Bóng Chuyền",
                            name: "Volleyball",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201279
                        },
                        {
                            
                            display_name: "Cầu Lông",
                            name: "Badminton",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201280
                        },
                        {
                            
                            display_name: "Tennis",
                            name: "Tennis",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201281
                        },
                        {
                            
                            display_name: "Bóng Bàn",
                            name: "Table Tennis",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201282
                        },
                        {
                            
                            display_name: "Đấm bốc & Võ Tổng Hợp",
                            name: "Boxing & Martial Arts",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201283
                        },
                        {
                            
                            display_name: "Golf",
                            name: "Golf",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201284
                        },
                        {
                            
                            display_name: "Bóng Chày & Bóng Ném",
                            name: "Baseball & Softball",
                            
                            
                            children: [],
                            parent_id: 200725,
                            id: 201285
                        },
                        {
                            
                            display_name: "Bóng Quần",
                            name: "Squash",
                            
                            
                            children: [],
                            parent_id: 200725,
                            id: 201286
                        },
                        {
                            
                            display_name: "Bắn Súng & Game Sinh Tồn",
                            name: "Shooting & Survival Games",
                            
                            
                            children: [],
                            parent_id: 200725,
                            id: 201287
                        },
                        {
                            
                            display_name: "Bóng Bầu Dục",
                            name: "Rugby",
                            
                            
                            children: [],
                            parent_id: 200725,
                            id: 201288
                        },
                        {
                            
                            display_name: "Bida",
                            name: "Billiards",
                            
                            
                            children: [],
                            parent_id: 200725,
                            id: 201289
                        },
                        {
                            
                            display_name: "Lướt Ván",
                            name: "Surfing & Wakeboarding",
                            
                            
                            children: [],
                            parent_id: 200725,
                            id: 201290
                        },
                        {
                            
                            display_name: "Trượt Tuyết & Thể Thao Mùa Đông",
                            name: "Ice Skating & Winter Sports",
                            
                            
                            children: [],
                            parent_id: 200725,
                            id: 201291
                        },
                        {
                            
                            display_name: "Bơi Lội & Lặn",
                            name: "Swimming & Diving",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201292
                        },
                        {
                            
                            display_name: "Chèo Thuyền",
                            name: "Boating",
                            
                            
                            children: [],
                            parent_id: 200725,
                            id: 201293
                        },
                        {
                            
                            display_name: "Yoga & Pilates",
                            name: "Yoga & Pilates",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201294
                        },
                        {
                            
                            display_name: "Thiết Bị Thể Thao",
                            name: "Fitness Equipment",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201295
                        },
                        {
                            
                            display_name: "Ném Phi Tiêu",
                            name: "Darts",
                            
                            
                            children: [],
                            parent_id: 200725,
                            id: 201296
                        },
                        {
                            
                            display_name: "Môn Thể Thao Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200725,
                            id: 201297
                        }
                    ],
                    parent_id: 200637,
                    id: 200725
                },
                {
                    
                    display_name: "Giày Thể Thao",
                    name: "Sports Footwear",

                    
                    children: [{
                            
                            display_name: "Giày Bóng Rổ",
                            name: "Basketball Shoes",
                            
                            
                            children: [],
                            parent_id: 200726,
                            id: 201298
                        },
                        {
                            
                            display_name: "Giày Chạy Bộ",
                            name: "Running Shoes",
                            
                            
                            children: [],
                            parent_id: 200726,
                            id: 201299
                        },
                        {
                            
                            display_name: "Giày Tập Luyện",
                            name: "Training Shoes",
                            
                            
                            children: [],
                            parent_id: 200726,
                            id: 201300
                        },
                        {
                            
                            display_name: "Giày Tennis",
                            name: "Tennis Shoes",
                            
                            
                            children: [],
                            parent_id: 200726,
                            id: 201301
                        },
                        {
                            
                            display_name: "Giày Bóng Chuyền",
                            name: "Volleyball Shoes",
                            
                            
                            children: [],
                            parent_id: 200726,
                            id: 201302
                        },
                        {
                            
                            display_name: "Giày Cầu Lông",
                            name: "Badminton Shoes",
                            
                            
                            children: [],
                            parent_id: 200726,
                            id: 201303
                        },
                        {
                            
                            display_name: "Giày Futsal",
                            name: "Futsal Shoes",
                            
                            
                            children: [],
                            parent_id: 200726,
                            id: 201304
                        },
                        {
                            
                            display_name: "Giày Dã Ngoại",
                            name: "Hiking Shoes",
                            
                            
                            children: [],
                            parent_id: 200726,
                            id: 201305
                        },
                        {
                            
                            display_name: "Giày Bóng Đá",
                            name: "Soccer Shoes",
                            
                            
                            children: [],
                            parent_id: 200726,
                            id: 201306
                        },
                        {
                            
                            display_name: "Giày Thể Thao Trẻ Em",
                            name: "Kid's Sport Shoes",
                            
                            
                            children: [],
                            parent_id: 200726,
                            id: 201307
                        },
                        {
                            
                            display_name: "Giày Thể Thao Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200726,
                            id: 201308
                        }
                    ],
                    parent_id: 200637,
                    id: 200726
                },
                {
                    
                    display_name: "Thời Trang Thể Thao & Dã Ngoại",
                    name: "Sports & Outdoor Apparels",

                    
                    children: [{
                            
                            display_name: "Bộ Đồ Thể Thao",
                            name: "Sets",
                            
                            
                            children: [],
                            parent_id: 200727,
                            id: 201309
                        },
                        {
                            
                            display_name: "Áo Khoác",
                            name: "Jackets",
                            
                            
                            children: [],
                            parent_id: 200727,
                            id: 201310
                        },
                        {
                            
                            display_name: "Áo Thể Thao",
                            name: "T-shirts",
                            
                            
                            children: [],
                            parent_id: 200727,
                            id: 201311
                        },
                        {
                            
                            display_name: "Áo CLB",
                            name: "Jerseys",
                            
                            
                            children: [],
                            parent_id: 200727,
                            id: 201312
                        },
                        {
                            
                            display_name: "Quần Thể Thao",
                            name: "Bottoms",
                            
                            
                            children: [],
                            parent_id: 200727,
                            id: 201313
                        },
                        {
                            
                            display_name: "Đồ Bơi",
                            name: "Swimming Attire",
        
                            
                            children: [],
                            parent_id: 200727,
                            id: 201314
                        },
                        {
                            
                            display_name: "Áo Lót Thể Thao",
                            name: "Sports Bras",
                            
                            
                            children: [],
                            parent_id: 200727,
                            id: 201315
                        },
                        {
                            
                            display_name: "Thời Trang Thể Thao Trẻ Em",
                            name: "Kid's Sports Apparel",
                            
                            
                            children: [],
                            parent_id: 200727,
                            id: 201316
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200727,
                            id: 201317
                        }
                    ],
                    parent_id: 200637,
                    id: 200727
                },
                {
                    
                    display_name: "Phụ Kiện Thể Thao & Dã Ngoại",
                    name: "Sports & Outdoor Accessories",

                    
                    children: [{
                            
                            display_name: "Đồng Hồ Bấm Giây & Máy Đếm Bước Chân",
                            name: "Stopwatches & Pedometers",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201318
                        },
                        {
                            
                            display_name: "Túi Đựng Giày",
                            name: "Shoe Bags",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201319
                        },
                        {
                            
                            display_name: "Vòng Tay Thể Thao",
                            name: "Sports Wristbands",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201320
                        },
                        {
                            
                            display_name: "Băng Đô Thể Thao",
                            name: "Sports Headbands",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201321
                        },
                        {
                            
                            display_name: "Mũ Thể Thao & Dã Ngoại",
                            name: "Sports & Outdoor Hats",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201322
                        },
                        {
                            
                            display_name: "Túi Chống Thấm",
                            name: "Dry Bags",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201323
                        },
                        {
                            
                            display_name: "Áo Mưa",
                            name: "Rain Coats",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201324
                        },
                        {
                            
                            display_name: "Ô/Dù",
                            name: "Umbrellas",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201325
                        },
                        {
                            
                            display_name: "Dụng Cụ Bảo Vệ Miệng & Băng Keo Thể Thao",
                            name: "Mouthguards & Sport Tapes",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201326
                        },
                        {
                            
                            display_name: "Phụ Kiện Tập Luyện",
                            name: "Training Equipments",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201327
                        },
                        {
                            
                            display_name: "Đồ Bảo Hộ Gym",
                            name: "Gym Protective Gears",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201328
                        },
                        {
                            
                            display_name: "Phụ Kiện Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201329
                        }
                    ],
                    parent_id: 200637,
                    id: 200728
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200637,
                    id: 200729
                }
            ],
            parent_id: 0,
            id: 200637
        },
        {

            display_name: "Văn Phòng Phẩm",
            name: "Stationery",

            
            children: [{
                    
                    display_name: "Quà Tặng - Giấy Gói",
                    name: "Gift & Wrapping",

                    
                    children: [{
                            
                            display_name: "Giấy Gói Quà",
                            name: "Gift Wrappers",
                            
                            
                            children: [],
                            parent_id: 200730,
                            id: 201330
                        },
                        {
                            
                            display_name: "Hộp Quà Tặng",
                            name: "Gift Boxes",
                            
                            
                            children: [],
                            parent_id: 200730,
                            id: 201331
                        },
                        {
                            
                            display_name: "Túi Quà Tặng",
                            name: "Gift Bags",
                            
                            
                            children: [],
                            parent_id: 200730,
                            id: 201332
                        },
                        {
                            
                            display_name: "Ruy Băng",
                            name: "Ribbons",
                            
                            
                            children: [],
                            parent_id: 200730,
                            id: 201333
                        },
                        {
                            
                            display_name: "Xốp Chống Sốc",
                            name: "Bubble Wraps",
                            
                            
                            children: [],
                            parent_id: 200730,
                            id: 201334
                        },
                        {
                            
                            display_name: "Hộp Carton",
                            name: "Carton Boxes",
                            
                            
                            children: [],
                            parent_id: 200730,
                            id: 201335
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200730,
                            id: 201336
                        }
                    ],
                    parent_id: 200638,
                    id: 200730
                },
                {
                    
                    display_name: "Bút Các Loại",
                    name: "Writing & Correction",

                    
                    children: [{
                            
                            display_name: "Bút & Mực",
                            name: "Pens & Inks",
                            
                            
                            children: [],
                            parent_id: 200731,
                            id: 201337
                        },
                        {
                            
                            display_name: "Bút Chì",
                            name: "Pencils",
                            
                            
                            children: [],
                            parent_id: 200731,
                            id: 201338
                        },
                        {
                            
                            display_name: "Dụng Cụ Tẩy Xoá",
                            name: "Eraser & Correction Supplies",
                            
                            
                            children: [],
                            parent_id: 200731,
                            id: 201339
                        },
                        {
                            
                            display_name: "Bút Lông Màu",
                            name: "Markers",
                            
                            
                            children: [],
                            parent_id: 200731,
                            id: 201340
                        },
                        {
                            
                            display_name: "Bút Dạ Quang",
                            name: "Highlighters",
                            
                            
                            children: [],
                            parent_id: 200731,
                            id: 201341
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200731,
                            id: 201342
                        }
                    ],
                    parent_id: 200638,
                    id: 200731
                },
                {
                    
                    display_name: "Thiết Bị Trường Học",
                    name: "School & Office Equipment",

                    
                    children: [{
                            
                            display_name: "Bảng Viết & Giá Treo Bảng",
                            name: "Writing Boards & Board Stands",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201343
                        },
                        {
                            
                            display_name: "Máy tính cầm tay",
                            name: "Calculators",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201344
                        },
                        {
                            
                            display_name: "Dao Rọc Giấy & Máy Cắt Giấy",
                            name: "Pen Knives & Paper Cutters",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201345
                        },
                        {
                            
                            display_name: "Dây & Băng Keo Dán",
                            name: "Strings & Tapes",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201346
                        },
                        {
                            
                            display_name: "Hồ Dán",
                            name: "Glues",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201347
                        },
                        {
                            
                            display_name: "Máy In Nhãn",
                            name: "Label Printers",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201348
                        },
                        {
                            
                            display_name: "Dây Đeo Thẻ & Thẻ Tên",
                            name: "Lanyards & Name Tags",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201349
                        },
                        {
                            
                            display_name: "Kẹp & Ghim Bấm",
                            name: "Clips, Pins & Tacks",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201350
                        },
                        {
                            
                            display_name: "Máy Đục Lỗ",
                            name: "Hole Punchers",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201351
                        },
                        {
                            
                            display_name: "Kéo",
                            name: "Scissors",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201352
                        },
                        {
                            
                            display_name: "Mực Đóng Dấu",
                            name: "Ink Stamps & Pads",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201353
                        },
                        {
                            
                            display_name: "Đồ Bấm Kim và Kim Bấm",
                            name: "Staplers & Staples",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201354
                        },
                        {
                            
                            display_name: "Lịch",
                            name: "Calendars",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201355
                        },
                        {
                            
                            display_name: "Dụng Cụ Lưu Trữ Giấy Tờ",
                            name: "Folders, Paper Organizers & Accessories",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201356
                        },
                        {
                            
                            display_name: "Thước Các Loại & Giấy Nến",
                            name: "Rulers, Protractors & Stencils",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201357
                        },
                        {
                            
                            display_name: "Gọt bút chì",
                            name: "Sharpeners",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201358
                        },
                        {
                            
                            display_name: "Hộp Bút",
                            name: "Pencil Cases",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201359
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201360
                        }
                    ],
                    parent_id: 200638,
                    id: 200732
                },
                {
                    
                    display_name: "Hoạ Cụ",
                    name: "Art Supplies",

                    
                    children: [{
                            
                            display_name: "Bút Chì Màu",
                            name: "Color Pencils",
                            
                            
                            children: [],
                            parent_id: 200733,
                            id: 201361
                        },
                        {
                            
                            display_name: "Bút Màu & Phấn Màu",
                            name: "Crayons & Pastels",
                            
                            
                            children: [],
                            parent_id: 200733,
                            id: 201362
                        },
                        {
                            
                            display_name: "Màu Nước",
                            name: "Water & Poster Colours",
                            
                            
                            children: [],
                            parent_id: 200733,
                            id: 201363
                        },
                        {
                            
                            display_name: "Sơn Dầu",
                            name: "Oil Paint",
                            
                            
                            children: [],
                            parent_id: 200733,
                            id: 201364
                        },
                        {
                            
                            display_name: "Sơn Acrylic",
                            name: "Acrylic Paint",
                            
                            
                            children: [],
                            parent_id: 200733,
                            id: 201365
                        },
                        {
                            
                            display_name: "Cọ Vẽ",
                            name: "Paint Brushes",
                            
                            
                            children: [],
                            parent_id: 200733,
                            id: 201366
                        },
                        {
                            
                            display_name: "Bảng Màu",
                            name: "Paint Palettes",
                            
                            
                            children: [],
                            parent_id: 200733,
                            id: 201367
                        },
                        {
                            
                            display_name: "Vải & Giá Vẽ",
                            name: "Canvases & Easels",
                            
                            
                            children: [],
                            parent_id: 200733,
                            id: 201368
                        },
                        {
                            
                            display_name: "Sổ vẽ phác thảo",
                            name: "Sketch Books",
                            
                            
                            children: [],
                            parent_id: 200733,
                            id: 201369
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200733,
                            id: 201370
                        }
                    ],
                    parent_id: 200638,
                    id: 200733
                },
                {
                    
                    display_name: "Sổ & Giấy Các Loại",
                    name: "Notebooks & Papers",

                    
                    children: [{
                            
                            display_name: "Đánh Dấu Trang",
                            name: "Bookmarks",
                            
                            
                            children: [],
                            parent_id: 200734,
                            id: 201371
                        },
                        {
                            
                            display_name: "Bọc Sách",
                            name: "Book Covers",
                            
                            
                            children: [],
                            parent_id: 200734,
                            id: 201372
                        },
                        {
                            
                            display_name: "Giấy Nhiệt",
                            name: "Thermal Paper & Continuous Paper",
                            
                            
                            children: [],
                            parent_id: 200734,
                            id: 201373
                        },
                        {
                            
                            display_name: "Giấy In",
                            name: "Printing & Photocopy Paper",
                            
                            
                            children: [],
                            parent_id: 200734,
                            id: 201374
                        },
                        {
                            
                            display_name: "Ruột Sổ",
                            name: "Loose Leaf",
                            
                            
                            children: [],
                            parent_id: 200734,
                            id: 201375
                        },
                        {
                            
                            display_name: "Giấy Ghi Chú",
                            name: "Memo & Sticky Notes",
                            
                            
                            children: [],
                            parent_id: 200734,
                            id: 201376
                        },
                        {
                            
                            display_name: "Giấy Mỹ Thuật",
                            name: "Art Paper & Boards",
                            
                            
                            children: [],
                            parent_id: 200734,
                            id: 201377
                        },
                        {
                            
                            display_name: "Tập, Vở Các Loại",
                            name: "Notebooks & Notepads",
                            
                            
                            children: [],
                            parent_id: 200734,
                            id: 201378
                        },
                        {
                            
                            display_name: "Nhãn Dán Các Loại",
                            name: "Labels & Stickers",
                            
                            
                            children: [],
                            parent_id: 200734,
                            id: 201379
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200734,
                            id: 201380
                        }
                    ],
                    parent_id: 200638,
                    id: 200734
                },
                {
                    
                    display_name: "Thư Tín",
                    name: "Letters & Envelopes",

                    
                    children: [{
                            
                            display_name: "Phong Bì & Bao Lì Xì",
                            name: "Envelopes & Angpao",
                            
                            
                            children: [],
                            parent_id: 200735,
                            id: 201381
                        },
                        {
                            
                            display_name: "Bưu Thiếp",
                            name: "Post Cards",
                            
                            
                            children: [],
                            parent_id: 200735,
                            id: 201382
                        },
                        {
                            
                            display_name: "Tem Các Loại",
                            name: "Postage Stamps & Duty Stamps",
                            
                            
                            children: [],
                            parent_id: 200735,
                            id: 201383
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200735,
                            id: 201384
                        }
                    ],
                    parent_id: 200638,
                    id: 200735
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200638,
                    id: 200736
                }
            ],
            parent_id: 0,
            id: 200638
        },
        {

            display_name: "Sở thích & Sưu tầm",
            name: "Hobbies & Collections",

            
            children: [{
                    
                    display_name: "Đồ Sưu Tầm",
                    name: "Collectible Items",

                    
                    children: [{
                            
                            display_name: "Mô hình nhân vật",
                            name: "Action Figurines",
                            
                            
                            children: [],
                            parent_id: 200737,
                            id: 201385
                        },
                        {
                            
                            display_name: "Tượng tĩnh",
                            name: "Statues & Sculptures",
                            
                            
                            children: [],
                            parent_id: 200737,
                            id: 201386
                        },
                        {
                            
                            display_name: "Mô hình mecha/gundam",
                            name: "Mecha Models & Diecast",
                            
                            
                            children: [],
                            parent_id: 200737,
                            id: 201387
                        },
                        {
                            
                            display_name: "Mô hình xe",
                            name: "Vehicle Models & Diecast",
                            
                            
                            children: [],
                            parent_id: 200737,
                            id: 201388
                        },
                        {
                            
                            display_name: "Bộ sưu tập nhân vật nổi tiếng",
                            name: "Idol Collectibles",
                            
                            
                            children: [],
                            parent_id: 200737,
                            id: 201390
                        },
                        {
                            
                            display_name: "Bộ sưu tập thể thao",
                            name: "Sports Collectibles",
                            
                            
                            children: [],
                            parent_id: 200737,
                            id: 201391
                        },
                        {
                            
                            display_name: "Bộ sưu tập hoạt hình truyện tranh",
                            name: "Anime & Manga Collectibles",
                            
                            
                            children: [],
                            parent_id: 200737,
                            id: 201392
                        },
                        {
                            
                            display_name: "Tiền xu & tiền giấy sưu tầm",
                            name: "Coins",
                            
                            
                            children: [],
                            parent_id: 200737,
                            id: 201393
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200737,
                            id: 201394
                        }
                    ],
                    parent_id: 200639,
                    id: 200737
                },
                {
                    
                    display_name: "Quà Lưu Niệm",
                    name: "Souvenirs",

                    
                    children: [{
                            
                            display_name: "Quạt Cầm Tay",
                            name: "Hand Fans",
                            
                            
                            children: [],
                            parent_id: 200738,
                            id: 201395
                        },
                        {
                            
                            display_name: "Móc Khoá",
                            name: "Keychains",
                            
                            
                            children: [],
                            parent_id: 200738,
                            id: 201396
                        },
                        {
                            
                            display_name: "Ống tiết kiệm",
                            name: "Coin Banks",
                            
                            
                            children: [],
                            parent_id: 200738,
                            id: 201397
                        },
                        {
                            
                            display_name: "Nam Châm",
                            name: "Fridge Magnets",
                            
                            
                            children: [],
                            parent_id: 200738,
                            id: 201398
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200738,
                            id: 201399
                        }
                    ],
                    parent_id: 200639,
                    id: 200738
                },
                {
                    
                    display_name: "Đồ chơi - Giải trí",
                    name: "Toys & Games",

                    
                    children: [{
                            
                            display_name: "Đồ chơi thẻ bài & boardgame",
                            name: "Dice, Board & Card Games",
                            
                            
                            children: [],
                            parent_id: 200739,
                            id: 201400
                        },
                        {
                            
                            display_name: "Đồ chơi ảo thuật",
                            name: "Magic Toys",
                            
                            
                            children: [],
                            parent_id: 200739,
                            id: 201401
                        },
                        {
                            
                            display_name: "Đồ chơi chọc ghẹo",
                            name: "Prank Toys",
                            
                            
                            children: [],
                            parent_id: 200739,
                            id: 201402
                        },
                        {
                            
                            display_name: "Đồ chơi rubik",
                            name: "Rubik's Cubes",
                            
                            
                            children: [],
                            parent_id: 200739,
                            id: 201403
                        },
                        {
                            
                            display_name: "Đồ chơi con xoay",
                            name: "Spinning Tops",
                            
                            
                            children: [],
                            parent_id: 200739,
                            id: 201404
                        },
                        {
                            
                            display_name: "Kendama",
                            name: "Kendamas",
                            
                            
                            children: [],
                            parent_id: 200739,
                            id: 201405
                        },
                        {
                            
                            display_name: "Yo yo",
                            name: "Yo-yos",
                            
                            
                            children: [],
                            parent_id: 200739,
                            id: 201406
                        },
                        {
                            
                            display_name: "Đồ chơi điều khiển từ xa",
                            name: "Remote Control Toys & Accessories",
                            
                            
                            children: [],
                            parent_id: 200739,
                            id: 201407
                        },
                        {
                            
                            display_name: "Đồ chơi trứng",
                            name: "Capsule Toys",
                            
                            
                            children: [],
                            parent_id: 200739,
                            id: 201408
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200739,
                            id: 201409
                        }
                    ],
                    parent_id: 200639,
                    id: 200739
                },
                {
                    
                    display_name: "Băng - Đĩa",
                    name: "CD, DVD & Bluray",
                    
                    
                    children: [],
                    parent_id: 200639,
                    id: 200740
                },
                {
                    
                    display_name: "Nhạc Cụ & Phụ Kiện",
                    name: "Musical Instruments & Accessories",

                    
                    children: [{
                            
                            display_name: "Đàn Piano & Organ",
                            name: "Keyboards & Pianos",
                            
                            
                            children: [],
                            parent_id: 200741,
                            id: 201410
                        },
                        {
                            
                            display_name: "Nhạc Cụ Gõ",
                            name: "Percussion Instruments",
                            
                            
                            children: [],
                            parent_id: 200741,
                            id: 201411
                        },
                        {
                            
                            display_name: "Sáo, kèn",
                            name: "Wind Instruments",
                            
                            
                            children: [],
                            parent_id: 200741,
                            id: 201412
                        },
                        {
                            
                            display_name: "Phụ Kiện Âm Nhạc",
                            name: "Music Accessories",
                            
                            
                            children: [],
                            parent_id: 200741,
                            id: 201413
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200741,
                            id: 201414
                        },
                        {
                            
                            display_name: "Nhạc Cụ Dây",
                            name: "String Instruments",
        
                            
                            children: [],
                            parent_id: 200741,
                            id: 202017
                        }
                    ],
                    parent_id: 200639,
                    id: 200741
                },
                {
                    
                    display_name: "Đĩa Than",
                    name: "Vinyl Records",
                    
                    
                    children: [],
                    parent_id: 200639,
                    id: 200742
                },
                {
                    
                    display_name: "Album Ảnh",
                    name: "Photo Albums",
                    
                    
                    children: [],
                    parent_id: 200639,
                    id: 200743
                },
                {
                    
                    display_name: "Dụng Cụ May Vá",
                    name: "Needlework",
                    
                    
                    children: [],
                    parent_id: 200639,
                    id: 200744
                },
                {
                    
                    display_name: "Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200639,
                    id: 200745
                }
            ],
            parent_id: 0,
            id: 200639
        },
        {

            display_name: "Ô tô",
            name: "Automobiles",

            
            children: [{
                    
                    display_name: "Phụ kiện nội thất ô tô",
                    name: "Automobile Interior Accessories",

                    
                    children: [{
                            
                            display_name: "Thiết bị định vị và Hệ thống hình ảnh/âm thanh",
                            name: "Navigation & AV Receivers",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201415
                        },
                        {
                            
                            display_name: "Hệ thống loa",
                            name: "Amplifiers, Speakers & Subwoofers",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201416
                        },
                        {
                            
                            display_name: "Dụng cụ chứa",
                            name: "Organizers & Compartments",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201417
                        },
                        {
                            
                            display_name: "Nước hoa, Nước hoa khử mùi, Thiết bị lọc không khí",
                            name: "Perfumes, Air Fresheners & Purifiers",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201418
                        },
                        {
                            
                            display_name: "Thảm & Đệm lót",
                            name: "Carpets & Mats",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201419
                        },
                        {
                            
                            display_name: "Gối tựa đầu & lưng",
                            name: "Seat Headrests & Back Supports",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201420
                        },
                        {
                            
                            display_name: "Nệm giường ô tô",
                            name: "Car Mattresses",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201421
                        },
                        {
                            
                            display_name: "Vô lăng & Bọc vô lăng",
                            name: "Steering Wheels & Covers",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201422
                        },
                        {
                            
                            display_name: "Ghế & Áo ghế",
                            name: "Seats & Seat Covers",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201423
                        },
                        {
                            
                            display_name: "Giá đỡ điện thoại",
                            name: "Phone Holders",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201424
                        },
                        {
                            
                            display_name: "Cốc sạc USB, Thiết bị thu phát FM & Bluetooth",
                            name: "USB Chargers, FM & Bluetooth Transmitters",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201425
                        },
                        {
                            
                            display_name: "Chân ga và Cần số",
                            name: "Pedals & Gear Sticks",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201426
                        },
                        {
                            
                            display_name: "Tấm che nắng và Thảm Taplo",
                            name: "Sun Shields & Dash Covers",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201427
                        },
                        {
                            
                            display_name: "Khóa và thiết bị chống trộm",
                            name: "Locks & Security",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201428
                        },
                        {
                            
                            display_name: "Camera hành trình & Camera lùi",
                            name: "Camcorders & Parking Cameras",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201429
                        },
                        {
                            
                            display_name: "HUD, Đồng hồ tốc độ, Đồng hồ số",
                            name: "HUD, Speedometers & Gauges",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201430
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201431
                        }
                    ],
                    parent_id: 200640,
                    id: 200747
                },
                {
                    
                    display_name: "Phụ kiện ngoại thất ô tô",
                    name: "Automobile Exterior Accessories",

                    
                    children: [{
                            
                            display_name: "Nẹp viền",
                            name: "Garnish",
                            
                            
                            children: [],
                            parent_id: 200748,
                            id: 201432
                        },
                        {
                            
                            display_name: "Ăng-ten thu phát sóng",
                            name: "Antennas",
                            
                            
                            children: [],
                            parent_id: 200748,
                            id: 201433
                        },
                        {
                            
                            display_name: "Bạt phủ",
                            name: "Covers",
                            
                            
                            children: [],
                            parent_id: 200748,
                            id: 201434
                        },
                        {
                            
                            display_name: "Hình dán, logo, huy hiệu",
                            name: "Stickers, Logos & Emblems",
                            
                            
                            children: [],
                            parent_id: 200748,
                            id: 201435
                        },
                        {
                            
                            display_name: "Tấm chắn bùn",
                            name: "Mud Flaps & Splash Guards",
                            
                            
                            children: [],
                            parent_id: 200748,
                            id: 201436
                        },
                        {
                            
                            display_name: "Nẹp cửa chống trầy",
                            name: "Sill Plates",
                            
                            
                            children: [],
                            parent_id: 200748,
                            id: 201437
                        },
                        {
                            
                            display_name: "Rãnh thoát nước mưa",
                            name: "Gutters",
                            
                            
                            children: [],
                            parent_id: 200748,
                            id: 201438
                        },
                        {
                            
                            display_name: "Còi & phụ kiện",
                            name: "Horns & Accessories",
                            
                            
                            children: [],
                            parent_id: 200748,
                            id: 201439
                        },
                        {
                            
                            display_name: "Gương & Phụ kiện",
                            name: "Mirrors & Accessories",
                            
                            
                            children: [],
                            parent_id: 200748,
                            id: 201440
                        },
                        {
                            
                            display_name: "Phụ kiện biển số",
                            name: "License Plate Accessories",
                            
                            
                            children: [],
                            parent_id: 200748,
                            id: 201441
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200748,
                            id: 201442
                        }
                    ],
                    parent_id: 200640,
                    id: 200748
                },
                {
                    
                    display_name: "Phụ tùng ô tô",
                    name: "Automobile Spare Parts",

                    
                    children: [{
                            
                            display_name: "Hệ thống khung xe và giảm sóc",
                            name: "Body, Frame & Bumpers",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201443
                        },
                        {
                            
                            display_name: "Cần gạt nước & vòng đệm kính chắn gió",
                            name: "Windshield Wipers & Washers",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201444
                        },
                        {
                            
                            display_name: "Hệ thống khí xả",
                            name: "Exhaust & Emissions",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201445
                        },
                        {
                            
                            display_name: "Bánh xe, Vành & Phụ kiện",
                            name: "Wheels, Rims & Accessories",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201446
                        },
                        {
                            
                            display_name: "Lốp & Phụ kiện",
                            name: "Tires & Accessories",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201447
                        },
                        {
                            
                            display_name: "Giảm xóc, thanh chống và hệ thống treo",
                            name: "Shocks, Struts & Suspension",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201448
                        },
                        {
                            
                            display_name: "Bộ tản nhiệt, Làm mát động cơ & Kiểm soát nhiệt",
                            name: "Radiators, Engine Cooling & Climate Control",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201449
                        },
                        {
                            
                            display_name: "Hệ thống truyền động, hộp số & ly hợp",
                            name: "Drivetrain, Transmission & Clutches",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201450
                        },
                        {
                            
                            display_name: "Vòng bi & con dấu",
                            name: "Bearing & Seals",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201451
                        },
                        {
                            
                            display_name: "Bộ phận động cơ",
                            name: "Engine Parts",
        
                            
                            children: [],
                            parent_id: 200749,
                            id: 201452
                        },
                        {
                            
                            display_name: "Hệ thống phanh",
                            name: "Brake System",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201453
                        },
                        {
                            
                            display_name: "Dây chuyền động",
                            name: "Belts, Hoses & Pulleys",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201454
                        },
                        {
                            
                            display_name: "Thiết bị điện tử",
                            name: "Electronics",
        
                            
                            children: [],
                            parent_id: 200749,
                            id: 201455
                        },
                        {
                            
                            display_name: "Hệ thống xử lý nhiên liệu",
                            name: "Fuel System",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201456
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201457
                        }
                    ],
                    parent_id: 200640,
                    id: 200749
                },
                {
                    
                    display_name: "Dụng cụ sửa chữa ô tô",
                    name: "Automotive Tools",

                    
                    children: [{
                            
                            display_name: "Dụng cụ Kiểm tra, chẩn đoán & sửa chữa",
                            name: "Test, Diagnostic & Repair Tools",
                            
                            
                            children: [],
                            parent_id: 200750,
                            id: 201458
                        },
                        {
                            
                            display_name: "Máy đo áp suất lốp",
                            name: "Tire Pressure Detectors",
                            
                            
                            children: [],
                            parent_id: 200750,
                            id: 201459
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200750,
                            id: 201460
                        }
                    ],
                    parent_id: 200640,
                    id: 200750
                },
                {
                    
                    display_name: "Chăm sóc ô tô",
                    name: "Automotive Care",

                    
                    children: [{
                            
                            display_name: "Dung dịch tẩy rửa",
                            name: "Wash & Waxes",
                            
                            
                            children: [],
                            parent_id: 200751,
                            id: 201461
                        },
                        {
                            
                            display_name: "Rửa kính & Chất chống bám nước",
                            name: "Glass Care & Water Repellents",
                            
                            
                            children: [],
                            parent_id: 200751,
                            id: 201462
                        },
                        {
                            
                            display_name: "Chăm sóc nội thất",
                            name: "Interior Care",
                            
                            
                            children: [],
                            parent_id: 200751,
                            id: 201463
                        },
                        {
                            
                            display_name: "Chăm sóc lốp & vành",
                            name: "Tire & Wheel Care",
                            
                            
                            children: [],
                            parent_id: 200751,
                            id: 201464
                        },
                        {
                            
                            display_name: "Đánh bóng, sơn phủ & chất làm kín",
                            name: "Polish, Coating & Sealants",
                            
                            
                            children: [],
                            parent_id: 200751,
                            id: 201465
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200751,
                            id: 201466
                        }
                    ],
                    parent_id: 200640,
                    id: 200751
                },
                {
                    
                    display_name: "Dầu nhớt và phụ gia ô tô",
                    name: "Automotive Oils & Lubes",

                    
                    children: [{
                            
                            display_name: "Dầu",
                            name: "Oils",
                            
                            
                            children: [],
                            parent_id: 200752,
                            id: 201467
                        },
                        {
                            
                            display_name: "Phụ gia",
                            name: "Fuel Additives & Savers",
                            
                            
                            children: [],
                            parent_id: 200752,
                            id: 201468
                        },
                        {
                            
                            display_name: "Mỡ & Chất bôi trơn",
                            name: "Greases & Lubricants",
                            
                            
                            children: [],
                            parent_id: 200752,
                            id: 201469
                        },
                        {
                            
                            display_name: "Chất chống đông & chất làm mát",
                            name: "Antifreezes & Coolants",
                            
                            
                            children: [],
                            parent_id: 200752,
                            id: 201470
                        },
                        {
                            
                            display_name: "Dầu máy",
                            name: "Automotive Fluids",
        
                            
                            children: [],
                            parent_id: 200752,
                            id: 201471
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200752,
                            id: 201472
                        }
                    ],
                    parent_id: 200640,
                    id: 200752
                },
                {
                    
                    display_name: "Móc chìa khóa và Bọc chìa ô tô",
                    name: "Automotive Keychains & Key Covers",
                    
                    
                    children: [],
                    parent_id: 200640,
                    id: 200753
                }
            ],
            parent_id: 0,
            id: 200640
        },
        {

            display_name: "Mô tô, xe máy",
            name: "Motorcycles",

            
            children: [{
                    
                    display_name: "Phụ kiện xe máy",
                    name: "Motorcycle Accessories",

                    
                    children: [{
                            
                            display_name: "Lót sàn",
                            name: "Carpets",
                            
                            
                            children: [],
                            parent_id: 200756,
                            id: 201473
                        },
                        {
                            
                            display_name: "Đồng hồ đo",
                            name: "Speedometers, Odometers & Gauges",
                            
                            
                            children: [],
                            parent_id: 200756,
                            id: 201474
                        },
                        {
                            
                            display_name: "Bạt phủ",
                            name: "Covers",
                            
                            
                            children: [],
                            parent_id: 200756,
                            id: 201475
                        },
                        {
                            
                            display_name: "Hình dán, logo, huy hiệu",
                            name: "Stickers, Logos & Emblems",
                            
                            
                            children: [],
                            parent_id: 200756,
                            id: 201476
                        },
                        {
                            
                            display_name: "Ghế & bọc ghế",
                            name: "Seats & Seat Covers",
                            
                            
                            children: [],
                            parent_id: 200756,
                            id: 201477
                        },
                        {
                            
                            display_name: "Gương và phụ kiện",
                            name: "Mirrors & Accessories",
                            
                            
                            children: [],
                            parent_id: 200756,
                            id: 201478
                        },
                        {
                            
                            display_name: "Khóa và thiết bị chống trộm",
                            name: "Locks & Security",
                            
                            
                            children: [],
                            parent_id: 200756,
                            id: 201479
                        },
                        {
                            
                            display_name: "Thùng chứa đồ",
                            name: "Boxes & Cases",
                            
                            
                            children: [],
                            parent_id: 200756,
                            id: 201480
                        },
                        {
                            
                            display_name: "Giá đỡ điện thoại",
                            name: "Phone Holders",
                            
                            
                            children: [],
                            parent_id: 200756,
                            id: 201481
                        },
                        {
                            
                            display_name: "Tấm chắn bùn",
                            name: "Mud Flaps & Splash Guards",
                            
                            
                            children: [],
                            parent_id: 200756,
                            id: 201482
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200756,
                            id: 201483
                        }
                    ],
                    parent_id: 200641,
                    id: 200756
                },
                {
                    
                    display_name: "Phụ tùng xe máy",
                    name: "Motorcycle Spare Parts",

                    
                    children: [{
                            
                            display_name: "Bộ phận đánh lửa & động cơ",
                            name: "Ignition & Engine Parts",
        
                            
                            children: [],
                            parent_id: 200757,
                            id: 201484
                        },
                        {
                            
                            display_name: "Hệ thống xử lý nhiên liệu",
                            name: "Fuel System",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201485
                        },
                        {
                            
                            display_name: "Hệ thống phanh",
                            name: "Brake System",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201486
                        },
                        {
                            
                            display_name: "Hệ thống giảm xóc",
                            name: "Shocks, Struts & Suspension",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201487
                        },
                        {
                            
                            display_name: "Hệ thống dẫn động",
                            name: "Drivetrain, Transmission & Clutches",
        
                            
                            children: [],
                            parent_id: 200757,
                            id: 201488
                        },
                        {
                            
                            display_name: "Pin & Phụ kiện",
                            name: "Batteries & Accessories",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201489
                        },
                        {
                            
                            display_name: "Còi & Phụ kiện",
                            name: "Horns & Accessories",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201490
                        },
                        {
                            
                            display_name: "Dây cáp & Ống",
                            name: "Cables & Tubes",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201491
                        },
                        {
                            
                            display_name: "Hệ thống khung xe",
                            name: "Body & Frame",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201492
                        },
                        {
                            
                            display_name: "Hệ thống khí xả",
                            name: "Exhaust & Emissions",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201493
                        },
                        {
                            
                            display_name: "Bánh xe, Vành & Phụ kiện",
                            name: "Wheels, Rims & Accessories",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201494
                        },
                        {
                            
                            display_name: "Lốp xe & Phụ kiện",
                            name: "Tires & Accessories",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201495
                        },
                        {
                            
                            display_name: "Đèn",
                            name: "Lighting",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201496
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201497
                        }
                    ],
                    parent_id: 200641,
                    id: 200757
                },
                {
                    
                    display_name: "Mũ bảo hiểm & Phụ kiện",
                    name: "Motorcycle Helmets & Accessories",
                    
                    
                    children: [],
                    parent_id: 200641,
                    id: 200758
                }
            ],
            parent_id: 0,
            id: 200641
        },
        {

            display_name: "Sách & Tạp Chí",
            name: "Books & Magazines",

            
            children: [{
                region_setting: {
                    low_stock_value: 0,
                    enable_size_chart: false
                },
                display_name: "Sách",
                name: "Books",

                
                children: [{
                    
                    display_name: "Sách Vải",
                    name: "Baby & Soft Books",
                    
                    
                    children: [],
                    parent_id: 200777,
                    id: 201571
                }],
                parent_id: 200643,
                id: 200777
            }],
            parent_id: 0,
            id: 200643
        },
        {

            display_name: "Máy tính & Laptop",
            name: "Computers & Accessories",

            
            children: [{
                    
                    display_name: "Máy Tính Bàn",
                    name: "Desktop Computers",

                    
                    children: [{
                            
                            display_name: "Bộ Máy Tính Bàn",
                            name: "Desktop PC",
                            
                            
                            children: [],
                            parent_id: 201932,
                            id: 201944
                        },
                        {
                            
                            display_name: "Máy Tính Mini",
                            name: "Mini PC",
                            
                            
                            children: [],
                            parent_id: 201932,
                            id: 201945
                        },
                        {
                            
                            display_name: "Máy Chủ",
                            name: "Server PC",
                            
                            
                            children: [],
                            parent_id: 201932,
                            id: 201946
                        },
                        {
                            
                            display_name: "Máy Tính All in one",
                            name: "All-in-One Desktops",
                            
                            
                            children: [],
                            parent_id: 201932,
                            id: 201947
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 201932,
                            id: 201948
                        }
                    ],
                    parent_id: 200644,
                    id: 201932
                },
                {
                    
                    display_name: "Màn Hình",
                    name: "Monitors",
                    
                    
                    children: [],
                    parent_id: 200644,
                    id: 201933
                },
                {
                    
                    display_name: "Linh Kiện Máy Tính",
                    name: "Desktop & Laptop Components",

                    
                    children: [{
                            
                            display_name: "Quạt và Tản Nhiệt",
                            name: "Fans & Heatsinks",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201949
                        },
                        {
                            
                            display_name: "CPU - Bộ Vi Xử Lý",
                            name: "Processors",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201950
                        },
                        {
                            
                            display_name: "Mainboard - Bo Mạch Chủ",
                            name: "Motherboards",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201951
                        },
                        {
                            
                            display_name: "VGA - Card Màn Hình",
                            name: "Graphics Cards",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201952
                        },
                        {
                            
                            display_name: "Keo Tản Nhiệt",
                            name: "Thermal Paste",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201953
                        },
                        {
                            
                            display_name: "Nguồn Máy Tính",
                            name: "Power Supply Units",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201954
                        },
                        {
                            
                            display_name: "Ram Máy Tính",
                            name: "RAM",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201955
                        },
                        {
                            
                            display_name: "Bộ Lưu Điện",
                            name: "UPS & Stabilizers",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201956
                        },
                        {
                            
                            display_name: "Case Máy Tính",
                            name: "PC Cases",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201957
                        },
                        {
                            
                            display_name: "Ổ Đĩa Quang",
                            name: "Optical Drives",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201958
                        },
                        {
                            
                            display_name: "Bo Mạch Âm Thanh",
                            name: "Sound Cards",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201959
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201960
                        }
                    ],
                    parent_id: 200644,
                    id: 201934
                },
                {
                    
                    display_name: "Thiết Bị Lưu Trữ",
                    name: "Data Storage",

                    
                    children: [{
                            
                            display_name: "Ổ Cứng Di Động",
                            name: "Hard Drives",
                            
                            
                            children: [],
                            parent_id: 201935,
                            id: 201961
                        },
                        {
                            
                            display_name: "Ổ Cứng SSD",
                            name: "SSD",
                            
                            
                            children: [],
                            parent_id: 201935,
                            id: 201962
                        },
                        {
                            
                            display_name: "Ổ Cứng Mạng (NAS)",
                            name: "Network Attached Storage (NAS)",
                            
                            
                            children: [],
                            parent_id: 201935,
                            id: 201963
                        },
                        {
                            
                            display_name: "USB & OTG",
                            name: "Flash Drives & OTG",
                            
                            
                            children: [],
                            parent_id: 201935,
                            id: 201964
                        },
                        {
                            
                            display_name: "Thiết Bị Đựng Ổ Cứng",
                            name: "Hard Disk Casings & Dockings",
                            
                            
                            children: [],
                            parent_id: 201935,
                            id: 201965
                        },
                        {
                            
                            display_name: "Đĩa CD",
                            name: "Compact Discs",
                            
                            
                            children: [],
                            parent_id: 201935,
                            id: 201966
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 201935,
                            id: 201967
                        }
                    ],
                    parent_id: 200644,
                    id: 201935
                },
                {
                    
                    display_name: "Thiết Bị Mạng",
                    name: "Network Components",

                    
                    children: [{
                            
                            display_name: "Bộ Phát Wifi",
                            name: "Modems & Wireless Routers",
                            
                            
                            children: [],
                            parent_id: 201936,
                            id: 201968
                        },
                        {
                            
                            display_name: "Bộ Kích Wifi",
                            name: "Repeaters",
                            
                            
                            children: [],
                            parent_id: 201936,
                            id: 201969
                        },
                        {
                            
                            display_name: "Bộ Thu Wifi",
                            name: "Wireless Adapters & Network Cards",
                            
                            
                            children: [],
                            parent_id: 201936,
                            id: 201970
                        },
                        {
                            
                            display_name: "Bộ Chuyển Đổi Mạng",
                            name: "Powerline Adapters",
                            
                            
                            children: [],
                            parent_id: 201936,
                            id: 201971
                        },
                        {
                            
                            display_name: "Bộ chia mạng",
                            name: "Network Switches & PoE",
                            
                            
                            children: [],
                            parent_id: 201936,
                            id: 201972
                        },
                        {
                            
                            display_name: "Cáp Máy Tính",
                            name: "Network Cables & Connectors",
                            
                            
                            children: [],
                            parent_id: 201936,
                            id: 201973
                        },
                        {
                            
                            display_name: "Bộ Chuyển Mạch KMV",
                            name: "KVM Switches",
                            
                            
                            children: [],
                            parent_id: 201936,
                            id: 201974
                        },
                        {
                            
                            display_name: "Máy Chủ Máy In",
                            name: "Print Servers",
                            
                            
                            children: [],
                            parent_id: 201936,
                            id: 201975
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 201936,
                            id: 201976
                        }
                    ],
                    parent_id: 200644,
                    id: 201936
                },
                {
                    
                    display_name: "Phần Mềm",
                    name: "Softwares",
                    
                    
                    children: [],
                    parent_id: 200644,
                    id: 201937
                },
                {
                    
                    display_name: "Thiết Bị Văn Phòng",
                    name: "Office Equipment",

                    
                    children: [{
                            
                            display_name: "Máy Đánh Chữ",
                            name: "Typewriters",
                            
                            
                            children: [],
                            parent_id: 201938,
                            id: 201977
                        },
                        {
                            
                            display_name: "Máy Chấm Công",
                            name: "Absence Machines",
                            
                            
                            children: [],
                            parent_id: 201938,
                            id: 201978
                        },
                        {
                            
                            display_name: "Máy Hủy Tài Liệu",
                            name: "Paper Shredders",
                            
                            
                            children: [],
                            parent_id: 201938,
                            id: 201979
                        },
                        {
                            
                            display_name: "Máy Đếm Tiền",
                            name: "Money Counters",
                            
                            
                            children: [],
                            parent_id: 201938,
                            id: 201980
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 201938,
                            id: 201981
                        }
                    ],
                    parent_id: 200644,
                    id: 201938
                },
                {
                    
                    display_name: "Máy In & Máy Scan",
                    name: "Printers & Scanners",

                    
                    children: [{
                            
                            display_name: "Máy In, Máy Scan & Máy Photo",
                            name: "Printers, Scanners & Photocopy Machines",
                            
                            
                            children: [],
                            parent_id: 201939,
                            id: 201982
                        },
                        {
                            
                            display_name: "Máy In Mã Vạch",
                            name: "Thermal & Barcode Printers",
                            
                            
                            children: [],
                            parent_id: 201939,
                            id: 201983
                        },
                        {
                            
                            display_name: "Mực In & Khay Mực",
                            name: "Inks & Toners",
                            
                            
                            children: [],
                            parent_id: 201939,
                            id: 201984
                        },
                        {
                            
                            display_name: "Máy In 3D",
                            name: "3D Printers",
                            
                            
                            children: [],
                            parent_id: 201939,
                            id: 201985
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 201939,
                            id: 201986
                        }
                    ],
                    parent_id: 200644,
                    id: 201939
                },
                {
                    
                    display_name: "Phụ Kiện Máy Tính",
                    name: "Peripherals & Accessories",

                    
                    children: [{
                            
                            display_name: "Bộ chia cổng USB & Đọc thẻ nhớ",
                            name: "USB Hubs & Card Readers",
                            
                            
                            children: [],
                            parent_id: 201940,
                            id: 201987
                        },
                        {
                            
                            display_name: "Webcam",
                            name: "Webcams",
                            
                            
                            children: [],
                            parent_id: 201940,
                            id: 201988
                        },
                        {
                            
                            display_name: "Miếng Dán & Ốp Laptop",
                            name: "Laptop Skins & Covers",
                            
                            
                            children: [],
                            parent_id: 201940,
                            id: 201989
                        },
                        {
                            
                            display_name: "Đế Tản Nhiệt",
                            name: "Cooling Pads",
                            
                            
                            children: [],
                            parent_id: 201940,
                            id: 201990
                        },
                        {
                            
                            display_name: "Bàn Laptop",
                            name: "Laptop Stands & Foldable Laptop Desks",
                            
                            
                            children: [],
                            parent_id: 201940,
                            id: 201991
                        },
                        {
                            
                            display_name: "Miếng Dán Bàn Phím",
                            name: "Keyboard & Trackpad Covers",
                            
                            
                            children: [],
                            parent_id: 201940,
                            id: 201992
                        },
                        {
                            
                            display_name: "Pin Laptop",
                            name: "Laptop Batteries",
                            
                            
                            children: [],
                            parent_id: 201940,
                            id: 201993
                        },
                        {
                            
                            display_name: "Bộ Sạc Laptop",
                            name: "Laptop Chargers & Adaptors",
                            
                            
                            children: [],
                            parent_id: 201940,
                            id: 201994
                        },
                        {
                            
                            display_name: "Thiết Bị Truyền Hình Hội Nghị",
                            name: "Video Conference Devices",
                            
                            
                            children: [],
                            parent_id: 201940,
                            id: 201995
                        },
                        {
                            
                            display_name: "Bàn Di Chuột",
                            name: "Mouse Pads",
                            
                            
                            children: [],
                            parent_id: 201940,
                            id: 201996
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 201940,
                            id: 201997
                        }
                    ],
                    parent_id: 200644,
                    id: 201940
                },
                {
                    
                    display_name: "Chuột & Bàn Phím",
                    name: "Keyboards & Mice",

                    
                    children: [{
                            
                            display_name: "Chuột Máy Tính",
                            name: "Mice",
                            
                            
                            children: [],
                            parent_id: 201941,
                            id: 201998
                        },
                        {
                            
                            display_name: "Bàn Phím Máy Tính",
                            name: "Keyboards",
                            
                            
                            children: [],
                            parent_id: 201941,
                            id: 201999
                        },
                        {
                            
                            display_name: "Bảng Vẽ Điện Tử",
                            name: "Drawing Tablets",
                            
                            
                            children: [],
                            parent_id: 201941,
                            id: 202000
                        },
                        {
                            
                            display_name: "Khác",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 201941,
                            id: 202001
                        }
                    ],
                    parent_id: 200644,
                    id: 201941
                },
                {
                    
                    display_name: "Laptop",
                    name: "Laptops",
                    
                    
                    children: [],
                    parent_id: 200644,
                    id: 201942
                },
                {
                    
                    display_name: "Phụ Kiện Máy Tính Khác",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200644,
                    id: 201943
                }
            ],
            parent_id: 0,
            id: 200644
        }
    ]        

}