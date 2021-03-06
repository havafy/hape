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
            const size = 50
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
        
    async list(userID: number,  size: number, from: number) {
        const body = { size,  from, sort: [{"id": "desc"}]}
        
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
                    id: item._id,
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
        async collectCategories (){
            const tree = getCategories()
           


            for(let category1 of tree){
                await this.createWithChildren(category1)
            }

        }
        async createWithChildren(category: any){
            try{ /*
                display_name: "??o hai d??y v?? ba l???",
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
        async reIndex(id: string = ''){
            try{
                if(id !== ''){
                    const category = await this.get(id)
                    return await this.reIndexById(category.parent_id, id)
                }
                let size = 50
                let page = 0
                let indexTotal = 0
                while(page < 300){
                    const { body: { 
                        hits: { 
                            total, 
                            hits 
                        } } } = await this.esService.findBySingleField(
                            ES_INDEX_CATEGORY, null, size, page * size,[{"id": "desc"}])
                    const count = total.value
                    if(hits.length === 0) break
                  
                    for(let category of hits){
                       await this.reIndexById(category._source.parent_id, category._id)
                  

                    }
                    indexTotal += count
                    console.log('reIndex page:' + page)
                    page++
                }
                return { indexTotal }
            }catch (err) {
                console.log(err)
            }
        }
        async reIndexById(parent_id, categoryId: string){
            const { 
                parents, 
                parentName 
            } = await this.createIndexByParentID(parent_id)
           // console.log('---->', categoryId,  parents,   parentName)
            return await this.esService.update(ES_INDEX_CATEGORY, categoryId,{
                parents, parentName
            }, '')
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

            if(id){
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
            display_name: "Th???i Trang N???",
            name: "Women Clothes",
            
            children: [{
                    
                    display_name: "??o",
                    name: "Tops",

                    
                    children: [{
                            
                            display_name: "??o hai d??y v?? ba l???",
                            name: "Tanks & Camisoles",
                            
                            
                            children: [],
                            parent_id: 200099,
                            id: 200350
                        },
                        {
                            
                            display_name: "??o ???ng",
                            name: "Tube Tops",
                            
                            
                            children: [],
                            parent_id: 200099,
                            id: 200351
                        },
                        {
                            
                            display_name: "??o thun",
                            name: "T-shirts",
                            
                            
                            children: [],
                            parent_id: 200099,
                            id: 200352
                        },
                        {
                            
                            display_name: "??o s?? mi",
                            name: "Shirts & Blouses",
                            
                            
                            children: [],
                            parent_id: 200099,
                            id: 200353
                        },
                        {
                            
                            display_name: "??o polo",
                            name: "Polo Shirts",
                            
                            
                            children: [],
                            parent_id: 200099,
                            id: 200354
                        },
                        {
                            
                            display_name: "??o li???n th??n",
                            name: "Bodysuits",
                            
                            
                            children: [],
                            parent_id: 200099,
                            id: 200355
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Qu???n",
                    name: "Pants & Leggings",

                    
                    children: [{
                            
                            display_name: "Qu???n legging",
                            name: "Leggings & Treggings",
                            
                            
                            children: [],
                            parent_id: 200100,
                            id: 200357
                        },
                        {
                            
                            display_name: "Qu???n d??i",
                            name: "Pants",
                            
                            
                            children: [],
                            parent_id: 200100,
                            id: 200358
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Qu???n ????i",
                    name: "Shorts",

                    
                    children: [{
                            
                            display_name: "Qu???n ????i",
                            name: "Shorts",
                            
                            
                            children: [],
                            parent_id: 200101,
                            id: 200360
                        },
                        {
                            
                            display_name: "Qu???n v??y",
                            name: "Skorts",
                            
                            
                            children: [],
                            parent_id: 200101,
                            id: 200361
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "V??y",
                    name: "Skirts",
                    
                    
                    children: [],
                    parent_id: 100000,
                    id: 200102
                },
                {
                    
                    display_name: "Qu???n jeans",
                    name: "Jeans",
                    
                    
                    children: [],
                    parent_id: 100000,
                    id: 200103
                },
                {
                    
                    display_name: "?????m",
                    name: "Dresses",
                    
                    
                    children: [],
                    parent_id: 100000,
                    id: 200104
                },
                {
                    
                    display_name: "V??y c?????i",
                    name: "Wedding Dresses",
                    
                    
                    children: [],
                    parent_id: 100000,
                    id: 200105
                },
                {
                    
                    display_name: "????? li???n th??n",
                    name: "Jumpsuits, Playsuits & Overalls",

                    
                    children: [{
                            
                            display_name: "????? bay (Jumpsuits)",
                            name: "Jumpsuits",
                            
                            
                            children: [],
                            parent_id: 200106,
                            id: 200363
                        },
                        {
                            
                            display_name: "????? bay ng???n (playsuits)",
                            name: "Playsuits",
                            
                            
                            children: [],
                            parent_id: 200106,
                            id: 200364
                        },
                        {
                            
                            display_name: "Qu???n y???m",
                            name: "Overalls",
                            
                            
                            children: [],
                            parent_id: 200106,
                            id: 200365
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "??o kho??c",
                    name: "Jackets, Coats & Vests",

                    
                    children: [{
                            
                            display_name: "??o kho??c m??a ????ng",
                            name: "Winter Jackets & Coats",
                            
                            
                            children: [],
                            parent_id: 200107,
                            id: 200367
                        },
                        {
                            
                            display_name: "??o cho??ng",
                            name: "Capes",
                            
                            
                            children: [],
                            parent_id: 200107,
                            id: 200368
                        },
                        {
                            
                            display_name: "??o blazer",
                            name: "Blazers",
                            
                            
                            children: [],
                            parent_id: 200107,
                            id: 200369
                        },
                        {
                            
                            display_name: "??o kho??c ngo??i",
                            name: "Jackets",
                            
                            
                            children: [],
                            parent_id: 200107,
                            id: 200370
                        },
                        {
                            
                            display_name: "??o vest",
                            name: "Vests",
                            
                            
                            children: [],
                            parent_id: 200107,
                            id: 200371
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "??o len",
                    name: "Sweaters & Cardigans",
                    
                    
                    children: [],
                    parent_id: 100000,
                    id: 200108
                },
                {
                    
                    display_name: "Hoodie v?? ??o n???",
                    name: "Hoodies & Sweatshirts",

                    
                    children: [{
                            
                            display_name: "??o kho??c n???",
                            name: "Sweatshirts",
                            
                            
                            children: [],
                            parent_id: 200109,
                            id: 200373
                        },
                        {
                            
                            display_name: "??o hoodies",
                            name: "Hoodies",
                            
                            
                            children: [],
                            parent_id: 200109,
                            id: 200374
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "B???",
                    name: "Sets",

                    
                    children: [{
                            
                            display_name: "B??? ????? ????i",
                            name: "Couple Sets",
                            
                            
                            children: [],
                            parent_id: 200110,
                            id: 200376
                        },
                        {
                            
                            display_name: "B??? ????? gia ????nh",
                            name: "Family Sets",
                            
                            
                            children: [],
                            parent_id: 200110,
                            id: 200377
                        },
                        {
                            
                            display_name: "????? l???",
                            name: "Individual Sets",
                            
                            
                            children: [],
                            parent_id: 200110,
                            id: 200378
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "????? l??t",
                    name: "Lingerie & Underwear",

                    
                    children: [{
                            
                            display_name: "B??? ????? l??t",
                            name: "Sets",
                            
                            
                            children: [],
                            parent_id: 200111,
                            id: 200380
                        },
                        {
                            
                            display_name: "??o ng???c",
                            name: "Bras",
                            
                            
                            children: [],
                            parent_id: 200111,
                            id: 200381
                        },
                        {
                            
                            display_name: "Qu???n l??t",
                            name: "Panties",
                            
                            
                            children: [],
                            parent_id: 200111,
                            id: 200382
                        },
                        {
                            
                            display_name: "????? l??t gi??? nhi???t",
                            name: "Thermal Innerwear",
                            
                            
                            children: [],
                            parent_id: 200111,
                            id: 200383
                        },
                        {
                            
                            display_name: "Ph??? ki???n ????? l??t",
                            name: "Bra Accessories",
        
                            
                            children: [],
                            parent_id: 200111,
                            id: 200384
                        },
                        {
                            
                            display_name: "????? ?????nh h??nh",
                            name: "Shapewear",
                            
                            
                            children: [],
                            parent_id: 200111,
                            id: 200385
                        },
                        {
                            
                            display_name: "????? l??t b???o h???",
                            name: "Safety Pants",
                            
                            
                            children: [],
                            parent_id: 200111,
                            id: 200386
                        },
                        {
                            
                            display_name: "????? l??t g???i c???m",
                            name: "Sexy Lingerie",
                            
                            
                            children: [],
                            parent_id: 200111,
                            id: 200387
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "????? ng???",
                    name: "Sleepwear & Pajamas",

                    
                    children: [{
                            
                            display_name: "Pyjama",
                            name: "Pajamas",
                            
                            
                            children: [],
                            parent_id: 200112,
                            id: 200389
                        },
                        {
                            
                            display_name: "V??y ng???",
                            name: "Night Dresses",
                            
                            
                            children: [],
                            parent_id: 200112,
                            id: 200390
                        },
                        {
                            
                            display_name: "??o cho??ng ng???, ??o kho??c kimono",
                            name: "Kimonos & Robes",
                            
                            
                            children: [],
                            parent_id: 200112,
                            id: 200391
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "????? B???u",
                    name: "Maternity Wear",

                    
                    children: [{
                            
                            display_name: "??o ng???c cho con b??",
                            name: "Nursing Bras",
                            
                            
                            children: [],
                            parent_id: 200113,
                            id: 200393
                        },
                        {
                            
                            display_name: "?????m b???u",
                            name: "Maternity Dresses",
                            
                            
                            children: [],
                            parent_id: 200113,
                            id: 200394
                        },
                        {
                            
                            display_name: "??o b???u",
                            name: "Maternity Tops",
                            
                            
                            children: [],
                            parent_id: 200113,
                            id: 200395
                        },
                        {
                            
                            display_name: "????? m???c cho con b??",
                            name: "Breastfeeding Wear",
                            
                            
                            children: [],
                            parent_id: 200113,
                            id: 200396
                        },
                        {
                            
                            display_name: "B??? ????? b???u",
                            name: "Maternity Sets",
                            
                            
                            children: [],
                            parent_id: 200113,
                            id: 200397
                        },
                        {
                            
                            display_name: "Qu???n b???u, V??y b???u",
                            name: "Maternity Bottoms",
                            
                            
                            children: [],
                            parent_id: 200113,
                            id: 200398
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "????? truy???n th???ng",
                    name: "Traditional Wear",

                    
                    children: [{
                            
                            display_name: "??o",
                            name: "Tops",
                            
                            
                            children: [],
                            parent_id: 200114,
                            id: 200400
                        },
                        {
                            
                            display_name: "Qu???n v?? ch??n v??y",
                            name: "Bottoms",
                            
                            
                            children: [],
                            parent_id: 200114,
                            id: 200401
                        },
                        {
                            
                            display_name: "B???",
                            name: "Sets",
                            
                            
                            children: [],
                            parent_id: 200114,
                            id: 200402
                        },
                        {
                            
                            display_name: "?????m",
                            name: "Dresses",
                            
                            
                            children: [],
                            parent_id: 200114,
                            id: 200403
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "????? h??a trang",
                    name: "Costumes",
                    
                    
                    children: [],
                    parent_id: 100000,
                    id: 200115
                },
                {
                    
                    display_name: "Kh??c",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 100000,
                    id: 200116
                },
                {
                    
                    display_name: "V???i",
                    name: "Fabric",

                    
                    children: [{
                            
                            display_name: "V???i cotton",
                            name: "Cotton",
                            
                            
                            children: [],
                            parent_id: 200117,
                            id: 200407
                        },
                        {
                            
                            display_name: "V???i len",
                            name: "Wool",
                            
                            
                            children: [],
                            parent_id: 200117,
                            id: 200408
                        },
                        {
                            
                            display_name: "V???i nhung, l???a, satin",
                            name: "Velvet, Silk & Satin",
                            
                            
                            children: [],
                            parent_id: 200117,
                            id: 200409
                        },
                        {
                            
                            display_name: "V???i da",
                            name: "Leather",
                            
                            
                            children: [],
                            parent_id: 200117,
                            id: 200410
                        },
                        {
                            
                            display_name: "V???i nylon",
                            name: "Vinyl & Nylon",
                            
                            
                            children: [],
                            parent_id: 200117,
                            id: 200411
                        },
                        {
                            
                            display_name: "V???i denim",
                            name: "Denim",
                            
                            
                            children: [],
                            parent_id: 200117,
                            id: 200412
                        },
                        {
                            
                            display_name: "V???i canvas",
                            name: "Canvas",
                            
                            
                            children: [],
                            parent_id: 200117,
                            id: 200413
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "V???/ T???t",
                    name: "Socks & Stockings",

                    
                    children: [{
                            
                            display_name: "T???t",
                            name: "Socks",
                            
                            
                            children: [],
                            parent_id: 200118,
                            id: 200417
                        },
                        {
                            
                            display_name: "Qu???n t???t",
                            name: "Pantyhose",
                            
                            
                            children: [],
                            parent_id: 200118,
                            id: 200418
                        },
                        {
                            
                            display_name: "Kh??c",
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

            display_name: "Th???i Trang Nam",
            name: "Men Clothes",

            
            children: [{
                    
                    display_name: "Qu???n jean",
                    name: "Jeans",
                    
                    
                    children: [],
                    parent_id: 200011,
                    id: 200047
                },  
                {
                    
                    display_name: "Hoodie & ??o n???",
                    name: "Hoodies & Sweatshirts",

                    
                    children: [{
                            
                            display_name: "??o hoodie",
                            name: "Hoodies",
                            
                            
                            children: [],
                            parent_id: 200048,
                            id: 200226
                        },
                        {
                            
                            display_name: "??o n???",
                            name: "Sweatshirts",
                            
                            
                            children: [],
                            parent_id: 200048,
                            id: 200227
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "??o len",
                    name: "Sweaters & Cardigans",
                    
                    
                    children: [],
                    parent_id: 200011,
                    id: 200049
                },
                {
                    
                    display_name: "??o kho??c",
                    name: "Jackets, Coats & Vests",

                    
                    children: [{
                            
                            display_name: "??o kho??c m??a ????ng & ??o cho??ng",
                            name: "Winter Jackets & Coats",
                            
                            
                            children: [],
                            parent_id: 200050,
                            id: 200229
                        },
                        {
                            
                            display_name: "??o kho??c",
                            name: "Jackets",
                            
                            
                            children: [],
                            parent_id: 200050,
                            id: 200230
                        },
                        {
                            
                            display_name: "??o kho??c vest",
                            name: "Vests",
                            
                            
                            children: [],
                            parent_id: 200050,
                            id: 200231
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Com l??",
                    name: "Suits",

                    
                    children: [{
                            
                            display_name: "B??? Com l??",
                            name: "Suit Sets",
                            
                            
                            children: [],
                            parent_id: 200051,
                            id: 200233
                        },
                        {
                            
                            display_name: "??o Kho??c & Blazer",
                            name: "Suit Jackets & Blazers",
                            
                            
                            children: [],
                            parent_id: 200051,
                            id: 200234
                        },
                        {
                            
                            display_name: "Qu???n ??u",
                            name: "Suit Pants",
                            
                            
                            children: [],
                            parent_id: 200051,
                            id: 200235
                        },
                        {
                            
                            display_name: "??o vest & Gi l??",
                            name: "Suit Vests & Waistcoats",
                            
                            
                            children: [],
                            parent_id: 200051,
                            id: 200236
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Qu???n d??i",
                    name: "Pants",

                    
                    children: [{
                            
                            display_name: "Qu???n t??i h???p",
                            name: "Cargo",
                            
                            
                            children: [],
                            parent_id: 200052,
                            id: 200238
                        },
                        {
                            
                            display_name: "Qu???n jogger",
                            name: "Joggers",
                            
                            
                            children: [],
                            parent_id: 200052,
                            id: 200239
                        },
                        {
                            
                            display_name: "Qu???n d??i",
                            name: "Pants",
                            
                            
                            children: [],
                            parent_id: 200052,
                            id: 200240
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Qu???n ????i",
                    name: "Shorts",
                    
                    
                    children: [],
                    parent_id: 200011,
                    id: 200053
                },
                {
                    
                    display_name: "??o",
                    name: "Tops",

                    
                    children: [{
                            
                            display_name: "??o s?? mi",
                            name: "Shirts",
                            
                            
                            children: [],
                            parent_id: 200054,
                            id: 200242
                        },
                        {
                            
                            display_name: "??o polo",
                            name: "Polo Shirts",
                            
                            
                            children: [],
                            parent_id: 200054,
                            id: 200243
                        },
                        {
                            
                            display_name: "??o thun",
                            name: "T-Shirts",
                            
                            
                            children: [],
                            parent_id: 200054,
                            id: 200244
                        },
                        {
                            
                            display_name: "??o ba l???",
                            name: "Tanks",
                            
                            
                            children: [],
                            parent_id: 200054,
                            id: 200245
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "????? l??t",
                    name: "Innerwear & Underwear",

                    
                    children: [{
                            
                            display_name: "Qu???n l??t",
                            name: "Underwear",
                            
                            
                            children: [],
                            parent_id: 200055,
                            id: 200247
                        },
                        {
                            
                            display_name: "??o l??t",
                            name: "Undershirts",
                            
                            
                            children: [],
                            parent_id: 200055,
                            id: 200248
                        },
                        {
                            
                            display_name: "????? l??t gi??? nhi???t",
                            name: "Thermal Innerwear",
                            
                            
                            children: [],
                            parent_id: 200055,
                            id: 200249
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "????? ng???",
                    name: "Sleepwear",
                    
                    
                    children: [],
                    parent_id: 200011,
                    id: 200056
                },
                {
                    
                    display_name: "B???",
                    name: "Sets",
                    
                    
                    children: [],
                    parent_id: 200011,
                    id: 200057
                },
                {
                    
                    display_name: "Trang ph???c truy???n th???ng",
                    name: "Traditional Wear",

                    
                    children: [{
                            
                            display_name: "??o",
                            name: "Tops",
                            
                            
                            children: [],
                            parent_id: 200058,
                            id: 200251
                        },
                        {
                            
                            display_name: "Qu???n",
                            name: "Bottoms",
                            
                            
                            children: [],
                            parent_id: 200058,
                            id: 200252
                        },
                        {
                            
                            display_name: "B???",
                            name: "Sets",
                            
                            
                            children: [],
                            parent_id: 200058,
                            id: 200253
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "????? h??a trang",
                    name: "Costumes",
                    
                    
                    children: [],
                    parent_id: 200011,
                    id: 200059
                },
                {
                    
                    display_name: "Trang ph???c ng??nh ngh???",
                    name: "Occupational Attire",
                    
                    
                    children: [],
                    parent_id: 200011,
                    id: 200060
                },
                {
                    
                    display_name: "Kh??c",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200011,
                    id: 200061
                },
                {
                    
                    display_name: "V???/ T???t",
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

            display_name: "S???c ?????p",
            name: "Beauty",

            
            children: [{
                    
                    display_name: "Ch??m s??c tay, ch??n & m??ng",
                    name: "Hand, Foot & Nail Care",

                    
                    children: [{
                            
                            display_name: "Ch??m s??c tay",
                            name: "Hand Care",
        
                            
                            children: [],
                            parent_id: 200658,
                            id: 200865
                        },
                        {
                            
                            display_name: "Ch??m s??c ch??n",
                            name: "Foot Care",
        
                            
                            children: [],
                            parent_id: 200658,
                            id: 200866
                        },
                        {
                            
                            display_name: "Ch??m s??c m??ng",
                            name: "Nail Care",
        
                            
                            children: [],
                            parent_id: 200658,
                            id: 200867
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ch??m s??c t??c",
                    name: "Hair Care",

                    
                    children: [{
                            
                            display_name: "D???u g???i",
                            name: "Shampoo",
                            
                            
                            children: [],
                            parent_id: 200659,
                            id: 200869
                        },
                        {
                            
                            display_name: "Thu???c nhu???m t??c",
                            name: "Hair Colour",
                            
                            
                            children: [],
                            parent_id: 200659,
                            id: 200870
                        },
                        {
                            
                            display_name: "S???n ph???m d?????ng t??c",
                            name: "Hair Treatment",
                            
                            
                            children: [],
                            parent_id: 200659,
                            id: 200871
                        },
                        {
                            
                            display_name: "D???u x???",
                            name: "Hair and Scalp Conditioner",
                            
                            
                            children: [],
                            parent_id: 200659,
                            id: 200872
                        },
                        {
                            
                            display_name: "S???n ph???m t???o ki???u t??c",
                            name: "Hair Styling",
                            
                            
                            children: [],
                            parent_id: 200659,
                            id: 200873
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ch??m s??c nam gi???i",
                    name: "Men's Care",

                    
                    children: [{
                            
                            display_name: "S???a t???m & ch??m s??c c?? th???",
                            name: "Bath & Body Care",
                            
                            
                            children: [],
                            parent_id: 200660,
                            id: 200875
                        },
                        {
                            
                            display_name: "Ch??m s??c da",
                            name: "Skincare",
        
                            
                            children: [],
                            parent_id: 200660,
                            id: 200876
                        },
                        {
                            
                            display_name: "S???n ph???m c???o r??u & h???t t??c",
                            name: "Shaving & Grooming",
        
                            
                            children: [],
                            parent_id: 200660,
                            id: 200877
                        },
                        {
                            
                            display_name: "Ch??m s??c t??c",
                            name: "Hair Care",
                            
                            
                            children: [],
                            parent_id: 200660,
                            id: 200878
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "N?????c hoa",
                    name: "Perfumes & Fragrances",
                    
                    
                    children: [],
                    parent_id: 200630,
                    id: 200661
                },
                {
                    
                    display_name: "Trang ??i???m",
                    name: "Makeup",

                    
                    children: [{
                            
                            display_name: "Kh??c",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200662,
                            id: 200880
                        },
                        {
                            
                            display_name: "Trang ??i???m m???t",
                            name: "Face",
        
                            
                            children: [],
                            parent_id: 200662,
                            id: 200881
                        },
                        {
                            
                            display_name: "Trang ??i???m m???t",
                            name: "Eyes",
        
                            
                            children: [],
                            parent_id: 200662,
                            id: 200882
                        },
                        {
                            
                            display_name: "Trang ??i???m m??i",
                            name: "Lips",
        
                            
                            children: [],
                            parent_id: 200662,
                            id: 200883
                        },
                        {
                            
                            display_name: "T???y trang",
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
                    
                    display_name: "D???ng c??? l??m ?????p",
                    name: "Beauty Tools",

                    
                    children: [{
                            
                            display_name: "D???ng c??? trang ??i???m",
                            name: "Makeup Accessories",
        
                            
                            children: [],
                            parent_id: 200663,
                            id: 200885
                        },
                        {
                            
                            display_name: "D???ng c??? ch??m s??c da m???t",
                            name: "Facial Care Tools",
        
                            
                            children: [],
                            parent_id: 200663,
                            id: 200886
                        },
                        {
                            
                            display_name: "D???ng c??? l??m thon g???n c?? th???",
                            name: "Body Slimming Tools",
                            
                            
                            children: [],
                            parent_id: 200663,
                            id: 200887
                        },
                        {
                            
                            display_name: "D???ng c??? t???y l??ng",
                            name: "Hair Removal Tools",
                            
                            
                            children: [],
                            parent_id: 200663,
                            id: 200888
                        },
                        {
                            
                            display_name: "D???ng c??? ch??m s??c t??c",
                            name: "Hair Tools",
        
                            
                            children: [],
                            parent_id: 200663,
                            id: 200889
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ch??m s??c da m???t",
                    name: "Skincare",

                    
                    children: [{
                            
                            display_name: "S???a r???a m???t",
                            name: "Facial Cleanser",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200891
                        },
                        {
                            
                            display_name: "N?????c c??n b???ng da",
                            name: "Toner",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200892
                        },
                        {
                            
                            display_name: "Kem d?????ng ???m",
                            name: "Facial Moisturizer",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200893
                        },
                        {
                            
                            display_name: "D???u d?????ng ???m",
                            name: "Facial Oil",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200894
                        },
                        {
                            
                            display_name: "X???t kho??ng",
                            name: "Facial Mist",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200895
                        },
                        {
                            
                            display_name: "Tinh ch???t d?????ng",
                            name: "Facial Serum & Essence",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200896
                        },
                        {
                            
                            display_name: "T???y t??? b??o ch???t",
                            name: "Face Scrub & Peel",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200897
                        },
                        {
                            
                            display_name: "M???t n???",
                            name: "Face Mask & Packs",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200898
                        },
                        {
                            
                            display_name: "S???n ph???m d?????ng m???t",
                            name: "Eye Treatment",
        
                            
                            children: [],
                            parent_id: 200664,
                            id: 200899
                        },
                        {
                            
                            display_name: "S???n ph???m d?????ng m??i",
                            name: "Lip Treatment",
        
                            
                            children: [],
                            parent_id: 200664,
                            id: 200900
                        },
                        {
                            
                            display_name: "Kem ch???ng n???ng cho m???t",
                            name: "Face Sunscreen",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200901
                        },
                        {
                            
                            display_name: "Kem d?????ng sau ch???ng n???ng",
                            name: "After Sun Face Care",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200902
                        },
                        {
                            
                            display_name: "Gi???y th???m d???u",
                            name: "Blotting Paper",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200903
                        },
                        {
                            
                            display_name: "S???n ph???m tr??? m???n",
                            name: "Acne Treatment",
                            
                            
                            children: [],
                            parent_id: 200664,
                            id: 200904
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "B??? s???n ph???m l??m ?????p",
                    name: "Beauty Sets & Packages",
                    
                    
                    children: [],
                    parent_id: 200630,
                    id: 200665
                },
                {
                    
                    display_name: "Kh??c",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200630,
                    id: 200666
                },
                {
                    
                    display_name: "T???m & ch??m s??c c?? th???",
                    name: "Bath & Body Care",

                    
                    children: [{
                            
                            display_name: "X?? ph??ng & s???a t???m",
                            name: "Body Wash & Soap",
                            
                            
                            children: [],
                            parent_id: 202002,
                            id: 202003
                        },
                        {
                            
                            display_name: "T???y t??? b??o ch???t c?? th???",
                            name: "Body Scrub & Peel",
                            
                            
                            children: [],
                            parent_id: 202002,
                            id: 202004
                        },
                        {
                            
                            display_name: "M???t n??? ??? c?? th???",
                            name: "Body Masks",
                            
                            
                            children: [],
                            parent_id: 202002,
                            id: 202005
                        },
                        {
                            
                            display_name: "D???u d?????ng da",
                            name: "Body Oil",
                            
                            
                            children: [],
                            parent_id: 202002,
                            id: 202006
                        },
                        {
                            
                            display_name: "Kem & s???a d?????ng th???",
                            name: "Body Cream, Lotion & Butter",
                            
                            
                            children: [],
                            parent_id: 202002,
                            id: 202007
                        },
                        {
                            
                            display_name: "Kh??? m??i c?? th???",
                            name: "Body Deodorants",
                            
                            
                            children: [],
                            parent_id: 202002,
                            id: 202008
                        },
                        {
                            
                            display_name: "D???u massage",
                            name: "Massage Oil",
                            
                            
                            children: [],
                            parent_id: 202002,
                            id: 202009
                        },
                        {
                            
                            display_name: "Kem t???y l??ng & wax l??ng",
                            name: "Hair Removal Cream & Wax",
                            
                            
                            children: [],
                            parent_id: 202002,
                            id: 202010
                        },
                        {
                            
                            display_name: "Ch???ng n???ng",
                            name: "Sun Care",
        
                            
                            children: [],
                            parent_id: 202002,
                            id: 202011
                        },
                        {
                            
                            display_name: "Ch??m s??c ng???c",
                            name: "Breast Care",
                            
                            
                            children: [],
                            parent_id: 202002,
                            id: 202012
                        },
                        {
                            
                            display_name: "Kh??c",
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

            display_name: "S???c Kh???e",
            name: "Health",

            
            children: [{
                    
                    display_name: "Th???c ph???m ch???c n??ng",
                    name: "Food Supplement",

                    
                    children: [{
                            
                            display_name: "H??? tr??? ki???m so??t c??n n???ng",
                            name: "Weight Management",
                            
                            
                            children: [],
                            parent_id: 200002,
                            id: 200003
                        },
                        {
                            
                            display_name: "H??? tr??? l??m ?????p",
                            name: "Beauty Supplements",
                            
                            
                            children: [],
                            parent_id: 200002,
                            id: 200004
                        },
                        {
                            
                            display_name: "H??? tr??? t??ng c??",
                            name: "Fitness",
                            
                            
                            children: [],
                            parent_id: 200002,
                            id: 200005
                        },
                        {
                            
                            display_name: "H??? tr??? s???c kh???e",
                            name: "Well Being",
                            
                            
                            children: [],
                            parent_id: 200002,
                            id: 200006
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Kh??c",
                    name: "Others",
                    
                    
                    children: [],
                    parent_id: 200001,
                    id: 200008
                },
                {
                    
                    display_name: "V???t t?? y t???",
                    name: "Medical Supplies",

                    
                    children: [{
                            
                            display_name: "Thu???c kh??ng k?? ????n",
                            name: "Over-the-counter Medicine",
                            
                            
                            children: [],
                            parent_id: 200018,
                            id: 200119
                        },
                        {
                            
                            display_name: "Thu???c gia truy???n",
                            name: "Traditional Medicine",
                            
                            
                            children: [],
                            parent_id: 200018,
                            id: 200120
                        },
                        {
                            
                            display_name: "Ki???m tra v?? theo d??i s???c kh???e",
                            name: "Health Monitors & Tests",
        
                            
                            children: [],
                            parent_id: 200018,
                            id: 200121
                        },
                        {
                            
                            display_name: "C??n s???c kh???e v?? ph??n t??ch c?? th???",
                            name: "Scale & Body Fat Analyzers",
                            
                            
                            children: [],
                            parent_id: 200018,
                            id: 200122
                        },
                        {
                            
                            display_name: "Ch??m s??c m??i",
                            name: "Nasal Care",
                            
                            
                            children: [],
                            parent_id: 200018,
                            id: 200123
                        },
                        {
                            
                            display_name: "D???ng c??? s?? c???u",
                            name: "First Aid Supplies",
        
                            
                            children: [],
                            parent_id: 200018,
                            id: 200124
                        },
                        {
                            
                            display_name: "???ng nghe y t???",
                            name: "Stethoscopes",
                            
                            
                            children: [],
                            parent_id: 200018,
                            id: 200125
                        },
                        {
                            
                            display_name: "Thu???c gi???m ??au",
                            name: "Pain Relievers",
                            
                            
                            children: [],
                            parent_id: 200018,
                            id: 200126
                        },
                        {
                            
                            display_name: "D???ng c??? th?? nghi???m",
                            name: "Laboratory Tools",
                            
                            
                            children: [],
                            parent_id: 200018,
                            id: 200127
                        },
                        {
                            
                            display_name: "Bao tay v?? kh???u trang y t???",
                            name: "Medical Gloves & Masks",
                            
                            
                            children: [],
                            parent_id: 200018,
                            id: 200128
                        },
                        {
                            
                            display_name: "H??? tr??? ch???n th????ng v?? khuy???t t???t",
                            name: "Injury & Disability Support",
        
                            
                            children: [],
                            parent_id: 200018,
                            id: 200129
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ch??m s??c c?? nh??n",
                    name: "Personal Care",

                    
                    children: [{
                            
                            display_name: "Dung d???ch s??t khu???n tay",
                            name: "Hand Sanitizers",
                            
                            
                            children: [],
                            parent_id: 200019,
                            id: 200131
                        },
                        {
                            
                            display_name: "Ch??m s??c m???t",
                            name: "Eye Care",
        
                            
                            children: [],
                            parent_id: 200019,
                            id: 200132
                        },
                        {
                            
                            display_name: "Ch??m s??c tai",
                            name: "Ear Care",
                            
                            
                            children: [],
                            parent_id: 200019,
                            id: 200133
                        },
                        {
                            
                            display_name: "V??? sinh r??ng mi???ng",
                            name: "Oral Care",
        
                            
                            children: [],
                            parent_id: 200019,
                            id: 200134
                        },
                        {
                            
                            display_name: "T?? ng?????i l???n",
                            name: "Adult Diapers & Incontinence",
                            
                            
                            children: [],
                            parent_id: 200019,
                            id: 200135
                        },
                        {
                            
                            display_name: "Ch??m s??c ph??? n???",
                            name: "Feminine Care",
        
                            
                            children: [],
                            parent_id: 200019,
                            id: 200136
                        },
                        {
                            
                            display_name: "D???ng c??? massage v?? tr??? li???u",
                            name: "Massage & Therapy Devices",
                            
                            
                            children: [],
                            parent_id: 200019,
                            id: 200137
                        },
                        {
                            
                            display_name: "Ch???ng mu???i & xua ??u???i c??n tr??ng",
                            name: "Insect Repellents",
                            
                            
                            children: [],
                            parent_id: 200019,
                            id: 200138
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "H??? tr??? t??nh d???c",
                    name: "Sexual Wellness",

                    
                    children: [{
                            
                            display_name: "Bao cao su",
                            name: "Condoms",
                            
                            
                            children: [],
                            parent_id: 200020,
                            id: 200140
                        },
                        {
                            
                            display_name: "B??i tr??n",
                            name: "Lubricants",
                            
                            
                            children: [],
                            parent_id: 200020,
                            id: 200141
                        },
                        {
                            
                            display_name: "T??ng c?????ng sinh l??",
                            name: "Performance Enhancement",
                            
                            
                            children: [],
                            parent_id: 200020,
                            id: 200143
                        },
                        {
                            
                            display_name: "Kh??c",
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

            display_name: "Ph??? Ki???n Th???i Trang",
            name: "Fashion Accessories",

            
            children: [{
                    
                    display_name: "Nh???n",
                    name: "Rings",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200021
                },
                {
                    
                    display_name: "B??ng tai",
                    name: "Earrings",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200022
                },
                {
                    
                    display_name: "Kh??n cho??ng",
                    name: "Scarves & Shawls",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200023
                },
                {
                    
                    display_name: "G??ng tay",
                    name: "Gloves",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200024
                },
                {
                    
                    display_name: "Ph??? ki???n t??c",
                    name: "Hair Accessories",

                    
                    children: [{
                            
                            display_name: "B??ng ???? t??c",
                            name: "Headbands",
                            
                            
                            children: [],
                            parent_id: 200025,
                            id: 200145
                        },
                        {
                            
                            display_name: "????? bu???c t??c & N??",
                            name: "Hair Ties, Ribbons & Scrunchies",
                            
                            
                            children: [],
                            parent_id: 200025,
                            id: 200146
                        },
                        {
                            
                            display_name: "K???p t??c",
                            name: "Hair Clips & Hair Pins",
                            
                            
                            children: [],
                            parent_id: 200025,
                            id: 200147
                        },
                        {
                            
                            display_name: "T??c gi??? & T??c n???i",
                            name: "Wigs & Extensions",
                            
                            
                            children: [],
                            parent_id: 200025,
                            id: 200148
                        },
                        {
                            
                            display_name: "C??i t??c, v????ng mi???n c??i t??c",
                            name: "Headpieces, Tiaras & Flower Crowns",
                            
                            
                            children: [],
                            parent_id: 200025,
                            id: 200149
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "V??ng tay & L???c tay",
                    name: "Bracelets & Bangles",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200026
                },
                {
                    
                    display_name: "L???c ch??n",
                    name: "Anklets",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200027
                },
                {
                    
                    display_name: "M??",
                    name: "Hats & Caps",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200028
                },
                {
                    
                    display_name: "D??y chuy???n",
                    name: "Necklaces",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200029
                },
                {
                    
                    display_name: "K??nh m???t",
                    name: "Eyewear",

                    
                    children: [{
                            
                            display_name: "K??nh m??t",
                            name: "Sunglasses",
                            
                            
                            children: [],
                            parent_id: 200030,
                            id: 200151
                        },
                        {
                            
                            display_name: "G???ng k??nh",
                            name: "Frames & Glasses",
                            
                            
                            children: [],
                            parent_id: 200030,
                            id: 200152
                        },
                        {
                            
                            display_name: "H???p k??nh v?? ph??? ki???n",
                            name: "Eyewear Cases & Accessories",
                            
                            
                            children: [],
                            parent_id: 200030,
                            id: 200153
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Kim lo???i qu??",
                    name: "Investment Precious Metals",

                    
                    children: [{
                            
                            display_name: "Platinum & V??ng",
                            name: "Platinum & K Gold",
                            
                            
                            children: [],
                            parent_id: 200031,
                            id: 200155
                        },
                        {
                            
                            display_name: "B???c",
                            name: "Silver",
                            
                            
                            children: [],
                            parent_id: 200031,
                            id: 200156
                        },
                        {
                            
                            display_name: "Kim c????ng",
                            name: "Diamond",
                            
                            
                            children: [],
                            parent_id: 200031,
                            id: 200157
                        },
                        {
                            
                            display_name: "Ng???c b??ch, C???m th???ch",
                            name: "Jade",
                            
                            
                            children: [],
                            parent_id: 200031,
                            id: 200158
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Th???t l??ng",
                    name: "Belts",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200032
                },
                {
                    
                    display_name: "C?? v???t & N?? c???",
                    name: "Neckties, Bow Ties & Cravats",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200033
                },
                {
                    
                    display_name: "Ph??? ki???n th??m",
                    name: "Additional Accessories",

                    
                    children: [{
                            
                            display_name: "Tr??m & Ghim c??i ??o",
                            name: "Brooches & Pins",
                            
                            
                            children: [],
                            parent_id: 200034,
                            id: 200160
                        },
                        {
                            
                            display_name: "Mi???ng v?? ??o",
                            name: "Patches",
                            
                            
                            children: [],
                            parent_id: 200034,
                            id: 200161
                        },
                        {
                            
                            display_name: "M???t d??y chuy???n v?? Charm",
                            name: "Charms, Pendants & Ornaments",
                            
                            
                            children: [],
                            parent_id: 200034,
                            id: 200162
                        },
                        {
                            
                            display_name: "M??ng set nam",
                            name: "Cufflinks",
                            
                            
                            children: [],
                            parent_id: 200034,
                            id: 200163
                        },
                        {
                            
                            display_name: "H??nh x??m d??n",
                            name: "Tattoos",
                            
                            
                            children: [],
                            parent_id: 200034,
                            id: 200164
                        },
                        {
                            
                            display_name: "Kh???u trang th???i trang",
                            name: "Masks",
                            
                            
                            children: [],
                            parent_id: 200034,
                            id: 200165
                        },
                        {
                            
                            display_name: "Kh??n tay",
                            name: "Handkerchiefs",
                            
                            
                            children: [],
                            parent_id: 200034,
                            id: 200166
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "B??? ph??? ki???n",
                    name: "Accessories Sets & Packages",
                    
                    
                    children: [],
                    parent_id: 200009,
                    id: 200035
                },
                {
                    
                    display_name: "Kh??c",
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

            display_name: "Thi???t B??? ??i???n Gia D???ng",
            name: "Home Appliances",

            
            children: [{
                    
                    display_name: "M??y chi???u & Ph??? ki???n",
                    name: "Projectors & Accessories",

                    
                    children: [{
                            
                            display_name: "M??y chi???u & M??n h??nh chi???u",
                            name: "Projectors & Projector Screens",
                            
                            
                            children: [],
                            parent_id: 200037,
                            id: 200168
                        },
                        {
                            
                            display_name: "B??t tr??nh chi???u",
                            name: "Pointers",
                            
                            
                            children: [],
                            parent_id: 200037,
                            id: 200169
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Thi???t b??? ??i???n gia d???ng nh???",
                    name: "Small Household Appliances",

                    
                    children: [{
                            
                            display_name: "Thi???t b??? v??? sinh ch??n & Th?? gi??n",
                            name: "Foot Baths & Spas",
                            
                            
                            children: [],
                            parent_id: 200038,
                            id: 200171
                        },
                        {
                            
                            display_name: "M??y t??m n?????c",
                            name: "Water Flossers",
                            
                            
                            children: [],
                            parent_id: 200038,
                            id: 200172
                        },
                        {
                            
                            display_name: "M??y may & Ph??? ki???n",
                            name: "Sewing Machines & Accessories",
                            
                            
                            children: [],
                            parent_id: 200038,
                            id: 200173
                        },
                        {
                            
                            display_name: "??i???n tho???i",
                            name: "Telephones",
        
                            
                            children: [],
                            parent_id: 200038,
                            id: 200174
                        },
                        {
                            
                            display_name: "B??n l?? kh?? & H??i n?????c",
                            name: "Irons & Steamers",
                            
                            
                            children: [],
                            parent_id: 200038,
                            id: 200175
                        },
                        {
                            
                            display_name: "Thi???t b??? x??? l?? kh??ng kh??",
                            name: "Air Treatment",
        
                            
                            children: [],
                            parent_id: 200038,
                            id: 200176
                        },
                        {
                            
                            display_name: "M??y h??t b???i & Thi???t b??? l??m s???ch s??n",
                            name: "Vacuum Cleaners & Floor Care Appliances",
                            
                            
                            children: [],
                            parent_id: 200038,
                            id: 200177
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Thi???t b??? ??i???n gia d???ng l???n",
                    name: "Large Household Appliances",

                    
                    children: [{
                            
                            display_name: "M??y gi???t & M??y s???y",
                            name: "Washing Machines & Dryers",
        
                            
                            children: [],
                            parent_id: 200039,
                            id: 200179
                        },
                        {
                            
                            display_name: "M??y n?????c n??ng",
                            name: "Water Heaters",
                            
                            
                            children: [],
                            parent_id: 200039,
                            id: 200180
                        },
                        {
                            
                            display_name: "Thi???t b??? l??m m??t",
                            name: "Cooling",
        
                            
                            children: [],
                            parent_id: 200039,
                            id: 200181
                        },
                        {
                            
                            display_name: "Thi???t b??? s???y kh?? n???m & Gi??y",
                            name: "Futon & Shoe Dryers",
                            
                            
                            children: [],
                            parent_id: 200039,
                            id: 200182
                        },
                        {
                            
                            display_name: "M??y s?????i",
                            name: "Heaters",
                            
                            
                            children: [],
                            parent_id: 200039,
                            id: 200183
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Tivi & Ph??? ki???n",
                    name: "TVs & Accessories",

                    
                    children: [{
                            
                            display_name: "Tivi",
                            name: "TVs",
                            
                            
                            children: [],
                            parent_id: 200040,
                            id: 200185
                        },
                        {
                            
                            display_name: "??ng ten Tivi",
                            name: "TV Antennas",
                            
                            
                            children: [],
                            parent_id: 200040,
                            id: 200186
                        },
                        {
                            
                            display_name: "Tivi box & ?????u thu k?? thu???t s???",
                            name: "TV Boxes & Receivers",
                            
                            
                            children: [],
                            parent_id: 200040,
                            id: 200187
                        },
                        {
                            
                            display_name: "Gi?? treo tivi",
                            name: "TV Brackets",
                            
                            
                            children: [],
                            parent_id: 200040,
                            id: 200188
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "????? gia d???ng nh?? b???p",
                    name: "Kitchen Appliances",

                    
                    children: [{
                            
                            display_name: "M??y l???c n?????c",
                            name: "Water Filters, Coolers & Dispensers",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200190
                        },
                        {
                            
                            display_name: "???m ??un si??u t???c",
                            name: "Kettles",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200191
                        },
                        {
                            
                            display_name: "T??? ??? r?????u",
                            name: "Wine Fridges",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200192
                        },
                        {
                            
                            display_name: "M??y ??p, Xay sinh t??? & M??y l??m s???a ?????u n??nh",
                            name: "Juicers, Blenders & Soya Bean Machines",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200193
                        },
                        {
                            
                            display_name: "M??y pha c?? ph?? & Ph??? ki???n",
                            name: "Coffee Machines & Accessories",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200194
                        },
                        {
                            
                            display_name: "M??y tr???n th???c ph???m",
                            name: "Mixers",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200195
                        },
                        {
                            
                            display_name: "M??y r???a b??t ????a",
                            name: "Dishwashers",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200196
                        },
                        {
                            
                            display_name: "L?? s?????i, B???p t??? & B??? ??i???u ch???nh gas",
                            name: "Stoves, Hobs & Gas Regulators",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200197
                        },
                        {
                            
                            display_name: "N???i chi??n kh??ng d???u",
                            name: "Air Fryers",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200198
                        },
                        {
                            
                            display_name: "N???i chi??n ng???p d???u",
                            name: "Deep Fryers",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200199
                        },
                        {
                            
                            display_name: "L?? vi s??ng",
                            name: "Microwaves",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200200
                        },
                        {
                            
                            display_name: "L?? n?????ng",
                            name: "Ovens",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200201
                        },
                        {
                            
                            display_name: "M??y n?????ng b??nh",
                            name: "Toasters",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200202
                        },
                        {
                            
                            display_name: "M??y ch??? bi???n th???c ph???m & Xay th???t",
                            name: "Food Processors & Meat Grinders",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200203
                        },
                        {
                            
                            display_name: "N???i n???u ??a n??ng",
                            name: "Multi-function Cookers",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200204
                        },
                        {
                            
                            display_name: "N???i ??p su???t",
                            name: "Pressure Cookers",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200205
                        },
                        {
                            
                            display_name: "N???i n???u ch???m & D???ng c??? n???u ch??n kh??ng",
                            name: "Slow Cookers & Sous Vide Machines",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200206
                        },
                        {
                            
                            display_name: "N???i c??m ??i???n",
                            name: "Rice Cookers",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200207
                        },
                        {
                            
                            display_name: "D???ng c??? n???u ?????c bi???t",
                            name: "Specialty Cookware",
        
                            
                            children: [],
                            parent_id: 200041,
                            id: 200208
                        },
                        {
                            
                            display_name: "T??? l???nh",
                            name: "Refrigerators",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200209
                        },
                        {
                            
                            display_name: "T??? ????ng",
                            name: "Freezers",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200210
                        },
                        {
                            
                            display_name: "M??y h??t kh??i",
                            name: "Hoods",
                            
                            
                            children: [],
                            parent_id: 200041,
                            id: 200211
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "M???ch ??i???n & Ph??? t??ng",
                    name: "Electrical Circuitry & Parts",

                    
                    children: [{
                            
                            display_name: "??? c???m ??i???n & D??y n???i",
                            name: "Electric Sockets & Extension Cords",
                            
                            
                            children: [],
                            parent_id: 200042,
                            id: 200213
                        },
                        {
                            
                            display_name: "Thi???t b??? an to??n ??i???n t???",
                            name: "Electrical Safety",
                            
                            
                            children: [],
                            parent_id: 200042,
                            id: 200214
                        },
                        {
                            
                            display_name: "Thi???t b??? ti???t ki???m ??i???n",
                            name: "Electricity Savers",
                            
                            
                            children: [],
                            parent_id: 200042,
                            id: 200215
                        },
                        {
                            
                            display_name: "Chu??ng c???a",
                            name: "Doorbells",
                            
                            
                            children: [],
                            parent_id: 200042,
                            id: 200216
                        },
                        {
                            
                            display_name: "C??ng t???c",
                            name: "Switches",
                            
                            
                            children: [],
                            parent_id: 200042,
                            id: 200217
                        },
                        {
                            
                            display_name: "Thi???t b??? b??o ?????ng nh?? ???",
                            name: "House Alarms",
                            
                            
                            children: [],
                            parent_id: 200042,
                            id: 200218
                        },
                        {
                            
                            display_name: "Thi???t b??? ch???ng s???m s??t",
                            name: "Lightning Protection",
                            
                            
                            children: [],
                            parent_id: 200042,
                            id: 200219
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Thi???t b??? ??i???u khi???n t??? xa",
                    name: "Remote Controls",
                    
                    
                    children: [],
                    parent_id: 200010,
                    id: 200045
                },
                {
                    
                    display_name: "Kh??c",
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

            display_name: "Gi??y D??p Nam",
            name: "Men Shoes",

            
            children: [{
                    
                    display_name: "B???t",
                    name: "Boots",

                    
                    children: [{
                            
                            display_name: "B???t th???i trang",
                            name: "Fashion Boots",
                            
                            
                            children: [],
                            parent_id: 200063,
                            id: 200255
                        },
                        {
                            
                            display_name: "B???t ??i m??a",
                            name: "Rain Boots",
                            
                            
                            children: [],
                            parent_id: 200063,
                            id: 200256
                        },
                        {
                            
                            display_name: "B???t b???o h???",
                            name: "Safety Boots",
                            
                            
                            children: [],
                            parent_id: 200063,
                            id: 200257
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Gi??y th??? thao/ Sneakers",
                    name: "Sneakers",
                    
                    
                    children: [],
                    parent_id: 200012,
                    id: 200064
                },
                {
                    
                    display_name: "Gi??y s???c",
                    name: "Slip Ons & Mules",
                    
                    
                    children: [],
                    parent_id: 200012,
                    id: 200065
                },
                {
                    
                    display_name: "Gi??y t??y l?????i",
                    name: "Loafers & Boat Shoes",
                    
                    
                    children: [],
                    parent_id: 200012,
                    id: 200066
                },
                {
                    
                    display_name: "Gi??y Oxfords & Gi??y bu???c d??y",
                    name: "Oxfords & Lace-Ups",
                    
                    
                    children: [],
                    parent_id: 200012,
                    id: 200067
                },
                {
                    
                    display_name: "X??ng-??an & D??p",
                    name: "Sandals & Flip Flops",

                    
                    children: [{
                            
                            display_name: "D??p x??? ng??n",
                            name: "Flip Flops",
                            
                            
                            children: [],
                            parent_id: 200068,
                            id: 200259
                        },
                        {
                            
                            display_name: "X??ng-??an",
                            name: "Sandals",
                            
                            
                            children: [],
                            parent_id: 200068,
                            id: 200260
                        },
                        {
                            
                            display_name: "D??p ??i trong nh??",
                            name: "Indoor Slippers",
                            
                            
                            children: [],
                            parent_id: 200068,
                            id: 200261
                        },
                        {
                            
                            display_name: "D??p m??t-xa",
                            name: "Health Slippers",
                            
                            
                            children: [],
                            parent_id: 200068,
                            id: 200262
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ph??? ki???n gi??y d??p",
                    name: "Shoe Care & Accessories",

                    
                    children: [{
                            
                            display_name: "D???ng c??? ch??m s??c & V??? sinh gi??y",
                            name: "Shoe Care & Cleaning Tools",
                            
                            
                            children: [],
                            parent_id: 200069,
                            id: 200264
                        },
                        {
                            
                            display_name: "Kh??? m??i gi??y d??p",
                            name: "Shoe Deodorizers",
                            
                            
                            children: [],
                            parent_id: 200069,
                            id: 200265
                        },
                        {
                            
                            display_name: "D??y gi??y",
                            name: "Shoe Laces",
                            
                            
                            children: [],
                            parent_id: 200069,
                            id: 200266
                        },
                        {
                            
                            display_name: "C??y ????n g??t & Gi??? form gi??y",
                            name: "Shoe Horns & Trees",
                            
                            
                            children: [],
                            parent_id: 200069,
                            id: 200267
                        },
                        {
                            
                            display_name: "L??t gi??y",
                            name: "Shoe Insoles",
                            
                            
                            children: [],
                            parent_id: 200069,
                            id: 200268
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Kh??c",
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

            display_name: "??i???n Tho???i & Ph??? Ki???n",
            name: "Mobile & Gadgets",

            
            children: [{
                    
                    display_name: "Th??? sim",
                    name: "Sim Cards",
                    
                    
                    children: [],
                    parent_id: 200013,
                    id: 200071
                },
                {
                    
                    display_name: "M??y t??nh b???ng",
                    name: "Tablets",
                    
                    
                    children: [],
                    parent_id: 200013,
                    id: 200072
                },
                {
                    
                    display_name: "??i???n tho???i",
                    name: "Mobile Phones",
                    
                    
                    children: [],
                    parent_id: 200013,
                    id: 200073
                },
                {
                    
                    display_name: "Thi???t b??? ??eo th??ng minh",
                    name: "Wearable Devices",

                    
                    children: [{
                            
                            display_name: "?????ng h??? th??ng minh & V??ng ??eo tay s???c kh???e",
                            name: "Smartwatches & Fitness Trackers",
                            
                            
                            children: [],
                            parent_id: 200074,
                            id: 200270
                        },
                        {
                            
                            display_name: "Thi???t b??? th???c t??? ???o",
                            name: "VR Devices",
                            
                            
                            children: [],
                            parent_id: 200074,
                            id: 200271
                        },
                        {
                            
                            display_name: "Thi???t b??? ?????nh v??? GPS",
                            name: "GPS Trackers",
                            
                            
                            children: [],
                            parent_id: 200074,
                            id: 200272
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ph??? ki???n",
                    name: "Accessories",

                    
                    children: [{
                            
                            display_name: "Ph??? ki???n selfie",
                            name: "Selfie Accessories",
        
                            
                            children: [],
                            parent_id: 200075,
                            id: 200274
                        },
                        {
                            
                            display_name: "???ng k??nh ??i???n tho???i",
                            name: "Mobile Lens",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200275
                        },
                        {
                            
                            display_name: "????n flash ??i???n tho???i & ????n selfie",
                            name: "Mobile Flashes & Selfie Lights",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200276
                        },
                        {
                            
                            display_name: "Qu???t USB & Qu???t ??i???n tho???i",
                            name: "USB & Mobile Fans",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200277
                        },
                        {
                            
                            display_name: "B??t c???m ???ng",
                            name: "Stylus",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200278
                        },
                        {
                            
                            display_name: "K???p ??i???n tho???i",
                            name: "Phone Grips",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200279
                        },
                        {
                            
                            display_name: "D??y ??eo ??i???n tho???i & M??c kh??a",
                            name: "Phone Straps & Keychains",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200280
                        },
                        {
                            
                            display_name: "Th??? nh???",
                            name: "Memory Cards",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200281
                        },
                        {
                            
                            display_name: "Thi???t b??? tr??nh chi???u",
                            name: "Casting Devices",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200282
                        },
                        {
                            
                            display_name: "T??i ?????ng ??i???n tho???i",
                            name: "Mobile Pouches",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200283
                        },
                        {
                            
                            display_name: "C??p, s???c & b??? chuy???n ?????i",
                            name: "Cables, Chargers & Converters",
        
                            
                            children: [],
                            parent_id: 200075,
                            id: 200284
                        },
                        {
                            
                            display_name: "????n USB & ????n ??i???n tho???i",
                            name: "USB & Mobile Lights",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200285
                        },
                        {
                            
                            display_name: "B??? ph??t Wifi b??? t??i",
                            name: "Pocket Wifi",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200286
                        },
                        {
                            
                            display_name: "S???c d??? ph??ng & Pin",
                            name: "Powerbanks & Batteries",
        
                            
                            children: [],
                            parent_id: 200075,
                            id: 200287
                        },
                        {
                            
                            display_name: "Ph??? ki???n cho ?????ng h??? th??ng minh",
                            name: "Wearable Accessories",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200288
                        },
                        {
                            
                            display_name: "Mi???ng d??n m??n h??nh",
                            name: "Screen Protectors",
                            
                            
                            children: [],
                            parent_id: 200075,
                            id: 200289
                        },
                        {
                            
                            display_name: "V??? bao, ???p l??ng & Mi???ng d??n",
                            name: "Cases, Covers, & Skins",
        
                            
                            children: [],
                            parent_id: 200075,
                            id: 200290
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "B??? ????m",
                    name: "Walkie Talkies",
                    
                    
                    children: [],
                    parent_id: 200013,
                    id: 200076
                },
                {
                    
                    display_name: "Kh??c",
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

            display_name: "Du l???ch & H??nh l??",
            name: "Travel & Luggage",

            
            children: [{
                    
                    display_name: "Vali",
                    name: "Luggage",
                    
                    
                    children: [],
                    parent_id: 200015,
                    id: 200085
                },
                {
                    
                    display_name: "T??i du l???ch",
                    name: "Travel Bags",

                    
                    children: [{
                            
                            display_name: "T??i tr???ng",
                            name: "Duffel & Weekender Bags",
                            
                            
                            children: [],
                            parent_id: 200086,
                            id: 200320
                        },
                        {
                            
                            display_name: "T??i g???p g???n",
                            name: "Foldable Bags",
                            
                            
                            children: [],
                            parent_id: 200086,
                            id: 200321
                        },
                        {
                            
                            display_name: "T??i d??y r??t",
                            name: "Drawstring Bags",
                            
                            
                            children: [],
                            parent_id: 200086,
                            id: 200322
                        },
                        {
                            
                            display_name: "T??i kh??c",
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
                    
                    display_name: "Ph??? ki???n du l???ch",
                    name: "Travel Accessories",

                    
                    children: [{
                            
                            display_name: "V?? h??? chi???u",
                            name: "Passport Holders & Covers",
                            
                            
                            children: [],
                            parent_id: 200087,
                            id: 200324
                        },
                        {
                            
                            display_name: "T??i du l???ch nhi???u ng??n",
                            name: "Travel Organizers",
                            
                            
                            children: [],
                            parent_id: 200087,
                            id: 200325
                        },
                        {
                            
                            display_name: "??o tr??m vali",
                            name: "Luggage Protectors & Covers",
                            
                            
                            children: [],
                            parent_id: 200087,
                            id: 200326
                        },
                        {
                            
                            display_name: "Th??? h??nh l??",
                            name: "Luggage Tags",
                            
                            
                            children: [],
                            parent_id: 200087,
                            id: 200327
                        },
                        {
                            
                            display_name: "D??y ??ai vali",
                            name: "Luggage Straps",
                            
                            
                            children: [],
                            parent_id: 200087,
                            id: 200328
                        },
                        {
                            
                            display_name: "Kh??a vali",
                            name: "Luggage Locks",
                            
                            
                            children: [],
                            parent_id: 200087,
                            id: 200329
                        },
                        {
                            
                            display_name: "C??n h??nh l??",
                            name: "Luggage Scales",
                            
                            
                            children: [],
                            parent_id: 200087,
                            id: 200330
                        },
                        {
                            
                            display_name: "G???i & B???t m???t",
                            name: "Travel Pillows & Eye Covers",
                            
                            
                            children: [],
                            parent_id: 200087,
                            id: 200331
                        },
                        {
                            
                            display_name: "B??? chi???t m??? ph???m",
                            name: "Travel Size Bottles & Containers",
                            
                            
                            children: [],
                            parent_id: 200087,
                            id: 200332
                        },
                        {
                            
                            display_name: "Ph??? ki???n kh??c",
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
                    
                    display_name: "Kh??c",
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

            display_name: "T??i V?? N???",
            name: "Women Bags",

            
            children: [{
                    
                    display_name: "Ba l??",
                    name: "Backpacks",
                    
                    
                    children: [],
                    parent_id: 200016,
                    id: 200089
                },
                {
                    
                    display_name: "C???p laptop",
                    name: "Laptop Bags",

                    
                    children: [{
                            
                            display_name: "T??i & c???p ?????ng laptop",
                            name: "Laptop Bags & Cases",
                            
                            
                            children: [],
                            parent_id: 200090,
                            id: 200334
                        },
                        {
                            
                            display_name: "T??i ch???ng s???c laptop",
                            name: "Laptop Sleeves",
                            
                            
                            children: [],
                            parent_id: 200090,
                            id: 200335
                        },
                        {
                            
                            display_name: "Ba l?? laptop",
                            name: "Laptop Backpacks",
                            
                            
                            children: [],
                            parent_id: 200090,
                            id: 200336
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "V?? d??? ti???c & V?? c???m tay",
                    name: "Clutches & Wristlets",
                    
                    
                    children: [],
                    parent_id: 200016,
                    id: 200091
                },
                {
                    
                    display_name: "T??i ??eo h??ng & T??i ??eo ng???c",
                    name: "Waist Bags & Chest Bags",
                    
                    
                    children: [],
                    parent_id: 200016,
                    id: 200092
                },
                {
                    
                    display_name: "T??i tote",
                    name: "Tote Bags",
                    
                    
                    children: [],
                    parent_id: 200016,
                    id: 200093
                },
                {
                    
                    display_name: "T??i quai x??ch",
                    name: "Top-handle Bags",
                    
                    
                    children: [],
                    parent_id: 200016,
                    id: 200094
                },
                {
                    
                    display_name: "T??i ??eo ch??o & T??i ??eo vai",
                    name: "Crossbody & Shoulder Bags",
                    
                    
                    children: [],
                    parent_id: 200016,
                    id: 200095
                },
                {
                    
                    display_name: "V??",
                    name: "Wallets",

                    
                    children: [{
                            
                            display_name: "V?? ?????ng th???",
                            name: "Card Holders",
                            
                            
                            children: [],
                            parent_id: 200096,
                            id: 200338
                        },
                        {
                            
                            display_name: "V?? mini ?????ng ti???n",
                            name: "Coin Holders & Purses",
                            
                            
                            children: [],
                            parent_id: 200096,
                            id: 200339
                        },
                        {
                            
                            display_name: "V?? ?????ng ??i???n tho???i & ch??a kh??a",
                            name: "Phone & Key Wallets",
                            
                            
                            children: [],
                            parent_id: 200096,
                            id: 200340
                        },
                        {
                            
                            display_name: "V?? g???p",
                            name: "Bifold & Trifold Wallets",
                            
                            
                            children: [],
                            parent_id: 200096,
                            id: 200341
                        },
                        {
                            
                            display_name: "V?? d??i",
                            name: "Long Wallets",
                            
                            
                            children: [],
                            parent_id: 200096,
                            id: 200342
                        },
                        {
                            
                            display_name: "V?? kh??c",
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
                    
                    display_name: "Ph??? ki???n t??i",
                    name: "Bag Accessories",

                    
                    children: [{
                            
                            display_name: "D??y ??eo t??i",
                            name: "Bag Straps",
                            
                            
                            children: [],
                            parent_id: 200097,
                            id: 200344
                        },
                        {
                            
                            display_name: "D???ng c??? treo/?????ng t??i",
                            name: "Bag Holders",
                            
                            
                            children: [],
                            parent_id: 200097,
                            id: 200345
                        },
                        {
                            
                            display_name: "Charm v?? ph??? ki???n g???n t??i",
                            name: "Charms & Twillies",
                            
                            
                            children: [],
                            parent_id: 200097,
                            id: 200346
                        },
                        {
                            
                            display_name: "T??i ??a ng??n ti???n ??ch",
                            name: "Bag Organizers",
                            
                            
                            children: [],
                            parent_id: 200097,
                            id: 200347
                        },
                        {
                            
                            display_name: "D???ng c??? v??? sinh v?? ch??m s??c t??i",
                            name: "Cleaning & Care Equipment",
                            
                            
                            children: [],
                            parent_id: 200097,
                            id: 200348
                        },
                        {
                            
                            display_name: "Ph??? ki???n kh??c",
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
                    
                    display_name: "Kh??c",
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

            display_name: "Gi??y D??p N???",
            name: "Women Shoes",

            
            children: [{
                    
                    display_name: "B???t",
                    name: "Boots",

                    
                    children: [{
                            
                            display_name: "B???t ??i m??a",
                            name: "Rain Boots",
                            
                            
                            children: [],
                            parent_id: 200556,
                            id: 200585
                        },
                        {
                            
                            display_name: "B???t th???i trang",
                            name: "Fashion Boots",
                            
                            
                            children: [],
                            parent_id: 200556,
                            id: 200586
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Gi??y th??? thao/ sneaker",
                    name: "Sneakers",
                    
                    
                    children: [],
                    parent_id: 200532,
                    id: 200557
                },
                {
                    
                    display_name: "Gi??y ????? b???ng",
                    name: "Flats",

                    
                    children: [{
                            
                            display_name: "Gi??y bale",
                            name: "Ballet Flats",
                            
                            
                            children: [],
                            parent_id: 200558,
                            id: 200588
                        },
                        {
                            
                            display_name: "Gi??y l?????i",
                            name: "Loafers & Boat Shoes",
                            
                            
                            children: [],
                            parent_id: 200558,
                            id: 200589
                        },
                        {
                            
                            display_name: "Gi??y Oxford & Gi??y bu???c d??y",
                            name: "Oxfords & Lace-Ups",
                            
                            
                            children: [],
                            parent_id: 200558,
                            id: 200590
                        },
                        {
                            
                            display_name: "Gi??y s???c & Gi??y b??p b??",
                            name: "Slip Ons, Mary Janes & Mules",
                            
                            
                            children: [],
                            parent_id: 200558,
                            id: 200591
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Gi??y cao g??t",
                    name: "Heels",
                    
                    
                    children: [],
                    parent_id: 200532,
                    id: 200559
                },
                {
                    
                    display_name: "Gi??y ????? xu???ng",
                    name: "Wedges",
                    
                    
                    children: [],
                    parent_id: 200532,
                    id: 200560
                },
                {
                    
                    display_name: "X??ng-??an v?? d??p",
                    name: "Flat Sandals & Flip Flops",

                    
                    children: [{
                            
                            display_name: "X??ng-??an ????? b???ng",
                            name: "Flat Sandals",
                            
                            
                            children: [],
                            parent_id: 200561,
                            id: 200593
                        },
                        {
                            
                            display_name: "D??p k???p/ d??p x??? ng??n",
                            name: "Flip Flops",
                            
                            
                            children: [],
                            parent_id: 200561,
                            id: 200594
                        },
                        {
                            
                            display_name: "D??p m??t-xa",
                            name: "Health Slippers",
                            
                            
                            children: [],
                            parent_id: 200561,
                            id: 200595
                        },
                        {
                            
                            display_name: "D??p ??i trong nh??",
                            name: "Indoor Slippers",
                            
                            
                            children: [],
                            parent_id: 200561,
                            id: 200596
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ph??? ki???n & ch??m s??c gi??y",
                    name: "Shoe Care & Accessories",

                    
                    children: [{
                            
                            display_name: "????? kh??? m??i gi??y",
                            name: "Shoe Deodorizers",
                            
                            
                            children: [],
                            parent_id: 200562,
                            id: 200598
                        },
                        {
                            
                            display_name: "Mi???ng l??t gi??y",
                            name: "Insoles & Heel Liners",
                            
                            
                            children: [],
                            parent_id: 200562,
                            id: 200599
                        },
                        {
                            
                            display_name: "C??y ????n g??t & Gi??? form gi??y",
                            name: "Shoe Horns & Trees",
                            
                            
                            children: [],
                            parent_id: 200562,
                            id: 200600
                        },
                        {
                            
                            display_name: "????? ch??m s??c v?? l??m s???ch gi??y",
                            name: "Shoe Care & Cleaning Tools",
                            
                            
                            children: [],
                            parent_id: 200562,
                            id: 200601
                        },
                        {
                            
                            display_name: "D??y gi??y",
                            name: "Shoe Laces",
                            
                            
                            children: [],
                            parent_id: 200562,
                            id: 200602
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Kh??c",
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

            display_name: "T??i V?? Nam",
            name: "Men Bags",

            
            children: [{
                    
                    display_name: "Ba l??",
                    name: "Backpacks",
                    
                    
                    children: [],
                    parent_id: 200533,
                    id: 200564
                },
                {
                    
                    display_name: "C???p laptop",
                    name: "Laptop Bags",

                    
                    children: [{
                            
                            display_name: "T??i & c???p ?????ng laptop",
                            name: "Laptop Bags & Cases",
                            
                            
                            children: [],
                            parent_id: 200565,
                            id: 200604
                        },
                        {
                            
                            display_name: "T??i ch???ng s???c laptop",
                            name: "Laptop Sleeves",
                            
                            
                            children: [],
                            parent_id: 200565,
                            id: 200605
                        },
                        {
                            
                            display_name: "Ba l?? laptop",
                            name: "Laptop Backpacks",
                            
                            
                            children: [],
                            parent_id: 200565,
                            id: 200606
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "T??i tote",
                    name: "Tote Bags",
                    
                    
                    children: [],
                    parent_id: 200533,
                    id: 200566
                },
                {
                    
                    display_name: "C???p x??ch c??ng s???",
                    name: "Briefcases",
                    
                    
                    children: [],
                    parent_id: 200533,
                    id: 200567
                },
                {
                    
                    display_name: "V?? c???m tay",
                    name: "Clutches",
                    
                    
                    children: [],
                    parent_id: 200533,
                    id: 200568
                },
                {
                    
                    display_name: "T??i ??eo h??ng & T??i ??eo ng???c",
                    name: "Waist Bags & Chest Bags",
                    
                    
                    children: [],
                    parent_id: 200533,
                    id: 200569
                },
                {
                    
                    display_name: "T??i ??eo ch??o",
                    name: "Crossbody & Shoulder Bags",
                    
                    
                    children: [],
                    parent_id: 200533,
                    id: 200570
                },
                {
                    
                    display_name: "B??p/ V??",
                    name: "Wallets",

                    
                    children: [{
                            
                            display_name: "V?? ?????ng th???",
                            name: "Card Holders",
                            
                            
                            children: [],
                            parent_id: 200571,
                            id: 200608
                        },
                        {
                            
                            display_name: "V?? ?????ng ti???n xu",
                            name: "Coin Holders & Purses",
                            
                            
                            children: [],
                            parent_id: 200571,
                            id: 200609
                        },
                        {
                            
                            display_name: "V?? ?????ng ??i???n tho???i & ch??a kh??a",
                            name: "Phone & Key Wallets",
                            
                            
                            children: [],
                            parent_id: 200571,
                            id: 200610
                        },
                        {
                            
                            display_name: "V?? g???p ????i & g???p ba",
                            name: "Bifold & Trifold Wallets",
                            
                            
                            children: [],
                            parent_id: 200571,
                            id: 200611
                        },
                        {
                            
                            display_name: "V?? d??i",
                            name: "Long Wallets",
                            
                            
                            children: [],
                            parent_id: 200571,
                            id: 200612
                        },
                        {
                            
                            display_name: "V?? kh??c",
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
                    
                    display_name: "Kh??c",
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

            display_name: "?????ng H???",
            name: "Watches",

            
            children: [{
                    
                    display_name: "?????ng h??? n???",
                    name: "Women Watches",
                    
                    
                    children: [],
                    parent_id: 200534,
                    id: 200573
                },
                {
                    
                    display_name: "?????ng h??? nam",
                    name: "Men Watches",
                    
                    
                    children: [],
                    parent_id: 200534,
                    id: 200574
                },
                {
                    
                    display_name: "B??? ?????ng h??? & ?????ng h??? c???p",
                    name: "Set & Couple Watches",
                    
                    
                    children: [],
                    parent_id: 200534,
                    id: 200575
                },
                {
                    
                    display_name: "Ph??? ki???n ?????ng h???",
                    name: "Watches Accessories",

                    
                    children: [{
                            
                            display_name: "D??y ?????ng h???",
                            name: "Straps",
                            
                            
                            children: [],
                            parent_id: 200576,
                            id: 200614
                        },
                        {
                            
                            display_name: "D???ng c??? s???a ch???a",
                            name: "Service Tools",
                            
                            
                            children: [],
                            parent_id: 200576,
                            id: 200615
                        },
                        {
                            
                            display_name: "Kh??a ?????ng h???",
                            name: "Buckles",
                            
                            
                            children: [],
                            parent_id: 200576,
                            id: 200616
                        },
                        {
                            
                            display_name: "Pin ?????ng h???",
                            name: "Batteries",
                            
                            
                            children: [],
                            parent_id: 200576,
                            id: 200617
                        },
                        {
                            
                            display_name: "H???p ?????ng ?????ng h???",
                            name: "Boxes",
                            
                            
                            children: [],
                            parent_id: 200576,
                            id: 200618
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Kh??c",
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

            display_name: "Thi???t B??? ??m Thanh",
            name: "Audio",

            
            children: [{
                    
                    display_name: "Tai nghe nh??t tai & ch???p tai",
                    name: "Earphones, Headphones & Headsets",
                    
                    
                    children: [],
                    parent_id: 200535,
                    id: 200578
                },
                {
                    
                    display_name: "M??y nghe nh???c",
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
                            
                            display_name: "M??y ghi ??m",
                            name: "Voice Recorders",
                            
                            
                            children: [],
                            parent_id: 200579,
                            id: 200622
                        },
                        {
                            
                            display_name: "Radio & C??t-s??t",
                            name: "Radio & Cassette Players",
                            
                            
                            children: [],
                            parent_id: 200579,
                            id: 200623
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Micro thu ??m",
                    name: "Microphones",
                    
                    
                    children: [],
                    parent_id: 200535,
                    id: 200580
                },
                {
                    
                    display_name: "Amply v?? ?????u ch???nh ??m",
                    name: "Amplifiers & Mixers",
                    
                    
                    children: [],
                    parent_id: 200535,
                    id: 200581
                },
                {
                    
                    display_name: "D??n ??m thanh",
                    name: "Home Audio & Speakers",

                    
                    children: [{
                            
                            display_name: "Loa",
                            name: "Speakers",
                            
                            
                            children: [],
                            parent_id: 200582,
                            id: 200625
                        },
                        {
                            
                            display_name: "H??? th???ng ??m thanh gi???i tr?? t???i gia",
                            name: "Home Theater Systems",
                            
                            
                            children: [],
                            parent_id: 200582,
                            id: 200626
                        },
                        {
                            
                            display_name: "Thu s??ng AV",
                            name: "AV Receivers",
                            
                            
                            children: [],
                            parent_id: 200582,
                            id: 200627
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "C??p ??m thanh/ video & ?????u chuy???n",
                    name: "Audio & Video Cables & Converters",
                    
                    
                    children: [],
                    parent_id: 200535,
                    id: 200583
                },
                {
                    
                    display_name: "Kh??c",
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

            display_name: "Th???c ph???m v?? ????? u???ng",
            name: "Food & Beverages",

            
            children: [{
                    
                    display_name: "????? ch??? bi???n s???n",
                    name: "Convenience / Ready-to-eat",

                    
                    children: [{
                            
                            display_name: "????? ??n ch??? bi???n s???n",
                            name: "Cooked Food",
                            
                            
                            children: [],
                            parent_id: 200645,
                            id: 200780
                        },
                        {
                            
                            display_name: "Kh??c",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200645,
                            id: 200781
                        },
                        {
                            
                            display_name: "C??m v?? ch??o ??n li???n",
                            name: "Instant Rice & Porridge",
                            
                            
                            children: [],
                            parent_id: 200645,
                            id: 200782
                        },
                        {
                            
                            display_name: "L???u ??n li???n",
                            name: "Instant Hotpot",
                            
                            
                            children: [],
                            parent_id: 200645,
                            id: 200783
                        },
                        {
                            
                            display_name: "M?? ??n li???n",
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
                    
                    display_name: "????? ??n v???t",
                    name: "Snacks",

                    
                    children: [{
                            
                            display_name: "K???o",
                            name: "Sweets & Candy",
                            
                            
                            children: [],
                            parent_id: 200646,
                            id: 200785
                        },
                        {
                            
                            display_name: "S?? c?? la",
                            name: "Chocolate",
                            
                            
                            children: [],
                            parent_id: 200646,
                            id: 200786
                        },
                        {
                            
                            display_name: "B??nh quy",
                            name: "Biscuits, Cookies & Wafers",
                            
                            
                            children: [],
                            parent_id: 200646,
                            id: 200787
                        },
                        {
                            
                            display_name: "Khoai t??y l??t",
                            name: "Chips & Crisps",
                            
                            
                            children: [],
                            parent_id: 200646,
                            id: 200788
                        },
                        {
                            
                            display_name: "C??c lo???i h???t s???y kh??",
                            name: "Seeds",
                            
                            
                            children: [],
                            parent_id: 200646,
                            id: 200789
                        },
                        {
                            
                            display_name: "B???ng ng??",
                            name: "Popcorn",
                            
                            
                            children: [],
                            parent_id: 200646,
                            id: 200790
                        },
                        {
                            
                            display_name: "C??c lo???i rong bi???n ??n li???n",
                            name: "Seaweed",
                            
                            
                            children: [],
                            parent_id: 200646,
                            id: 200791
                        },
                        {
                            
                            display_name: "C??c lo???i ?????u s???y kh??",
                            name: "Nuts",
                            
                            
                            children: [],
                            parent_id: 200646,
                            id: 200792
                        },
                        {
                            
                            display_name: "Kh??c",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200646,
                            id: 200793
                        },
                        {
                            
                            display_name: "Pudding, th???ch & k???o d???o",
                            name: "Pudding, Jellies & Marshmallow",
                            
                            
                            children: [],
                            parent_id: 200646,
                            id: 200794
                        },
                        {
                            
                            display_name: "Th???c ??n kh??",
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
                    
                    display_name: "Nhu y???u ph???m",
                    name: "Food Staples",

                    
                    children: [{
                            
                            display_name: "Th???c ph???m kh??",
                            name: "Dried Goods",
        
                            
                            children: [],
                            parent_id: 200647,
                            id: 200796
                        },
                        {
                            
                            display_name: "M??",
                            name: "Noodles",
                            
                            
                            children: [],
                            parent_id: 200647,
                            id: 200797
                        },
                        {
                            
                            display_name: "G???o",
                            name: "Rice",
                            
                            
                            children: [],
                            parent_id: 200647,
                            id: 200798
                        },
                        {
                            
                            display_name: "M?? ??",
                            name: "Pasta",
                            
                            
                            children: [],
                            parent_id: 200647,
                            id: 200799
                        },
                        {
                            
                            display_name: "Kh??c",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200647,
                            id: 200800
                        },
                        {
                            
                            display_name: "Th???c ph???m ????ng h???p",
                            name: "Canned Food",
        
                            
                            children: [],
                            parent_id: 200647,
                            id: 200801
                        },
                        {
                            
                            display_name: "Rau c??? ng??m",
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
                    
                    display_name: "Nguy??n li???u n???u ??n",
                    name: "Cooking Essentials",

                    
                    children: [{
                            
                            display_name: "D???u ??n",
                            name: "Oil",
                            
                            
                            children: [],
                            parent_id: 200648,
                            id: 200803
                        },
                        {
                            
                            display_name: "Gia v??? & H????ng li???u",
                            name: "Seasonings & Condiments",
        
                            
                            children: [],
                            parent_id: 200648,
                            id: 200804
                        },
                        {
                            
                            display_name: "???????ng",
                            name: "Sugar",
                            
                            
                            children: [],
                            parent_id: 200648,
                            id: 200805
                        },
                        {
                            
                            display_name: "Ch???t t???o ng???t",
                            name: "Sweetener",
                            
                            
                            children: [],
                            parent_id: 200648,
                            id: 200806
                        },
                        {
                            
                            display_name: "S???t & s??p ??n li???n",
                            name: "Stock, Gravy & Instant Soup",
                            
                            
                            children: [],
                            parent_id: 200648,
                            id: 200807
                        },
                        {
                            
                            display_name: "G??i/ b???t gia v???",
                            name: "Cooking Paste & Kit",
                            
                            
                            children: [],
                            parent_id: 200648,
                            id: 200808
                        },
                        {
                            
                            display_name: "Ph??? gia th???c ph???m",
                            name: "Flavour Enhancers",
                            
                            
                            children: [],
                            parent_id: 200648,
                            id: 200809
                        },
                        {
                            
                            display_name: "B???t ph???",
                            name: "Flour Coating",
                            
                            
                            children: [],
                            parent_id: 200648,
                            id: 200810
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "????? l??m b??nh",
                    name: "Baking Needs",

                    
                    children: [{
                            
                            display_name: "H????ng li???u",
                            name: "Baking Flavoring",
                            
                            
                            children: [],
                            parent_id: 200649,
                            id: 200812
                        },
                        {
                            
                            display_name: "B???t n??? v?? mu???i n???",
                            name: "Baking Powder & Soda",
                            
                            
                            children: [],
                            parent_id: 200649,
                            id: 200813
                        },
                        {
                            
                            display_name: "B???t pha s???n",
                            name: "Baking Premix Flour",
                            
                            
                            children: [],
                            parent_id: 200649,
                            id: 200814
                        },
                        {
                            
                            display_name: "B???t m??",
                            name: "Flour",
                            
                            
                            children: [],
                            parent_id: 200649,
                            id: 200815
                        },
                        {
                            
                            display_name: "Ch???t t???o m??u",
                            name: "Food Coloring",
                            
                            
                            children: [],
                            parent_id: 200649,
                            id: 200816
                        },
                        {
                            
                            display_name: "????? trang tr??",
                            name: "Baking Decoration",
                            
                            
                            children: [],
                            parent_id: 200649,
                            id: 200817
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ng?? c???c & m???t",
                    name: "Breakfast Cereals & Spread",

                    
                    children: [{
                            
                            display_name: "M???t ong v?? siro",
                            name: "Honey & Maple Syrups",
                            
                            
                            children: [],
                            parent_id: 200650,
                            id: 200819
                        },
                        {
                            
                            display_name: "M???t",
                            name: "Jam & Spread",
                            
                            
                            children: [],
                            parent_id: 200650,
                            id: 200820
                        },
                        {
                            
                            display_name: "Ng?? c???c",
                            name: "Cereal, Granola & Oats",
                            
                            
                            children: [],
                            parent_id: 200650,
                            id: 200821
                        },
                        {
                            
                            display_name: "Thanh dinh d?????ng",
                            name: "Breakfast Bar",
                            
                            
                            children: [],
                            parent_id: 200650,
                            id: 200822
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "????? u???ng",
                    name: "Beverages",

                    
                    children: [{
                            
                            display_name: "C?? ph??",
                            name: "Coffee",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200824
                        },
                        {
                            
                            display_name: "Tr?? & tr?? t??i l???c",
                            name: "Tea & Tea Bags",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200825
                        },
                        {
                            
                            display_name: "Th???c u???ng S?? c?? la",
                            name: "Chocolate Drinks",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200826
                        },
                        {
                            
                            display_name: "N?????c t??ng l???c",
                            name: "Energy & Isotonic Drinks",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200827
                        },
                        {
                            
                            display_name: "N?????c tinh khi???t",
                            name: "Water",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200828
                        },
                        {
                            
                            display_name: "N?????c tr??i c??y l??n men",
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
                            
                            display_name: "N?????c c?? ga",
                            name: "Carbonated Drinks & Tonics",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200831
                        },
                        {
                            
                            display_name: "B???t pha",
                            name: "Powdered Drink Mixes",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200832
                        },
                        {
                            
                            display_name: "????? tr??ng mi???ng",
                            name: "Dessert Drink",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200833
                        },
                        {
                            
                            display_name: "Tr?? th???o m???c",
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
                            
                            display_name: "S???a th???c v???t",
                            name: "Non-dairy Milk",
                            
                            
                            children: [],
                            parent_id: 200651,
                            id: 200836
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "S???a - tr???ng",
                    name: "Dairy & Eggs",

                    
                    children: [{
                            
                            display_name: "S???a",
                            name: "Milk",
        
                            
                            children: [],
                            parent_id: 200652,
                            id: 200838
                        },
                        {
                            
                            display_name: "S???a chua",
                            name: "Yogurt & Cultured Milk",
                            
                            
                            children: [],
                            parent_id: 200652,
                            id: 200839
                        },
                        {
                            
                            display_name: "B???t kem b??o",
                            name: "Creamers",
                            
                            
                            children: [],
                            parent_id: 200652,
                            id: 200840
                        },
                        {
                            
                            display_name: "B?? ?????ng v???t & th???c v???t",
                            name: "Butter & Margarine",
                            
                            
                            children: [],
                            parent_id: 200652,
                            id: 200841
                        },
                        {
                            
                            display_name: "Ph?? mai & b???t ph?? mai",
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
                            
                            display_name: "Tr???ng",
                            name: "Eggs",
                            
                            
                            children: [],
                            parent_id: 200652,
                            id: 200844
                        },
                        {
                            
                            display_name: "?????u ph???",
                            name: "Beancurd",
                            
                            
                            children: [],
                            parent_id: 200652,
                            id: 200845
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "C??c lo???i b??nh",
                    name: "Bakery",

                    
                    children: [{
                            
                            display_name: "B??nh m??",
                            name: "Breads",
                            
                            
                            children: [],
                            parent_id: 200654,
                            id: 200856
                        },
                        {
                            
                            display_name: "B??nh kem",
                            name: "Cakes & Pies",
                            
                            
                            children: [],
                            parent_id: 200654,
                            id: 200857
                        },
                        {
                            
                            display_name: "B??nh ng???t/ pastry",
                            name: "Pastry",
                            
                            
                            children: [],
                            parent_id: 200654,
                            id: 200858
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "????? u???ng c?? c???n",
                    name: "Alcoholic Beverages",

                    
                    children: [{
                        region_setting: {
                            low_stock_value: 0,
                            enable_size_chart: false
                        },
                        display_name: "Bia v?? tr??i c??y l??n men",
                        name: "Beer & Cider",
                        
                        
                        children: [],
                        parent_id: 200655,
                        id: 200860
                    }],
                    parent_id: 200629,
                    id: 200655
                },
                {
                    
                    display_name: "B??? qu?? t???ng",
                    name: "Gift Set & Hampers",
                    
                    
                    children: [],
                    parent_id: 200629,
                    id: 200656
                },
                {
                    
                    display_name: "Kh??c",
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

            display_name: "Ch??m S??c Th?? C??ng",
            name: "Pets",

            
            children: [{
                    
                    display_name: "Th???c ??n cho th?? c??ng",
                    name: "Pet Food",

                    
                    children: [{
                            
                            display_name: "Th???c ??n cho ch??",
                            name: "Dog Food",
                            
                            
                            children: [],
                            parent_id: 200667,
                            id: 200906
                        },
                        {
                            
                            display_name: "Snack cho ch??",
                            name: "Dog Treats",
                            
                            
                            children: [],
                            parent_id: 200667,
                            id: 200907
                        },
                        {
                            
                            display_name: "Th???c ??n cho m??o",
                            name: "Cat Food",
                            
                            
                            children: [],
                            parent_id: 200667,
                            id: 200908
                        },
                        {
                            
                            display_name: "Snack cho m??o",
                            name: "Cat Treats",
                            
                            
                            children: [],
                            parent_id: 200667,
                            id: 200909
                        },
                        {
                            
                            display_name: "Th???c ??n cho th?? nh???",
                            name: "Small Pet Food",
                            
                            
                            children: [],
                            parent_id: 200667,
                            id: 200910
                        },
                        {
                            
                            display_name: "Snack cho th?? nh???",
                            name: "Small Pet Treats",
                            
                            
                            children: [],
                            parent_id: 200667,
                            id: 200911
                        },
                        {
                            
                            display_name: "Th???c ??n cho c??",
                            name: "Aquarium Pet Food",
                            
                            
                            children: [],
                            parent_id: 200667,
                            id: 200912
                        },
                        {
                            
                            display_name: "Th???c ??n cho chim",
                            name: "Bird Feed",
                            
                            
                            children: [],
                            parent_id: 200667,
                            id: 200913
                        },
                        {
                            
                            display_name: "Th???c ??n cho b?? s??t",
                            name: "Reptile Food",
                            
                            
                            children: [],
                            parent_id: 200667,
                            id: 200914
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ph??? ki???n cho th?? c??ng",
                    name: "Pet Accessories",

                    
                    children: [{
                            
                            display_name: "B??t & d???ng c??? ??n",
                            name: "Bowls & Feeders",
                            
                            
                            children: [],
                            parent_id: 200668,
                            id: 200916
                        },
                        {
                            
                            display_name: "Thi???t b??? du l???ch",
                            name: "Travel Essentials",
                            
                            
                            children: [],
                            parent_id: 200668,
                            id: 200917
                        },
                        {
                            
                            display_name: "V??ng c???, d??y d???t & r??? m??m",
                            name: "Leashes, Collars, Harnesses & Muzzles",
                            
                            
                            children: [],
                            parent_id: 200668,
                            id: 200918
                        },
                        {
                            
                            display_name: "????? ch??i",
                            name: "Toys",
        
                            
                            children: [],
                            parent_id: 200668,
                            id: 200919
                        },
                        {
                            
                            display_name: "N???i th???t cho th?? c??ng",
                            name: "Pet Furniture",
        
                            
                            children: [],
                            parent_id: 200668,
                            id: 200920
                        },
                        {
                            
                            display_name: "Ph??? ki???n th???y sinh",
                            name: "Aquarium Needs",
                            
                            
                            children: [],
                            parent_id: 200668,
                            id: 200921
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "V??? sinh cho th?? c??ng",
                    name: "Litter & Toilet",

                    
                    children: [{
                            
                            display_name: "Khay & B???n v??? sinh cho m??o",
                            name: "Cat Litter & Boxes",
                            
                            
                            children: [],
                            parent_id: 200669,
                            id: 200923
                        },
                        {
                            
                            display_name: "L??t chu???ng cho th?? nh???",
                            name: "Small Pet Bedding & Litter",
                            
                            
                            children: [],
                            parent_id: 200669,
                            id: 200924
                        },
                        {
                            
                            display_name: "T?? cho th?? c??ng",
                            name: "Diapers",
                            
                            
                            children: [],
                            parent_id: 200669,
                            id: 200925
                        },
                        {
                            
                            display_name: "Khay hu???n luy???n v??? sinh cho ch??",
                            name: "Dog Training Pads & Trays",
                            
                            
                            children: [],
                            parent_id: 200669,
                            id: 200926
                        },
                        {
                            
                            display_name: "T??i & X???ng d???n v??? sinh",
                            name: "Poop Bags & Scoopers",
                            
                            
                            children: [],
                            parent_id: 200669,
                            id: 200927
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "L??m ?????p cho th?? c??ng",
                    name: "Pet Grooming",

                    
                    children: [{
                            
                            display_name: "Ch??m s??c l??ng",
                            name: "Hair Care",
                            
                            
                            children: [],
                            parent_id: 200670,
                            id: 200929
                        },
                        {
                            
                            display_name: "Ch??m s??c r??ng mi???ng",
                            name: "Oral Care",
                            
                            
                            children: [],
                            parent_id: 200670,
                            id: 200930
                        },
                        {
                            
                            display_name: "Ch??m s??c m??ng",
                            name: "Claw Care",
                            
                            
                            children: [],
                            parent_id: 200670,
                            id: 200931
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Qu???n ??o & ph??? ki???n",
                    name: "Pet Clothing & Accessories",

                    
                    children: [{
                            
                            display_name: "Qu???n ??o th?? c??ng",
                            name: "Pet Clothing",
                            
                            
                            children: [],
                            parent_id: 200671,
                            id: 200933
                        },
                        {
                            
                            display_name: "??o m??a ch?? m??o",
                            name: "Wet Weather Gear",
                            
                            
                            children: [],
                            parent_id: 200671,
                            id: 200934
                        },
                        {
                            
                            display_name: "Gi??y, t???t & b???o v??? m??ng",
                            name: "Boots, Socks & Paw Protectors",
                            
                            
                            children: [],
                            parent_id: 200671,
                            id: 200935
                        },
                        {
                            
                            display_name: "Ph??? ki???n ??eo c???",
                            name: "Neck Accessories",
                            
                            
                            children: [],
                            parent_id: 200671,
                            id: 200936
                        },
                        {
                            
                            display_name: "K??nh m???t",
                            name: "Eyewear",
                            
                            
                            children: [],
                            parent_id: 200671,
                            id: 200937
                        },
                        {
                            
                            display_name: "Ph??? ki???n l??ng",
                            name: "Hair Accessories",
                            
                            
                            children: [],
                            parent_id: 200671,
                            id: 200938
                        },
                        {
                            
                            display_name: "M?? n??n th?? c??ng",
                            name: "Hats",
                            
                            
                            children: [],
                            parent_id: 200671,
                            id: 200939
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ch??m s??c s???c kh???e",
                    name: "Pet Healthcare",

                    
                    children: [{
                            
                            display_name: "Kh??c",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200672,
                            id: 200943
                        },
                        {
                            
                            display_name: "Vitamin & ch???t b??? sung dinh d?????ng",
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
                    
                    display_name: "Kh??c",
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

            display_name: "M??? & B??",
            name: "Mom & Baby",

            
            children: [{
                    
                    display_name: "????? d??ng du l???ch cho b??",
                    name: "Baby Travel Essentials",

                    
                    children: [{
                            
                            display_name: "?????u em b??",
                            name: "Baby Carrier",
                            
                            
                            children: [],
                            parent_id: 200674,
                            id: 200945
                        },
                        {
                            
                            display_name: "Xe ?????y",
                            name: "Strollers & Travel Systems",
                            
                            
                            children: [],
                            parent_id: 200674,
                            id: 200946
                        },
                        {
                            
                            display_name: "Ph??? ki???n xe ?????y",
                            name: "Stroller Accessories",
                            
                            
                            children: [],
                            parent_id: 200674,
                            id: 200947
                        },
                        {
                            
                            display_name: "Gh??? ng???i ?? t?? & xe m??y",
                            name: "Car & Motorbike Seats",
                            
                            
                            children: [],
                            parent_id: 200674,
                            id: 200948
                        },
                        {
                            
                            display_name: "Ph??? ki???n gh??? ng???i ?? t?? & xe m??y",
                            name: "Car & Motorbike Seats Accessories",
                            
                            
                            children: [],
                            parent_id: 200674,
                            id: 200949
                        },
                        {
                            
                            display_name: "T??i ?????ng b???m s???a",
                            name: "Diaper Bags",
                            
                            
                            children: [],
                            parent_id: 200674,
                            id: 200950
                        },
                        {
                            
                            display_name: "D??y & ??ai d???t tr???",
                            name: "Child Harnesses & Leashes",
                            
                            
                            children: [],
                            parent_id: 200674,
                            id: 200951
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "????? d??ng ??n d???m cho b??",
                    name: "Feeding Essentials",

                    
                    children: [{
                            
                            display_name: "B??nh s???a",
                            name: "Bottle-feeding",
        
                            
                            children: [],
                            parent_id: 200675,
                            id: 200953
                        },
                        {
                            
                            display_name: "????? d??ng cho con b??",
                            name: "Breastfeeding",
        
                            
                            children: [],
                            parent_id: 200675,
                            id: 200954
                        },
                        {
                            
                            display_name: "Gh??? ??n d???m",
                            name: "Highchairs & Booster Seats",
                            
                            
                            children: [],
                            parent_id: 200675,
                            id: 200955
                        },
                        {
                            
                            display_name: "????? d??ng cho b??",
                            name: "Utensils",
        
                            
                            children: [],
                            parent_id: 200675,
                            id: 200956
                        },
                        {
                            
                            display_name: "Y???m",
                            name: "Bibs",
                            
                            
                            children: [],
                            parent_id: 200675,
                            id: 200957
                        },
                        {
                            
                            display_name: "Ti gi???",
                            name: "Pacifiers",
                            
                            
                            children: [],
                            parent_id: 200675,
                            id: 200958
                        },
                        {
                            
                            display_name: "M??y xay c???t th???c ph???m",
                            name: "Food Processors",
                            
                            
                            children: [],
                            parent_id: 200675,
                            id: 200959
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ph??? ki???n cho m???",
                    name: "Maternity Accessories",

                    
                    children: [{
                            
                            display_name: "??ai h??? tr??? b???ng",
                            name: "Supporting Belts",
                            
                            
                            children: [],
                            parent_id: 200676,
                            id: 200961
                        },
                        {
                            
                            display_name: "G???i b???u",
                            name: "Maternity Pillows",
                            
                            
                            children: [],
                            parent_id: 200676,
                            id: 200962
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ch??m s??c s???c kh???e m???",
                    name: "Maternity Healthcare",

                    
                    children: [{
                            
                            display_name: "S???a b???u",
                            name: "Maternity Milk",
                            
                            
                            children: [],
                            parent_id: 200677,
                            id: 200964
                        },
                        {
                            
                            display_name: "Vitamin & Th???c ph???m b??? sung cho m???",
                            name: "Maternity Vitamins & Supplement",
                            
                            
                            children: [],
                            parent_id: 200677,
                            id: 200965
                        },
                        {
                            
                            display_name: "Kem d?????ng ???m cho m???",
                            name: "Moisturizers & Creams",
                            
                            
                            children: [],
                            parent_id: 200677,
                            id: 200966
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "????? d??ng ph??ng t???m & Ch??m s??c c?? th??? b??",
                    name: "Bath & Body Care",

                    
                    children: [{
                            
                            display_name: "Ch???u t???m & Gh??? t???m",
                            name: "Bathing Tubs & Seats",
                            
                            
                            children: [],
                            parent_id: 200678,
                            id: 200968
                        },
                        {
                            
                            display_name: "??o cho??ng t???m, Kh??n t???m & Kh??n m???t",
                            name: "Bath Robes, Towels & Wash Cloths",
                            
                            
                            children: [],
                            parent_id: 200678,
                            id: 200969
                        },
                        {
                            
                            display_name: "N??n t???m",
                            name: "Shower Caps",
                            
                            
                            children: [],
                            parent_id: 200678,
                            id: 200970
                        },
                        {
                            
                            display_name: "D???ng c??? t???m & Ph??? ki???n",
                            name: "Bathing Tools & Accessories",
                            
                            
                            children: [],
                            parent_id: 200678,
                            id: 200971
                        },
                        {
                            
                            display_name: "S???n ph???m t???m & g???i cho b??",
                            name: "Hair Care & Body Wash",
                            
                            
                            children: [],
                            parent_id: 200678,
                            id: 200972
                        },
                        {
                            
                            display_name: "N?????c hoa cho b??",
                            name: "Baby Colognes & Fragrances",
                            
                            
                            children: [],
                            parent_id: 200678,
                            id: 200973
                        },
                        {
                            
                            display_name: "B??? ch??m s??c tr??? s?? sinh",
                            name: "Baby Grooming Tools",
                            
                            
                            children: [],
                            parent_id: 200678,
                            id: 200974
                        },
                        {
                            
                            display_name: "Kh??n lau",
                            name: "Wipes",
                            
                            
                            children: [],
                            parent_id: 200678,
                            id: 200975
                        },
                        {
                            
                            display_name: "Gi???t x??? qu???n ??o tr??? em",
                            name: "Baby Laundry Detergent",
                            
                            
                            children: [],
                            parent_id: 200678,
                            id: 200976
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "????? d??ng ph??ng ng??? cho b??",
                    name: "Nursery",

                    
                    children: [{
                            
                            display_name: "N??i & C??i & Gi?????ng cho b??",
                            name: "Cribs & Cradles & Beds",
                            
                            
                            children: [],
                            parent_id: 200679,
                            id: 200978
                        },
                        {
                            
                            display_name: "Gh??? rung, Gh??? nh??n & X??ch ??u t???p ??i",
                            name: "Bouncers, Rockers & Jumpers",
                            
                            
                            children: [],
                            parent_id: 200679,
                            id: 200979
                        },
                        {
                            
                            display_name: "Xe t???p ??i",
                            name: "Walkers",
                            
                            
                            children: [],
                            parent_id: 200679,
                            id: 200980
                        },
                        {
                            
                            display_name: "N???m v?? ch??n ga",
                            name: "Mattresses & Bedding",
        
                            
                            children: [],
                            parent_id: 200679,
                            id: 200981
                        },
                        {
                            
                            display_name: "K??? & T???",
                            name: "Storage & Organization",
                            
                            
                            children: [],
                            parent_id: 200679,
                            id: 200982
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "An to??n cho b??",
                    name: "Baby Safety",

                    
                    children: [{
                            
                            display_name: "Thi???t b??? gi??m s??t tr???",
                            name: "Monitors",
                            
                            
                            children: [],
                            parent_id: 200680,
                            id: 200984
                        },
                        {
                            
                            display_name: "M??n ch???ng mu???i",
                            name: "Mosquito Netting",
                            
                            
                            children: [],
                            parent_id: 200680,
                            id: 200985
                        },
                        {
                            
                            display_name: "B??? ?????m c??i, Qu??y c??i & Thanh ch???n gi?????ng",
                            name: "Bumpers, Rails & Guards",
                            
                            
                            children: [],
                            parent_id: 200680,
                            id: 200986
                        },
                        {
                            
                            display_name: "B???c g??c & C???nh",
                            name: "Edge & Corner Guards",
                            
                            
                            children: [],
                            parent_id: 200680,
                            id: 200987
                        },
                        {
                            
                            display_name: "Thanh ch???n c???a & C???u thang",
                            name: "Baby Gates & Doorways",
                            
                            
                            children: [],
                            parent_id: 200680,
                            id: 200988
                        },
                        {
                            
                            display_name: "Kh??a & D??y ??ai an to??n",
                            name: "Safety Locks & Straps",
                            
                            
                            children: [],
                            parent_id: 200680,
                            id: 200989
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "S???a c??ng th???c & Th???c ph???m cho b??",
                    name: "Milk Formula & Baby Food",

                    
                    children: [{
                            
                            display_name: "S???a c??ng th???c",
                            name: "Milk Formula",
                            
                            
                            children: [],
                            parent_id: 200681,
                            id: 200991
                        },
                        {
                            
                            display_name: "Ch??o, Th???c ph???m xay nhuy???n & Ng?? c???c",
                            name: "Baby Porridge, Puree & Cereal",
                            
                            
                            children: [],
                            parent_id: 200681,
                            id: 200992
                        },
                        {
                            
                            display_name: "????? ??n nh??? cho b??",
                            name: "Baby Snack",
                            
                            
                            children: [],
                            parent_id: 200681,
                            id: 200993
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ch??m s??c s???c kh???e b??",
                    name: "Baby Healthcare",

                    
                    children: [{
                            
                            display_name: "Vitamin & Th???c ph???m b??? sung",
                            name: "Baby Vitamins & Supplements",
                            
                            
                            children: [],
                            parent_id: 200682,
                            id: 200995
                        },
                        {
                            
                            display_name: "Ch??m s??c m??i cho b??",
                            name: "Nasal Care",
                            
                            
                            children: [],
                            parent_id: 200682,
                            id: 200996
                        },
                        {
                            
                            display_name: "Ch??m s??c da cho b??",
                            name: "Baby Skincare",
        
                            
                            children: [],
                            parent_id: 200682,
                            id: 200997
                        },
                        {
                            
                            display_name: "Ch??m s??c r??ng mi???ng cho b??",
                            name: "Baby Oral Care",
                            
                            
                            children: [],
                            parent_id: 200682,
                            id: 200998
                        },
                        {
                            
                            display_name: "Ch???ng n???ng cho b??",
                            name: "Sun Care",
                            
                            
                            children: [],
                            parent_id: 200682,
                            id: 200999
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "T?? & b?? em b??",
                    name: "Diapering & Potty",

                    
                    children: [{
                            
                            display_name: "B??? l??t thay t??",
                            name: "Changing Pads & Kits",
                            
                            
                            children: [],
                            parent_id: 200683,
                            id: 201001
                        },
                        {
                            
                            display_name: "B??? thu nh??? b???n c???u & B?? v??? sinh",
                            name: "Potty Training & Commode Chairs",
                            
                            
                            children: [],
                            parent_id: 200683,
                            id: 201002
                        },
                        {
                            
                            display_name: "T?? d??ng m???t l???n",
                            name: "Disposable Diapers",
                            
                            
                            children: [],
                            parent_id: 200683,
                            id: 201003
                        },
                        {
                            
                            display_name: "T?? v???i & Ph??? ki???n",
                            name: "Cloth Diapers & Accessories",
                            
                            
                            children: [],
                            parent_id: 200683,
                            id: 201004
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "????? ch??i",
                    name: "Toys",

                    
                    children: [{
                            
                            display_name: "????? ch??i cho tr??? s?? sinh & tr??? nh???",
                            name: "Baby & Toddler Toys",
        
                            
                            children: [],
                            parent_id: 200684,
                            id: 201006
                        },
                        {
                            
                            display_name: "????? ch??i l???p r??p",
                            name: "Block Toys",
                            
                            
                            children: [],
                            parent_id: 200684,
                            id: 201007
                        },
                        {
                            
                            display_name: "B??p b?? & Th?? nh???i b??ng",
                            name: "Dolls & Stuffed Toys",
        
                            
                            children: [],
                            parent_id: 200684,
                            id: 201008
                        },
                        {
                            
                            display_name: "????? ch??i nh???p vai",
                            name: "Pretend Play",
                            
                            
                            children: [],
                            parent_id: 200684,
                            id: 201009
                        },
                        {
                            
                            display_name: "Xe ????? ch??i",
                            name: "Toy Vehicles",
                            
                            
                            children: [],
                            parent_id: 200684,
                            id: 201010
                        },
                        {
                            
                            display_name: "????? ch??i v???n ?????ng & Ngo??i tr???i",
                            name: "Sports & Outdoor Play",
        
                            
                            children: [],
                            parent_id: 200684,
                            id: 201011
                        },
                        {
                            
                            display_name: "????? ch??i gi??o d???c",
                            name: "Educational Toys",
        
                            
                            children: [],
                            parent_id: 200684,
                            id: 201012
                        },
                        {
                            
                            display_name: "????? ch??i Robot",
                            name: "Robot Toys",
                            
                            
                            children: [],
                            parent_id: 200684,
                            id: 201013
                        },
                        {
                            
                            display_name: "Slime & ????? ch??i nh???a d???o",
                            name: "Slime & Squishy Toys",
                            
                            
                            children: [],
                            parent_id: 200684,
                            id: 201014
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "B??? & G??i qu?? t???ng",
                    name: "Gift Sets & Packages",
                    
                    
                    children: [],
                    parent_id: 200632,
                    id: 200685
                },
                {
                    
                    display_name: "Kh??c",
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

            display_name: "Th???i trang tr??? em & tr??? s?? sinh",
            name: "Baby & Kids Fashion",

            
            children: [{
                    
                    display_name: "Qu???n ??o tr??? em",
                    name: "Baby Clothes",

                    
                    children: [{
                            
                            display_name: "??o kho??c nh???",
                            name: "Regular Outerwear",
                            
                            
                            children: [],
                            parent_id: 200687,
                            id: 201016
                        },
                        {
                            
                            display_name: "??o kho??c m??a ????ng",
                            name: "Winter Outerwear",
                            
                            
                            children: [],
                            parent_id: 200687,
                            id: 201017
                        },
                        {
                            
                            display_name: "V??y",
                            name: "Dresses",
                            
                            
                            children: [],
                            parent_id: 200687,
                            id: 201018
                        },
                        {
                            
                            display_name: "Qu???n/Ch??n v??y",
                            name: "Bottoms",
        
                            
                            children: [],
                            parent_id: 200687,
                            id: 201019
                        },
                        {
                            
                            display_name: "????? ng???",
                            name: "Sleepwear",
                            
                            
                            children: [],
                            parent_id: 200687,
                            id: 201020
                        },
                        {
                            
                            display_name: "??o",
                            name: "Tops",
                            
                            
                            children: [],
                            parent_id: 200687,
                            id: 201021
                        },
                        {
                            
                            display_name: "B??? ????? li???n th??n",
                            name: "Bodysuits & Jumpsuits",
                            
                            
                            children: [],
                            parent_id: 200687,
                            id: 201022
                        },
                        {
                            
                            display_name: "B??? qu???n ??o",
                            name: "Sets",
                            
                            
                            children: [],
                            parent_id: 200687,
                            id: 201023
                        },
                        {
                            
                            display_name: "????? b??i",
                            name: "Swimwear",
                            
                            
                            children: [],
                            parent_id: 200687,
                            id: 201024
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Bao tay tr??? em & T???t",
                    name: "Baby Mittens & Footwear",
                    
                    
                    children: [],
                    parent_id: 200633,
                    id: 200688
                },
                {
                    
                    display_name: "Ph??? ki???n tr??? em & tr??? s?? sinh",
                    name: "Baby & Kids Accessories",

                    
                    children: [{
                            
                            display_name: "T??i x??ch & vali",
                            name: "Bags & Luggage",
        
                            
                            children: [],
                            parent_id: 200689,
                            id: 201026
                        },
                        {
                            
                            display_name: "M?? & m?? l?????i trai",
                            name: "Hats & Caps",
                            
                            
                            children: [],
                            parent_id: 200689,
                            id: 201027
                        },
                        {
                            
                            display_name: "M???t k??nh",
                            name: "Eyewear",
                            
                            
                            children: [],
                            parent_id: 200689,
                            id: 201028
                        },
                        {
                            
                            display_name: "Ph??? ki???n t??c",
                            name: "Hair Accessories",
                            
                            
                            children: [],
                            parent_id: 200689,
                            id: 201029
                        },
                        {
                            
                            display_name: "G??ng tay",
                            name: "Gloves",
                            
                            
                            children: [],
                            parent_id: 200689,
                            id: 201030
                        },
                        {
                            
                            display_name: "Th???t l??ng",
                            name: "Belts",
                            
                            
                            children: [],
                            parent_id: 200689,
                            id: 201031
                        },
                        {
                            
                            display_name: "T???t",
                            name: "Socks",
                            
                            
                            children: [],
                            parent_id: 200689,
                            id: 201032
                        },
                        {
                            
                            display_name: "Kh??n",
                            name: "Scarves",
                            
                            
                            children: [],
                            parent_id: 200689,
                            id: 201033
                        },
                        {
                            
                            display_name: "?????ng h???",
                            name: "Watches",
                            
                            
                            children: [],
                            parent_id: 200689,
                            id: 201034
                        },
                        {
                            
                            display_name: "Trang s???c",
                            name: "Jewelry",
        
                            
                            children: [],
                            parent_id: 200689,
                            id: 201035
                        },
                        {
                            
                            display_name: "????? ??i m??a",
                            name: "Rain Gear",
        
                            
                            children: [],
                            parent_id: 200689,
                            id: 201036
                        },
                        {
                            
                            display_name: "Ch???p tai",
                            name: "Earmuffs",
                            
                            
                            children: [],
                            parent_id: 200689,
                            id: 201037
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Qu???n ??o b?? trai",
                    name: "Boy Clothes",

                    
                    children: [{
                            
                            display_name: "????? h??a trang",
                            name: "Costumes",
                            
                            
                            children: [],
                            parent_id: 200690,
                            id: 201039
                        },
                        {
                            
                            display_name: "????? l??t",
                            name: "Underwear & Innerwear",
                            
                            
                            children: [],
                            parent_id: 200690,
                            id: 201040
                        },
                        {
                            
                            display_name: "????? ng???",
                            name: "Sleepwear",
                            
                            
                            children: [],
                            parent_id: 200690,
                            id: 201041
                        },
                        {
                            
                            display_name: "????? b??i",
                            name: "Swimwear",
                            
                            
                            children: [],
                            parent_id: 200690,
                            id: 201042
                        },
                        {
                            
                            display_name: "??o",
                            name: "Tops",
        
                            
                            children: [],
                            parent_id: 200690,
                            id: 201043
                        },
                        {
                            
                            display_name: "??o kho??c",
                            name: "Outerwear",
        
                            
                            children: [],
                            parent_id: 200690,
                            id: 201044
                        },
                        {
                            
                            display_name: "Qu???n",
                            name: "Bottoms",
        
                            
                            children: [],
                            parent_id: 200690,
                            id: 201045
                        },
                        {
                            
                            display_name: "Com l?? & ????? b???",
                            name: "Suits & Sets",
                            
                            
                            children: [],
                            parent_id: 200690,
                            id: 201046
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Qu???n ??o b?? g??i",
                    name: "Girl Clothes",

                    
                    children: [{
                            
                            display_name: "????? h??a trang",
                            name: "Costumes",
                            
                            
                            children: [],
                            parent_id: 200691,
                            id: 201048
                        },
                        {
                            
                            display_name: "????? l??t",
                            name: "Underwear & Innerwear",
                            
                            
                            children: [],
                            parent_id: 200691,
                            id: 201049
                        },
                        {
                            
                            display_name: "????? ng???",
                            name: "Sleepwear",
                            
                            
                            children: [],
                            parent_id: 200691,
                            id: 201050
                        },
                        {
                            
                            display_name: "????? b??i",
                            name: "Swimwear",
                            
                            
                            children: [],
                            parent_id: 200691,
                            id: 201051
                        },
                        {
                            
                            display_name: "??o",
                            name: "Tops",
        
                            
                            children: [],
                            parent_id: 200691,
                            id: 201052
                        },
                        {
                            
                            display_name: "??o kho??c",
                            name: "Outerwear",
        
                            
                            children: [],
                            parent_id: 200691,
                            id: 201053
                        },
                        {
                            
                            display_name: "Qu???n",
                            name: "Bottoms",
        
                            
                            children: [],
                            parent_id: 200691,
                            id: 201054
                        },
                        {
                            
                            display_name: "????? li???n th??n",
                            name: "Rompers, Jumpsuits & Overalls",
                            
                            
                            children: [],
                            parent_id: 200691,
                            id: 201055
                        },
                        {
                            
                            display_name: "V??y",
                            name: "Dresses",
                            
                            
                            children: [],
                            parent_id: 200691,
                            id: 201056
                        },
                        {
                            
                            display_name: "Com l?? & ????? b???",
                            name: "Suits & Sets",
                            
                            
                            children: [],
                            parent_id: 200691,
                            id: 201057
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Gi??y b?? trai",
                    name: "Boy Shoes",

                    
                    children: [{
                            
                            display_name: "B???t",
                            name: "Boots",
                            
                            
                            children: [],
                            parent_id: 200692,
                            id: 201059
                        },
                        {
                            
                            display_name: "D??p quai h???u",
                            name: "Sandals",
                            
                            
                            children: [],
                            parent_id: 200692,
                            id: 201060
                        },
                        {
                            
                            display_name: "Gi??y th??? thao",
                            name: "Sneakers",
                            
                            
                            children: [],
                            parent_id: 200692,
                            id: 201061
                        },
                        {
                            
                            display_name: "D??p l??",
                            name: "Flip Flops",
                            
                            
                            children: [],
                            parent_id: 200692,
                            id: 201062
                        },
                        {
                            
                            display_name: "Gi??y t??y",
                            name: "Formal Shoes",
                            
                            
                            children: [],
                            parent_id: 200692,
                            id: 201063
                        },
                        {
                            
                            display_name: "Gi??y l?????i",
                            name: "Loafers",
                            
                            
                            children: [],
                            parent_id: 200692,
                            id: 201064
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Gi??y b?? g??i",
                    name: "Girl Shoes",

                    
                    children: [{
                            
                            display_name: "B???t",
                            name: "Boots",
                            
                            
                            children: [],
                            parent_id: 200693,
                            id: 201066
                        },
                        {
                            
                            display_name: "D??p quai h???u",
                            name: "Sandals",
                            
                            
                            children: [],
                            parent_id: 200693,
                            id: 201067
                        },
                        {
                            
                            display_name: "Gi??y th??? thao",
                            name: "Sneakers",
                            
                            
                            children: [],
                            parent_id: 200693,
                            id: 201068
                        },
                        {
                            
                            display_name: "Gi??y l?????i",
                            name: "Loafers",
                            
                            
                            children: [],
                            parent_id: 200693,
                            id: 201069
                        },
                        {
                            
                            display_name: "D??p l??",
                            name: "Flip Flops",
                            
                            
                            children: [],
                            parent_id: 200693,
                            id: 201070
                        },
                        {
                            
                            display_name: "Gi??y b???t",
                            name: "Flats",
                            
                            
                            children: [],
                            parent_id: 200693,
                            id: 201071
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Kh??c",
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
                    
                    display_name: "M??y ch??i game",
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
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ph??? ki???n console",
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
                            
                            display_name: "Game M??y Kh??c",
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
                    
                    display_name: "Kh??c",
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
                    
                    display_name: "M??y ???nh",
                    name: "Cameras",

                    
                    children: [{
                            
                            display_name: "M??y ???nh k??? thu???t s???",
                            name: "Point & Shoot",
                            
                            
                            children: [],
                            parent_id: 200699,
                            id: 201092
                        },
                        {
                            
                            display_name: "M??y ???nh kh??ng g????ng l???t",
                            name: "Mirrorless Cameras",
                            
                            
                            children: [],
                            parent_id: 200699,
                            id: 201093
                        },
                        {
                            
                            display_name: "M??y quay h??nh ?????ng",
                            name: "Action Cameras",
                            
                            
                            children: [],
                            parent_id: 200699,
                            id: 201094
                        },
                        {
                            
                            display_name: "M??y quay phim",
                            name: "Video Camcorders",
                            
                            
                            children: [],
                            parent_id: 200699,
                            id: 201095
                        },
                        {
                            
                            display_name: "M??y ???nh ch???p l???y li???n",
                            name: "Instant Cameras",
                            
                            
                            children: [],
                            parent_id: 200699,
                            id: 201096
                        },
                        {
                            
                            display_name: "M??y ???nh film",
                            name: "Analog Cameras",
                            
                            
                            children: [],
                            parent_id: 200699,
                            id: 201097
                        },
                        {
                            
                            display_name: "M??y ???nh c??/DSLRs",
                            name: "DSLRs",
                            
                            
                            children: [],
                            parent_id: 200699,
                            id: 201098
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Camera gi??m s??t",
                    name: "Security Cameras & Systems",

                    
                    children: [{
                            
                            display_name: "Camera gi??m s??t k???t n???i internet",
                            name: "CCTV Security Cameras",
                            
                            
                            children: [],
                            parent_id: 200700,
                            id: 201100
                        },
                        {
                            
                            display_name: "?????u ghi h??nh",
                            name: "DVRs",
                            
                            
                            children: [],
                            parent_id: 200700,
                            id: 201101
                        },
                        {
                            
                            display_name: "Camera gi??? ch???ng tr???m",
                            name: "Dummy Cameras",
                            
                            
                            children: [],
                            parent_id: 200700,
                            id: 201102
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "???ng k??nh",
                    name: "Lenses",
                    
                    
                    children: [],
                    parent_id: 200635,
                    id: 200701
                },
                {
                    
                    display_name: "Ph??? ki???n ???ng k??nh",
                    name: "Lens Accessories",

                    
                    children: [{
                            
                            display_name: "Ng??m ???ng k??nh & Ng??m chuy???n ?????i ???ng",
                            name: "Lens Mount & Adaptors",
                            
                            
                            children: [],
                            parent_id: 200702,
                            id: 201105
                        },
                        {
                            
                            display_name: "N???p ???ng k??nh",
                            name: "Lens Caps",
                            
                            
                            children: [],
                            parent_id: 200702,
                            id: 201106
                        },
                        {
                            
                            display_name: "K??nh l???c",
                            name: "Filters",
                            
                            
                            children: [],
                            parent_id: 200702,
                            id: 201107
                        },
                        {
                            
                            display_name: "Loa che s??ng ???ng k??nh",
                            name: "Lens Hoods",
                            
                            
                            children: [],
                            parent_id: 200702,
                            id: 201108
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ph??? ki???n m??y ???nh",
                    name: "Camera Accessories",

                    
                    children: [{
                            
                            display_name: "????n Flash",
                            name: "Flashes",
                            
                            
                            children: [],
                            parent_id: 200703,
                            id: 201110
                        },
                        {
                            
                            display_name: "Ph??? ki???n ????n Flash",
                            name: "Flash Accessories",
        
                            
                            children: [],
                            parent_id: 200703,
                            id: 201111
                        },
                        {
                            
                            display_name: "Tay c???m ch???ng rung",
                            name: "Gimbals & Stabilizers",
                            
                            
                            children: [],
                            parent_id: 200703,
                            id: 201112
                        },
                        {
                            
                            display_name: "Thi???t b??? ??nh s??ng v?? ph??ng ch???p",
                            name: "Lighting & Studio Equipments",
                            
                            
                            children: [],
                            parent_id: 200703,
                            id: 201113
                        },
                        {
                            
                            display_name: "Gi???y & phim in ???nh",
                            name: "Photo Films & Papers",
                            
                            
                            children: [],
                            parent_id: 200703,
                            id: 201114
                        },
                        {
                            
                            display_name: "M??y in ???nh",
                            name: "Photo Printers",
                            
                            
                            children: [],
                            parent_id: 200703,
                            id: 201115
                        },
                        {
                            
                            display_name: "T??i ?????ng m??y ???nh",
                            name: "Camera Cases & Bags",
                            
                            
                            children: [],
                            parent_id: 200703,
                            id: 201116
                        },
                        {
                            
                            display_name: "B??? s???c pin",
                            name: "Battery Chargers",
                            
                            
                            children: [],
                            parent_id: 200703,
                            id: 201117
                        },
                        {
                            
                            display_name: "????? pin",
                            name: "Batteries & Battery Grips",
                            
                            
                            children: [],
                            parent_id: 200703,
                            id: 201118
                        },
                        {
                            
                            display_name: "Ch??n m??y ???nh",
                            name: "Tripods, Monopods, & Accessories",
                            
                            
                            children: [],
                            parent_id: 200703,
                            id: 201119
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ph??? ki???n ch??m s??c m??y ???nh",
                    name: "Camera Care",

                    
                    children: [{
                            
                            display_name: "T??? & h???p ch???ng ???m",
                            name: "Dry Boxes & Cabinets",
                            
                            
                            children: [],
                            parent_id: 200704,
                            id: 201121
                        },
                        {
                            
                            display_name: "B??? v??? sinh m??y ???nh",
                            name: "Cleaning Kit",
                            
                            
                            children: [],
                            parent_id: 200704,
                            id: 201122
                        },
                        {
                            
                            display_name: "G??i h??t ???m",
                            name: "Silica Gel",
                            
                            
                            children: [],
                            parent_id: 200704,
                            id: 201123
                        },
                        {
                            
                            display_name: "B??ng th???i b???i",
                            name: "Blowers",
                            
                            
                            children: [],
                            parent_id: 200704,
                            id: 201124
                        },
                        {
                            
                            display_name: "B??t lau & b??n ch???i l??m s???ch ???ng k??nh",
                            name: "Lenspens & Brushes",
                            
                            
                            children: [],
                            parent_id: 200704,
                            id: 201125
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ph??? ki???n Flycam",
                    name: "Drone Accessories",
                    
                    
                    children: [],
                    parent_id: 200635,
                    id: 200706
                },
                {
                    
                    display_name: "Kh??c",
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

            display_name: "Nh?? c???a & ?????i s???ng",
            name: "Home & Living",

            
            children: [{
                    
                    display_name: "Ch???t kh??? m??i, l??m th??m nh??",
                    name: "Home Fragrance & Aromatherapy",

                    
                    children: [{
                            
                            display_name: "Ch???t kh??? m??i, l??m th??m",
                            name: "Air Fresheners & Home Fragrance",
                            
                            
                            children: [],
                            parent_id: 200708,
                            id: 201127
                        },
                        {
                            
                            display_name: "Tinh d???u th??m",
                            name: "Essential Oils",
                            
                            
                            children: [],
                            parent_id: 200708,
                            id: 201128
                        },
                        {
                            
                            display_name: "M??y khu???ch t??n, t???o ???m & x??ng tinh d???u",
                            name: "Diffusers, Humidifiers & Oil Burners",
                            
                            
                            children: [],
                            parent_id: 200708,
                            id: 201129
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "????? d??ng ph??ng t???m",
                    name: "Bathrooms",

                    
                    children: [{
                            
                            display_name: "B???n c???u, gh??? v?? n???p b???n c???u",
                            name: "Toilet Bowls, Seats & Covers",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201131
                        },
                        {
                            
                            display_name: "K??? ?????ng b??n ch???i, k??? nh??? kem ????nh r??ng",
                            name: "Toothbrush Holders & Toothpaste Dispensers",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201132
                        },
                        {
                            
                            display_name: "K??? ?????ng x?? ph??ng",
                            name: "Soap Dispensers, Holders & Boxes",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201133
                        },
                        {
                            
                            display_name: "K??? ????? ????? ph??ng t???m",
                            name: "Bathroom Racks & Cabinets",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201134
                        },
                        {
                            
                            display_name: "B???n t???m",
                            name: "Bathtubs",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201135
                        },
                        {
                            
                            display_name: "Kh??n m???t, kh??n t???m, ??o cho??ng t???m",
                            name: "Towels & Bathrobes",
        
                            
                            children: [],
                            parent_id: 200709,
                            id: 201136
                        },
                        {
                            
                            display_name: "V??i sen & v??i x???t v??? sinh",
                            name: "Showerheads & Bidet Sprays",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201137
                        },
                        {
                            
                            display_name: "B??ng t???m",
                            name: "Bath Brushes & Loofahs",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201138
                        },
                        {
                            
                            display_name: "R??m c???a nh?? t???m",
                            name: "Shower Curtains",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201139
                        },
                        {
                            
                            display_name: "Gh??? nh?? t???m, gh??? ch???ng tr?????t",
                            name: "Shower Seats & Commodes",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201140
                        },
                        {
                            
                            display_name: "Tay c???m an to??n",
                            name: "Safety Handles",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201141
                        },
                        {
                            
                            display_name: "M?? t???m",
                            name: "Shower Caps",
                            
                            
                            children: [],
                            parent_id: 200709,
                            id: 201142
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ch??n ga g???i n???m",
                    name: "Bedding",

                    
                    children: [{
                            
                            display_name: "Chi???u ??i???u h??a",
                            name: "Cooling Mats",
                            
                            
                            children: [],
                            parent_id: 200710,
                            id: 201144
                        },
                        {
                            
                            display_name: "T???m b???o v??? n???m, topper",
                            name: "Mattress Protectors & Toppers",
                            
                            
                            children: [],
                            parent_id: 200710,
                            id: 201145
                        },
                        {
                            
                            display_name: "Ch??n, m???n",
                            name: "Blankets, Comforters & Quilts",
                            
                            
                            children: [],
                            parent_id: 200710,
                            id: 201146
                        },
                        {
                            
                            display_name: "G???i",
                            name: "Pillows",
                            
                            
                            children: [],
                            parent_id: 200710,
                            id: 201147
                        },
                        {
                            
                            display_name: "Ga tr???i gi?????ng, v??? g???i",
                            name: "Bedsheets, Pillowcases & Bolster Cases",
                            
                            
                            children: [],
                            parent_id: 200710,
                            id: 201148
                        },
                        {
                            
                            display_name: "N???m",
                            name: "Mattresses",
                            
                            
                            children: [],
                            parent_id: 200710,
                            id: 201149
                        },
                        {
                            
                            display_name: "M??ng/ M??n ch???ng mu???i",
                            name: "Mosquito Nets",
                            
                            
                            children: [],
                            parent_id: 200710,
                            id: 201150
                        },
                        {
                            
                            display_name: "G???i ??m",
                            name: "Bolsters",
                            
                            
                            children: [],
                            parent_id: 200710,
                            id: 201151
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Trang tr?? nh?? c???a",
                    name: "Decoration",

                    
                    children: [{
                            
                            display_name: "Hoa trang tr??",
                            name: "Flowers",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201153
                        },
                        {
                            
                            display_name: "V??? b???c n???i th???t",
                            name: "Furniture & Appliance Covers",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201154
                        },
                        {
                            
                            display_name: "R??m c???a, m??n che",
                            name: "Curtains & Blinds",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201155
                        },
                        {
                            
                            display_name: "Khung ???nh & v???t trang tr?? t?????ng",
                            name: "Photo Frames & Wall Decoration",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201156
                        },
                        {
                            
                            display_name: "Decal, tranh d??n t?????ng",
                            name: "Wallpapers & Wall Stickers",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201157
                        },
                        {
                            
                            display_name: "?????ng h???",
                            name: "Clocks",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201158
                        },
                        {
                            
                            display_name: "Th???m ch??i ch??n",
                            name: "Floor Mats",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201159
                        },
                        {
                            
                            display_name: "Th???m tr???i s??n",
                            name: "Carpets & Rugs",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201160
                        },
                        {
                            
                            display_name: "B??nh trang tr??",
                            name: "Vases & Vessels",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201161
                        },
                        {
                            
                            display_name: "N???n & ????? ?????ng n???n",
                            name: "Candles & Candleholders",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201162
                        },
                        {
                            
                            display_name: "G????ng",
                            name: "Mirrors",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201163
                        },
                        {
                            
                            display_name: "Kh??n tr???i b??n",
                            name: "Table Cloths",
                            
                            
                            children: [],
                            parent_id: 200711,
                            id: 201164
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "T??i l??m ???m",
                    name: "Hand Warmers, Hot Water Bags & Ice Bags",
                    
                    
                    children: [],
                    parent_id: 200636,
                    id: 200712
                },
                {
                    
                    display_name: "N???i th???t",
                    name: "Furniture",

                    
                    children: [{
                            
                            display_name: "?????m ng???i",
                            name: "Cushions",
                            
                            
                            children: [],
                            parent_id: 200713,
                            id: 201166
                        },
                        {
                            
                            display_name: "Mi???ng ch???n c???a",
                            name: "Doorstoppers",
                            
                            
                            children: [],
                            parent_id: 200713,
                            id: 201167
                        },
                        {
                            
                            display_name: "Gi?????ng, khung gi?????ng",
                            name: "Bed Frames & Headboards",
                            
                            
                            children: [],
                            parent_id: 200713,
                            id: 201168
                        },
                        {
                            
                            display_name: "B??n",
                            name: "Desks & Tables",
                            
                            
                            children: [],
                            parent_id: 200713,
                            id: 201169
                        },
                        {
                            
                            display_name: "T??? qu???n ??o",
                            name: "Wardrobes",
                            
                            
                            children: [],
                            parent_id: 200713,
                            id: 201170
                        },
                        {
                            
                            display_name: "Gh???, gh??? d??i, gh??? ?????u",
                            name: "Benches, Chairs & Stools",
                            
                            
                            children: [],
                            parent_id: 200713,
                            id: 201171
                        },
                        {
                            
                            display_name: "Gh??? sofa",
                            name: "Sofas",
                            
                            
                            children: [],
                            parent_id: 200713,
                            id: 201172
                        },
                        {
                            
                            display_name: "T??? b???p",
                            name: "Cupboards & Cabinets",
                            
                            
                            children: [],
                            parent_id: 200713,
                            id: 201173
                        },
                        {
                            
                            display_name: "K??? & Gi??",
                            name: "Shelves & Racks",
                            
                            
                            children: [],
                            parent_id: 200713,
                            id: 201174
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "L??m v?????n",
                    name: "Gardening",

                    
                    children: [{
                            
                            display_name: "C??y c???nh",
                            name: "Plants",
                            
                            
                            children: [],
                            parent_id: 200714,
                            id: 201176
                        },
                        {
                            
                            display_name: "Trang tr?? v?????n",
                            name: "Garden Decorations",
                            
                            
                            children: [],
                            parent_id: 200714,
                            id: 201177
                        },
                        {
                            
                            display_name: "?????t tr???ng",
                            name: "Garden Soils & Growing Media",
                            
                            
                            children: [],
                            parent_id: 200714,
                            id: 201178
                        },
                        {
                            
                            display_name: "Ph??n b??n",
                            name: "Fertilizer",
                            
                            
                            children: [],
                            parent_id: 200714,
                            id: 201179
                        },
                        {
                            
                            display_name: "H???t gi???ng & ch???t h??? tr??? tr???ng c??y",
                            name: "Seeds & Bulbs",
                            
                            
                            children: [],
                            parent_id: 200714,
                            id: 201180
                        },
                        {
                            
                            display_name: "Ch???u c??y",
                            name: "Pots & Planters",
                            
                            
                            children: [],
                            parent_id: 200714,
                            id: 201181
                        },
                        {
                            
                            display_name: "H??? th???ng t?????i n?????c",
                            name: "Irrigation Systems",
                            
                            
                            children: [],
                            parent_id: 200714,
                            id: 201182
                        },
                        {
                            
                            display_name: "D???ng c??? l??m v?????n",
                            name: "Gardening Tools",
                            
                            
                            children: [],
                            parent_id: 200714,
                            id: 201183
                        },
                        {
                            
                            display_name: "Kh??c",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200714,
                            id: 201184
                        },
                        {
                            
                            display_name: "M??y c???t c???, d???ng c??? c???t c???",
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
                    
                    display_name: "D???ng c??? & Thi???t b??? ti???n ??ch",
                    name: "Tools & Home Improvement",

                    
                    children: [{
                            
                            display_name: "Keo & ch???t k???t ch??nh c??ng nghi???p",
                            name: "Industrial Adhesives & Tapes",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201186
                        },
                        {
                            
                            display_name: "G??ng tay, k??nh b???o h??? & m???t n???",
                            name: "Protective Gloves, Goggles & Masks",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201187
                        },
                        {
                            
                            display_name: "Ch???u r???a & v??i n?????c",
                            name: "Sinks & Water Taps",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201188
                        },
                        {
                            
                            display_name: "M??i & s??n",
                            name: "Roofing & Flooring",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201189
                        },
                        {
                            
                            display_name: "S??n & ch???t ch???ng th???m t?????ng",
                            name: "Wall Paints & Coatings",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201190
                        },
                        {
                            
                            display_name: "D???ng c???",
                            name: "Tools",
        
                            
                            children: [],
                            parent_id: 200715,
                            id: 201191
                        },
                        {
                            
                            display_name: "M??y b??m n?????c & ph??? ki???n",
                            name: "Water Pumps, Parts & Accessories",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201192
                        },
                        {
                            
                            display_name: "M??y b??m kh?? & ph??? ki???n",
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
                            
                            display_name: "Xe ?????y",
                            name: "Trollies",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201195
                        },
                        {
                            
                            display_name: "M??i hi??n, b???t ph???",
                            name: "Shades, Awnings & Tarpaulins",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201196
                        },
                        {
                            
                            display_name: "V???t li???u x??y d???ng",
                            name: "Construction Materials",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201197
                        },
                        {
                            
                            display_name: "C???a & c???a s???",
                            name: "Doors & Windows",
                            
                            
                            children: [],
                            parent_id: 200715,
                            id: 201198
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "D???ng c??? ch??m s??c nh?? c???a",
                    name: "Home Care Supplies",

                    
                    children: [{
                            
                            display_name: "D??y ph??i & gi?? ph??i qu???n ??o",
                            name: "Clotheslines & Drying Racks",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201200
                        },
                        {
                            
                            display_name: "B??n ch???i v??? sinh",
                            name: "Cleaning Brushes",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201201
                        },
                        {
                            
                            display_name: "Ch???i",
                            name: "Brooms",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201202
                        },
                        {
                            
                            display_name: "Ch???i ph???i b???i",
                            name: "Dusters",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201203
                        },
                        {
                            
                            display_name: "C??y lau nh??",
                            name: "Mops",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201204
                        },
                        {
                            
                            display_name: "Ch???u, x?? & g??o n?????c",
                            name: "Basins, Buckets & Water Dippers",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201205
                        },
                        {
                            
                            display_name: "Mi???ng b???t bi???n, mi???ng ch?? v??? sinh",
                            name: "Sponges & Scouring Pads",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201206
                        },
                        {
                            
                            display_name: "Th??ng r??c",
                            name: "Trash & Recycling Bins",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201207
                        },
                        {
                            
                            display_name: "T??i nilon & t??i r??c",
                            name: "Plastic Bags & Trash Bags",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201208
                        },
                        {
                            
                            display_name: "Kh??n v??? sinh",
                            name: "Cleaning Cloths",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201209
                        },
                        {
                            
                            display_name: "Thu???c v?? d???ng c??? di???t c??n tr??ng",
                            name: "Pest & Weed Control",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201210
                        },
                        {
                            
                            display_name: "Kh??n gi???y, gi???y ?????t",
                            name: "Tissue & Paper Towels",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201211
                        },
                        {
                            
                            display_name: "Gi???y v??? sinh",
                            name: "Toilet Paper",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201212
                        },
                        {
                            
                            display_name: "Ch???t t???y r???a",
                            name: "Cleaning Agents",
                            
                            
                            children: [],
                            parent_id: 200716,
                            id: 201213
                        },
                        {
                            
                            display_name: "Ph??? ki???n gi???t l??",
                            name: "Laundry Care",
        
                            
                            children: [],
                            parent_id: 200716,
                            id: 201214
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "D???ng c??? nh?? b???p",
                    name: "Kitchenware",

                    
                    children: [{
                            
                            display_name: "L?? n?????ng & ph??? ki???n",
                            name: "Grills & Accessories",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201216
                        },
                        {
                            
                            display_name: "D???ng c??? n?????ng & trang tr?? b??nh",
                            name: "Bakewares & Decorations",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201217
                        },
                        {
                            
                            display_name: "Ch???o",
                            name: "Pans",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201218
                        },
                        {
                            
                            display_name: "N???i",
                            name: "Pots",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201219
                        },
                        {
                            
                            display_name: "H???p ?????ng th???c ph???m",
                            name: "Food Storage",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201220
                        },
                        {
                            
                            display_name: "M??ng b???c th???c ph???m",
                            name: "Cling Wrap",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201221
                        },
                        {
                            
                            display_name: "Gi???y b???c",
                            name: "Aluminium Foil",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201222
                        },
                        {
                            
                            display_name: "D???ng c??? pha tr??, c?? ph??",
                            name: "Tea, Coffee & Bartending Equipments",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201223
                        },
                        {
                            
                            display_name: "K??? ????? ????? nh?? b???p",
                            name: "Kitchen Racks",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201224
                        },
                        {
                            
                            display_name: "T???p d??? & g???ng tay n???u n?????ng",
                            name: "Aprons & Kitchen Gloves",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201225
                        },
                        {
                            
                            display_name: "C??y v??t b???t & ????? g???p th???c ??n",
                            name: "Spatulas & Cooking Tweezers",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201226
                        },
                        {
                            
                            display_name: "Th???t",
                            name: "Chopping Boards",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201227
                        },
                        {
                            
                            display_name: "Dao & k??o",
                            name: "Knives & Kitchen Scissors",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201228
                        },
                        {
                            
                            display_name: "Ph???i ????nh tr???ng",
                            name: "Whisks & Beaters",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201229
                        },
                        {
                            
                            display_name: "D???ng c??? m??? h???p",
                            name: "Can & Bottle Openers",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201230
                        },
                        {
                            
                            display_name: "D???ng c??? ??o l?????ng",
                            name: "Measuring Glasses & Spoons",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201231
                        },
                        {
                            
                            display_name: "D???ng c??? l???c",
                            name: "Strainers",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201232
                        },
                        {
                            
                            display_name: "B??n n???o, d???ng c??? b??o, c???t",
                            name: "Graters, Peelers & Cutters",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201233
                        },
                        {
                            
                            display_name: "C??n nh?? b???p",
                            name: "Kitchen Weighing Scales",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201234
                        },
                        {
                            
                            display_name: "D???ng c??? h??t ch??n kh??ng",
                            name: "Sealers",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201235
                        },
                        {
                            
                            display_name: "B???t l???a, di??m v?? m???i l???a",
                            name: "Lighters, Matches & Fire Starters",
                            
                            
                            children: [],
                            parent_id: 200717,
                            id: 201236
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "B??? ????? b??n ??n",
                    name: "Dinnerware",

                    
                    children: [{
                            
                            display_name: "B??nh n?????c",
                            name: "Jugs, Pitchers & Accessories",
                            
                            
                            children: [],
                            parent_id: 200718,
                            id: 201238
                        },
                        {
                            
                            display_name: "B??? ???m tr??",
                            name: "Tea Pots & Sets",
                            
                            
                            children: [],
                            parent_id: 200718,
                            id: 201239
                        },
                        {
                            
                            display_name: "C???c, ly, t??ch u???ng n?????c",
                            name: "Cups, Mugs & Glasses",
                            
                            
                            children: [],
                            parent_id: 200718,
                            id: 201240
                        },
                        {
                            
                            display_name: "B??nh n?????c & ph??? ki???n",
                            name: "Water Bottles & Accessories",
                            
                            
                            children: [],
                            parent_id: 200718,
                            id: 201241
                        },
                        {
                            
                            display_name: "T??",
                            name: "Bowls",
                            
                            
                            children: [],
                            parent_id: 200718,
                            id: 201242
                        },
                        {
                            
                            display_name: "D??a",
                            name: "Plates",
                            
                            
                            children: [],
                            parent_id: 200718,
                            id: 201243
                        },
                        {
                            
                            display_name: "B??? dao k??o",
                            name: "Cutleries",
                            
                            
                            children: [],
                            parent_id: 200718,
                            id: 201244
                        },
                        {
                            
                            display_name: "???ng h??t",
                            name: "Straws",
                            
                            
                            children: [],
                            parent_id: 200718,
                            id: 201245
                        },
                        {
                            
                            display_name: "L???ng b??n",
                            name: "Food Covers",
                            
                            
                            children: [],
                            parent_id: 200718,
                            id: 201246
                        },
                        {
                            
                            display_name: "Khay, t???m l??t b??n ??n",
                            name: "Placemats & Coasters",
                            
                            
                            children: [],
                            parent_id: 200718,
                            id: 201247
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "????n",
                    name: "Lighting",
                    
                    
                    children: [],
                    parent_id: 200636,
                    id: 200719
                },
                {
                    
                    display_name: "B???o h??? gia ????nh",
                    name: "Safety & Security",

                    
                    children: [{
                            
                            display_name: "K??t s???t",
                            name: "Safes",
                            
                            
                            children: [],
                            parent_id: 200720,
                            id: 201249
                        },
                        {
                            
                            display_name: "Thi???t b??? ch???a ch??y",
                            name: "Fire Fighting Equipments",
                            
                            
                            children: [],
                            parent_id: 200720,
                            id: 201250
                        },
                        {
                            
                            display_name: "Kh??a, ??? kh??a",
                            name: "Door Hardware & Locks",
                            
                            
                            children: [],
                            parent_id: 200720,
                            id: 201251
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "S???p x???p nh?? c???a",
                    name: "Home Organizers",

                    
                    children: [{
                            
                            display_name: "M???c ??o",
                            name: "Hangers & Pegs",
                            
                            
                            children: [],
                            parent_id: 200721,
                            id: 201253
                        },
                        {
                            
                            display_name: "H???p ?????ng, gi??? ?????ng ?????",
                            name: "Storage Boxes, Bags & Baskets",
                            
                            
                            children: [],
                            parent_id: 200721,
                            id: 201254
                        },
                        {
                            
                            display_name: "K??? gi??y, h???p gi??y",
                            name: "Shoe Storage Boxes",
                            
                            
                            children: [],
                            parent_id: 200721,
                            id: 201255
                        },
                        {
                            
                            display_name: "M??c treo",
                            name: "Hooks",
                            
                            
                            children: [],
                            parent_id: 200721,
                            id: 201256
                        },
                        {
                            
                            display_name: "T??i gi???t, gi??? ?????ng qu???n ??o",
                            name: "Laundry Bags & Baskets",
                            
                            
                            children: [],
                            parent_id: 200721,
                            id: 201257
                        },
                        {
                            
                            display_name: "K??? s??ch ????? b??n",
                            name: "Desk Organizers",
                            
                            
                            children: [],
                            parent_id: 200721,
                            id: 201258
                        },
                        {
                            
                            display_name: "S???p x???p t??? qu???n ??o",
                            name: "Wardrobe Organizers",
                            
                            
                            children: [],
                            parent_id: 200721,
                            id: 201259
                        },
                        {
                            
                            display_name: "H???p ?????ng trang s???c",
                            name: "Jewelry Organizers",
                            
                            
                            children: [],
                            parent_id: 200721,
                            id: 201260
                        },
                        {
                            
                            display_name: "H???p kh??n gi???y",
                            name: "Tissue Holders",
                            
                            
                            children: [],
                            parent_id: 200721,
                            id: 201261
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Trang tr?? ti???c t??ng",
                    name: "Party Supplies",

                    
                    children: [{
                            
                            display_name: "Bong b??ng",
                            name: "Balloons",
                            
                            
                            children: [],
                            parent_id: 200722,
                            id: 201263
                        },
                        {
                            
                            display_name: "K???p g???",
                            name: "Wooden Clips",
                            
                            
                            children: [],
                            parent_id: 200722,
                            id: 201264
                        },
                        {
                            
                            display_name: "Ph??ng n???n, bi???u ng???",
                            name: "Backdrops & Banners",
                            
                            
                            children: [],
                            parent_id: 200722,
                            id: 201265
                        },
                        {
                            
                            display_name: "Thi???p",
                            name: "Cards",
                            
                            
                            children: [],
                            parent_id: 200722,
                            id: 201266
                        },
                        {
                            
                            display_name: "Ch??n, ????a d??ng m???t l???n",
                            name: "Disposable Tableware",
                            
                            
                            children: [],
                            parent_id: 200722,
                            id: 201267
                        },
                        {
                            
                            display_name: "M??, m???t n??? d??? ti???c",
                            name: "Party Hats & Masks",
                            
                            
                            children: [],
                            parent_id: 200722,
                            id: 201268
                        },
                        {
                            
                            display_name: "B??ng ??eo ch??o",
                            name: "Sashes",
                            
                            
                            children: [],
                            parent_id: 200722,
                            id: 201269
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "????? th??? c??ng, ????? phong th???y",
                    name: "Fengshui & Religious Supplies",
                    
                    
                    children: [],
                    parent_id: 200636,
                    id: 200723
                },
                {
                    
                    display_name: "Kh??c",
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

            display_name: "Th??? Thao & D?? Ngo???i",
            name: "Sports & Outdoors",

            
            children: [{
                    
                    display_name: "D???ng C??? Th??? Thao & D?? Ngo???i",
                    name: "Sports & Outdoor Recreation Equipments",

                    
                    children: [{
                            
                            display_name: "C??u C??",
                            name: "Fishing",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201271
                        },
                        {
                            
                            display_name: "?????p Xe",
                            name: "Cycling",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201272
                        },
                        {
                            
                            display_name: "C???m Tr???i & D?? ngo???i",
                            name: "Camping & Hiking",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201273
                        },
                        {
                            
                            display_name: "Leo N??i",
                            name: "Rock Climbing",
                            
                            
                            children: [],
                            parent_id: 200725,
                            id: 201274
                        },
                        {
                            
                            display_name: "Th??? Thao V??n Tr?????t",
                            name: "Boardsports",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201275
                        },
                        {
                            
                            display_name: "B??ng ????, Futsal & C???u M??y",
                            name: "Soccer, Futsal & Sepak Takraw",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201277
                        },
                        {
                            
                            display_name: "B??ng R???",
                            name: "Basketball",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201278
                        },
                        {
                            
                            display_name: "B??ng Chuy???n",
                            name: "Volleyball",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201279
                        },
                        {
                            
                            display_name: "C???u L??ng",
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
                            
                            display_name: "B??ng B??n",
                            name: "Table Tennis",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201282
                        },
                        {
                            
                            display_name: "?????m b???c & V?? T???ng H???p",
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
                            
                            display_name: "B??ng Ch??y & B??ng N??m",
                            name: "Baseball & Softball",
                            
                            
                            children: [],
                            parent_id: 200725,
                            id: 201285
                        },
                        {
                            
                            display_name: "B??ng Qu???n",
                            name: "Squash",
                            
                            
                            children: [],
                            parent_id: 200725,
                            id: 201286
                        },
                        {
                            
                            display_name: "B???n S??ng & Game Sinh T???n",
                            name: "Shooting & Survival Games",
                            
                            
                            children: [],
                            parent_id: 200725,
                            id: 201287
                        },
                        {
                            
                            display_name: "B??ng B???u D???c",
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
                            
                            display_name: "L?????t V??n",
                            name: "Surfing & Wakeboarding",
                            
                            
                            children: [],
                            parent_id: 200725,
                            id: 201290
                        },
                        {
                            
                            display_name: "Tr?????t Tuy???t & Th??? Thao M??a ????ng",
                            name: "Ice Skating & Winter Sports",
                            
                            
                            children: [],
                            parent_id: 200725,
                            id: 201291
                        },
                        {
                            
                            display_name: "B??i L???i & L???n",
                            name: "Swimming & Diving",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201292
                        },
                        {
                            
                            display_name: "Ch??o Thuy???n",
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
                            
                            display_name: "Thi???t B??? Th??? Thao",
                            name: "Fitness Equipment",
        
                            
                            children: [],
                            parent_id: 200725,
                            id: 201295
                        },
                        {
                            
                            display_name: "N??m Phi Ti??u",
                            name: "Darts",
                            
                            
                            children: [],
                            parent_id: 200725,
                            id: 201296
                        },
                        {
                            
                            display_name: "M??n Th??? Thao Kh??c",
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
                    
                    display_name: "Gi??y Th??? Thao",
                    name: "Sports Footwear",

                    
                    children: [{
                            
                            display_name: "Gi??y B??ng R???",
                            name: "Basketball Shoes",
                            
                            
                            children: [],
                            parent_id: 200726,
                            id: 201298
                        },
                        {
                            
                            display_name: "Gi??y Ch???y B???",
                            name: "Running Shoes",
                            
                            
                            children: [],
                            parent_id: 200726,
                            id: 201299
                        },
                        {
                            
                            display_name: "Gi??y T???p Luy???n",
                            name: "Training Shoes",
                            
                            
                            children: [],
                            parent_id: 200726,
                            id: 201300
                        },
                        {
                            
                            display_name: "Gi??y Tennis",
                            name: "Tennis Shoes",
                            
                            
                            children: [],
                            parent_id: 200726,
                            id: 201301
                        },
                        {
                            
                            display_name: "Gi??y B??ng Chuy???n",
                            name: "Volleyball Shoes",
                            
                            
                            children: [],
                            parent_id: 200726,
                            id: 201302
                        },
                        {
                            
                            display_name: "Gi??y C???u L??ng",
                            name: "Badminton Shoes",
                            
                            
                            children: [],
                            parent_id: 200726,
                            id: 201303
                        },
                        {
                            
                            display_name: "Gi??y Futsal",
                            name: "Futsal Shoes",
                            
                            
                            children: [],
                            parent_id: 200726,
                            id: 201304
                        },
                        {
                            
                            display_name: "Gi??y D?? Ngo???i",
                            name: "Hiking Shoes",
                            
                            
                            children: [],
                            parent_id: 200726,
                            id: 201305
                        },
                        {
                            
                            display_name: "Gi??y B??ng ????",
                            name: "Soccer Shoes",
                            
                            
                            children: [],
                            parent_id: 200726,
                            id: 201306
                        },
                        {
                            
                            display_name: "Gi??y Th??? Thao Tr??? Em",
                            name: "Kid's Sport Shoes",
                            
                            
                            children: [],
                            parent_id: 200726,
                            id: 201307
                        },
                        {
                            
                            display_name: "Gi??y Th??? Thao Kh??c",
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
                    
                    display_name: "Th???i Trang Th??? Thao & D?? Ngo???i",
                    name: "Sports & Outdoor Apparels",

                    
                    children: [{
                            
                            display_name: "B??? ????? Th??? Thao",
                            name: "Sets",
                            
                            
                            children: [],
                            parent_id: 200727,
                            id: 201309
                        },
                        {
                            
                            display_name: "??o Kho??c",
                            name: "Jackets",
                            
                            
                            children: [],
                            parent_id: 200727,
                            id: 201310
                        },
                        {
                            
                            display_name: "??o Th??? Thao",
                            name: "T-shirts",
                            
                            
                            children: [],
                            parent_id: 200727,
                            id: 201311
                        },
                        {
                            
                            display_name: "??o CLB",
                            name: "Jerseys",
                            
                            
                            children: [],
                            parent_id: 200727,
                            id: 201312
                        },
                        {
                            
                            display_name: "Qu???n Th??? Thao",
                            name: "Bottoms",
                            
                            
                            children: [],
                            parent_id: 200727,
                            id: 201313
                        },
                        {
                            
                            display_name: "????? B??i",
                            name: "Swimming Attire",
        
                            
                            children: [],
                            parent_id: 200727,
                            id: 201314
                        },
                        {
                            
                            display_name: "??o L??t Th??? Thao",
                            name: "Sports Bras",
                            
                            
                            children: [],
                            parent_id: 200727,
                            id: 201315
                        },
                        {
                            
                            display_name: "Th???i Trang Th??? Thao Tr??? Em",
                            name: "Kid's Sports Apparel",
                            
                            
                            children: [],
                            parent_id: 200727,
                            id: 201316
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ph??? Ki???n Th??? Thao & D?? Ngo???i",
                    name: "Sports & Outdoor Accessories",

                    
                    children: [{
                            
                            display_name: "?????ng H??? B???m Gi??y & M??y ?????m B?????c Ch??n",
                            name: "Stopwatches & Pedometers",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201318
                        },
                        {
                            
                            display_name: "T??i ?????ng Gi??y",
                            name: "Shoe Bags",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201319
                        },
                        {
                            
                            display_name: "V??ng Tay Th??? Thao",
                            name: "Sports Wristbands",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201320
                        },
                        {
                            
                            display_name: "B??ng ???? Th??? Thao",
                            name: "Sports Headbands",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201321
                        },
                        {
                            
                            display_name: "M?? Th??? Thao & D?? Ngo???i",
                            name: "Sports & Outdoor Hats",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201322
                        },
                        {
                            
                            display_name: "T??i Ch???ng Th???m",
                            name: "Dry Bags",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201323
                        },
                        {
                            
                            display_name: "??o M??a",
                            name: "Rain Coats",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201324
                        },
                        {
                            
                            display_name: "??/D??",
                            name: "Umbrellas",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201325
                        },
                        {
                            
                            display_name: "D???ng C??? B???o V??? Mi???ng & B??ng Keo Th??? Thao",
                            name: "Mouthguards & Sport Tapes",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201326
                        },
                        {
                            
                            display_name: "Ph??? Ki???n T???p Luy???n",
                            name: "Training Equipments",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201327
                        },
                        {
                            
                            display_name: "????? B???o H??? Gym",
                            name: "Gym Protective Gears",
                            
                            
                            children: [],
                            parent_id: 200728,
                            id: 201328
                        },
                        {
                            
                            display_name: "Ph??? Ki???n Kh??c",
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
                    
                    display_name: "Kh??c",
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

            display_name: "V??n Ph??ng Ph???m",
            name: "Stationery",

            
            children: [{
                    
                    display_name: "Qu?? T???ng - Gi???y G??i",
                    name: "Gift & Wrapping",

                    
                    children: [{
                            
                            display_name: "Gi???y G??i Qu??",
                            name: "Gift Wrappers",
                            
                            
                            children: [],
                            parent_id: 200730,
                            id: 201330
                        },
                        {
                            
                            display_name: "H???p Qu?? T???ng",
                            name: "Gift Boxes",
                            
                            
                            children: [],
                            parent_id: 200730,
                            id: 201331
                        },
                        {
                            
                            display_name: "T??i Qu?? T???ng",
                            name: "Gift Bags",
                            
                            
                            children: [],
                            parent_id: 200730,
                            id: 201332
                        },
                        {
                            
                            display_name: "Ruy B??ng",
                            name: "Ribbons",
                            
                            
                            children: [],
                            parent_id: 200730,
                            id: 201333
                        },
                        {
                            
                            display_name: "X???p Ch???ng S???c",
                            name: "Bubble Wraps",
                            
                            
                            children: [],
                            parent_id: 200730,
                            id: 201334
                        },
                        {
                            
                            display_name: "H???p Carton",
                            name: "Carton Boxes",
                            
                            
                            children: [],
                            parent_id: 200730,
                            id: 201335
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "B??t C??c Lo???i",
                    name: "Writing & Correction",

                    
                    children: [{
                            
                            display_name: "B??t & M???c",
                            name: "Pens & Inks",
                            
                            
                            children: [],
                            parent_id: 200731,
                            id: 201337
                        },
                        {
                            
                            display_name: "B??t Ch??",
                            name: "Pencils",
                            
                            
                            children: [],
                            parent_id: 200731,
                            id: 201338
                        },
                        {
                            
                            display_name: "D???ng C??? T???y Xo??",
                            name: "Eraser & Correction Supplies",
                            
                            
                            children: [],
                            parent_id: 200731,
                            id: 201339
                        },
                        {
                            
                            display_name: "B??t L??ng M??u",
                            name: "Markers",
                            
                            
                            children: [],
                            parent_id: 200731,
                            id: 201340
                        },
                        {
                            
                            display_name: "B??t D??? Quang",
                            name: "Highlighters",
                            
                            
                            children: [],
                            parent_id: 200731,
                            id: 201341
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Thi???t B??? Tr?????ng H???c",
                    name: "School & Office Equipment",

                    
                    children: [{
                            
                            display_name: "B???ng Vi???t & Gi?? Treo B???ng",
                            name: "Writing Boards & Board Stands",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201343
                        },
                        {
                            
                            display_name: "M??y t??nh c???m tay",
                            name: "Calculators",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201344
                        },
                        {
                            
                            display_name: "Dao R???c Gi???y & M??y C???t Gi???y",
                            name: "Pen Knives & Paper Cutters",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201345
                        },
                        {
                            
                            display_name: "D??y & B??ng Keo D??n",
                            name: "Strings & Tapes",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201346
                        },
                        {
                            
                            display_name: "H??? D??n",
                            name: "Glues",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201347
                        },
                        {
                            
                            display_name: "M??y In Nh??n",
                            name: "Label Printers",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201348
                        },
                        {
                            
                            display_name: "D??y ??eo Th??? & Th??? T??n",
                            name: "Lanyards & Name Tags",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201349
                        },
                        {
                            
                            display_name: "K???p & Ghim B???m",
                            name: "Clips, Pins & Tacks",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201350
                        },
                        {
                            
                            display_name: "M??y ?????c L???",
                            name: "Hole Punchers",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201351
                        },
                        {
                            
                            display_name: "K??o",
                            name: "Scissors",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201352
                        },
                        {
                            
                            display_name: "M???c ????ng D???u",
                            name: "Ink Stamps & Pads",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201353
                        },
                        {
                            
                            display_name: "????? B???m Kim v?? Kim B???m",
                            name: "Staplers & Staples",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201354
                        },
                        {
                            
                            display_name: "L???ch",
                            name: "Calendars",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201355
                        },
                        {
                            
                            display_name: "D???ng C??? L??u Tr??? Gi???y T???",
                            name: "Folders, Paper Organizers & Accessories",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201356
                        },
                        {
                            
                            display_name: "Th?????c C??c Lo???i & Gi???y N???n",
                            name: "Rulers, Protractors & Stencils",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201357
                        },
                        {
                            
                            display_name: "G???t b??t ch??",
                            name: "Sharpeners",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201358
                        },
                        {
                            
                            display_name: "H???p B??t",
                            name: "Pencil Cases",
                            
                            
                            children: [],
                            parent_id: 200732,
                            id: 201359
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ho??? C???",
                    name: "Art Supplies",

                    
                    children: [{
                            
                            display_name: "B??t Ch?? M??u",
                            name: "Color Pencils",
                            
                            
                            children: [],
                            parent_id: 200733,
                            id: 201361
                        },
                        {
                            
                            display_name: "B??t M??u & Ph???n M??u",
                            name: "Crayons & Pastels",
                            
                            
                            children: [],
                            parent_id: 200733,
                            id: 201362
                        },
                        {
                            
                            display_name: "M??u N?????c",
                            name: "Water & Poster Colours",
                            
                            
                            children: [],
                            parent_id: 200733,
                            id: 201363
                        },
                        {
                            
                            display_name: "S??n D???u",
                            name: "Oil Paint",
                            
                            
                            children: [],
                            parent_id: 200733,
                            id: 201364
                        },
                        {
                            
                            display_name: "S??n Acrylic",
                            name: "Acrylic Paint",
                            
                            
                            children: [],
                            parent_id: 200733,
                            id: 201365
                        },
                        {
                            
                            display_name: "C??? V???",
                            name: "Paint Brushes",
                            
                            
                            children: [],
                            parent_id: 200733,
                            id: 201366
                        },
                        {
                            
                            display_name: "B???ng M??u",
                            name: "Paint Palettes",
                            
                            
                            children: [],
                            parent_id: 200733,
                            id: 201367
                        },
                        {
                            
                            display_name: "V???i & Gi?? V???",
                            name: "Canvases & Easels",
                            
                            
                            children: [],
                            parent_id: 200733,
                            id: 201368
                        },
                        {
                            
                            display_name: "S??? v??? ph??c th???o",
                            name: "Sketch Books",
                            
                            
                            children: [],
                            parent_id: 200733,
                            id: 201369
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "S??? & Gi???y C??c Lo???i",
                    name: "Notebooks & Papers",

                    
                    children: [{
                            
                            display_name: "????nh D???u Trang",
                            name: "Bookmarks",
                            
                            
                            children: [],
                            parent_id: 200734,
                            id: 201371
                        },
                        {
                            
                            display_name: "B???c S??ch",
                            name: "Book Covers",
                            
                            
                            children: [],
                            parent_id: 200734,
                            id: 201372
                        },
                        {
                            
                            display_name: "Gi???y Nhi???t",
                            name: "Thermal Paper & Continuous Paper",
                            
                            
                            children: [],
                            parent_id: 200734,
                            id: 201373
                        },
                        {
                            
                            display_name: "Gi???y In",
                            name: "Printing & Photocopy Paper",
                            
                            
                            children: [],
                            parent_id: 200734,
                            id: 201374
                        },
                        {
                            
                            display_name: "Ru???t S???",
                            name: "Loose Leaf",
                            
                            
                            children: [],
                            parent_id: 200734,
                            id: 201375
                        },
                        {
                            
                            display_name: "Gi???y Ghi Ch??",
                            name: "Memo & Sticky Notes",
                            
                            
                            children: [],
                            parent_id: 200734,
                            id: 201376
                        },
                        {
                            
                            display_name: "Gi???y M??? Thu???t",
                            name: "Art Paper & Boards",
                            
                            
                            children: [],
                            parent_id: 200734,
                            id: 201377
                        },
                        {
                            
                            display_name: "T???p, V??? C??c Lo???i",
                            name: "Notebooks & Notepads",
                            
                            
                            children: [],
                            parent_id: 200734,
                            id: 201378
                        },
                        {
                            
                            display_name: "Nh??n D??n C??c Lo???i",
                            name: "Labels & Stickers",
                            
                            
                            children: [],
                            parent_id: 200734,
                            id: 201379
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Th?? T??n",
                    name: "Letters & Envelopes",

                    
                    children: [{
                            
                            display_name: "Phong B?? & Bao L?? X??",
                            name: "Envelopes & Angpao",
                            
                            
                            children: [],
                            parent_id: 200735,
                            id: 201381
                        },
                        {
                            
                            display_name: "B??u Thi???p",
                            name: "Post Cards",
                            
                            
                            children: [],
                            parent_id: 200735,
                            id: 201382
                        },
                        {
                            
                            display_name: "Tem C??c Lo???i",
                            name: "Postage Stamps & Duty Stamps",
                            
                            
                            children: [],
                            parent_id: 200735,
                            id: 201383
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Kh??c",
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

            display_name: "S??? th??ch & S??u t???m",
            name: "Hobbies & Collections",

            
            children: [{
                    
                    display_name: "????? S??u T???m",
                    name: "Collectible Items",

                    
                    children: [{
                            
                            display_name: "M?? h??nh nh??n v???t",
                            name: "Action Figurines",
                            
                            
                            children: [],
                            parent_id: 200737,
                            id: 201385
                        },
                        {
                            
                            display_name: "T?????ng t??nh",
                            name: "Statues & Sculptures",
                            
                            
                            children: [],
                            parent_id: 200737,
                            id: 201386
                        },
                        {
                            
                            display_name: "M?? h??nh mecha/gundam",
                            name: "Mecha Models & Diecast",
                            
                            
                            children: [],
                            parent_id: 200737,
                            id: 201387
                        },
                        {
                            
                            display_name: "M?? h??nh xe",
                            name: "Vehicle Models & Diecast",
                            
                            
                            children: [],
                            parent_id: 200737,
                            id: 201388
                        },
                        {
                            
                            display_name: "B??? s??u t???p nh??n v???t n???i ti???ng",
                            name: "Idol Collectibles",
                            
                            
                            children: [],
                            parent_id: 200737,
                            id: 201390
                        },
                        {
                            
                            display_name: "B??? s??u t???p th??? thao",
                            name: "Sports Collectibles",
                            
                            
                            children: [],
                            parent_id: 200737,
                            id: 201391
                        },
                        {
                            
                            display_name: "B??? s??u t???p ho???t h??nh truy???n tranh",
                            name: "Anime & Manga Collectibles",
                            
                            
                            children: [],
                            parent_id: 200737,
                            id: 201392
                        },
                        {
                            
                            display_name: "Ti???n xu & ti???n gi???y s??u t???m",
                            name: "Coins",
                            
                            
                            children: [],
                            parent_id: 200737,
                            id: 201393
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Qu?? L??u Ni???m",
                    name: "Souvenirs",

                    
                    children: [{
                            
                            display_name: "Qu???t C???m Tay",
                            name: "Hand Fans",
                            
                            
                            children: [],
                            parent_id: 200738,
                            id: 201395
                        },
                        {
                            
                            display_name: "M??c Kho??",
                            name: "Keychains",
                            
                            
                            children: [],
                            parent_id: 200738,
                            id: 201396
                        },
                        {
                            
                            display_name: "???ng ti???t ki???m",
                            name: "Coin Banks",
                            
                            
                            children: [],
                            parent_id: 200738,
                            id: 201397
                        },
                        {
                            
                            display_name: "Nam Ch??m",
                            name: "Fridge Magnets",
                            
                            
                            children: [],
                            parent_id: 200738,
                            id: 201398
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "????? ch??i - Gi???i tr??",
                    name: "Toys & Games",

                    
                    children: [{
                            
                            display_name: "????? ch??i th??? b??i & boardgame",
                            name: "Dice, Board & Card Games",
                            
                            
                            children: [],
                            parent_id: 200739,
                            id: 201400
                        },
                        {
                            
                            display_name: "????? ch??i ???o thu???t",
                            name: "Magic Toys",
                            
                            
                            children: [],
                            parent_id: 200739,
                            id: 201401
                        },
                        {
                            
                            display_name: "????? ch??i ch???c gh???o",
                            name: "Prank Toys",
                            
                            
                            children: [],
                            parent_id: 200739,
                            id: 201402
                        },
                        {
                            
                            display_name: "????? ch??i rubik",
                            name: "Rubik's Cubes",
                            
                            
                            children: [],
                            parent_id: 200739,
                            id: 201403
                        },
                        {
                            
                            display_name: "????? ch??i con xoay",
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
                            
                            display_name: "????? ch??i ??i???u khi???n t??? xa",
                            name: "Remote Control Toys & Accessories",
                            
                            
                            children: [],
                            parent_id: 200739,
                            id: 201407
                        },
                        {
                            
                            display_name: "????? ch??i tr???ng",
                            name: "Capsule Toys",
                            
                            
                            children: [],
                            parent_id: 200739,
                            id: 201408
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "B??ng - ????a",
                    name: "CD, DVD & Bluray",
                    
                    
                    children: [],
                    parent_id: 200639,
                    id: 200740
                },
                {
                    
                    display_name: "Nh???c C??? & Ph??? Ki???n",
                    name: "Musical Instruments & Accessories",

                    
                    children: [{
                            
                            display_name: "????n Piano & Organ",
                            name: "Keyboards & Pianos",
                            
                            
                            children: [],
                            parent_id: 200741,
                            id: 201410
                        },
                        {
                            
                            display_name: "Nh???c C??? G??",
                            name: "Percussion Instruments",
                            
                            
                            children: [],
                            parent_id: 200741,
                            id: 201411
                        },
                        {
                            
                            display_name: "S??o, k??n",
                            name: "Wind Instruments",
                            
                            
                            children: [],
                            parent_id: 200741,
                            id: 201412
                        },
                        {
                            
                            display_name: "Ph??? Ki???n ??m Nh???c",
                            name: "Music Accessories",
                            
                            
                            children: [],
                            parent_id: 200741,
                            id: 201413
                        },
                        {
                            
                            display_name: "Kh??c",
                            name: "Others",
                            
                            
                            children: [],
                            parent_id: 200741,
                            id: 201414
                        },
                        {
                            
                            display_name: "Nh???c C??? D??y",
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
                    
                    display_name: "????a Than",
                    name: "Vinyl Records",
                    
                    
                    children: [],
                    parent_id: 200639,
                    id: 200742
                },
                {
                    
                    display_name: "Album ???nh",
                    name: "Photo Albums",
                    
                    
                    children: [],
                    parent_id: 200639,
                    id: 200743
                },
                {
                    
                    display_name: "D???ng C??? May V??",
                    name: "Needlework",
                    
                    
                    children: [],
                    parent_id: 200639,
                    id: 200744
                },
                {
                    
                    display_name: "Kh??c",
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

            display_name: "?? t??",
            name: "Automobiles",

            
            children: [{
                    
                    display_name: "Ph??? ki???n n???i th???t ?? t??",
                    name: "Automobile Interior Accessories",

                    
                    children: [{
                            
                            display_name: "Thi???t b??? ?????nh v??? v?? H??? th???ng h??nh ???nh/??m thanh",
                            name: "Navigation & AV Receivers",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201415
                        },
                        {
                            
                            display_name: "H??? th???ng loa",
                            name: "Amplifiers, Speakers & Subwoofers",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201416
                        },
                        {
                            
                            display_name: "D???ng c??? ch???a",
                            name: "Organizers & Compartments",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201417
                        },
                        {
                            
                            display_name: "N?????c hoa, N?????c hoa kh??? m??i, Thi???t b??? l???c kh??ng kh??",
                            name: "Perfumes, Air Fresheners & Purifiers",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201418
                        },
                        {
                            
                            display_name: "Th???m & ?????m l??t",
                            name: "Carpets & Mats",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201419
                        },
                        {
                            
                            display_name: "G???i t???a ?????u & l??ng",
                            name: "Seat Headrests & Back Supports",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201420
                        },
                        {
                            
                            display_name: "N???m gi?????ng ?? t??",
                            name: "Car Mattresses",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201421
                        },
                        {
                            
                            display_name: "V?? l??ng & B???c v?? l??ng",
                            name: "Steering Wheels & Covers",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201422
                        },
                        {
                            
                            display_name: "Gh??? & ??o gh???",
                            name: "Seats & Seat Covers",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201423
                        },
                        {
                            
                            display_name: "Gi?? ????? ??i???n tho???i",
                            name: "Phone Holders",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201424
                        },
                        {
                            
                            display_name: "C???c s???c USB, Thi???t b??? thu ph??t FM & Bluetooth",
                            name: "USB Chargers, FM & Bluetooth Transmitters",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201425
                        },
                        {
                            
                            display_name: "Ch??n ga v?? C???n s???",
                            name: "Pedals & Gear Sticks",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201426
                        },
                        {
                            
                            display_name: "T???m che n???ng v?? Th???m Taplo",
                            name: "Sun Shields & Dash Covers",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201427
                        },
                        {
                            
                            display_name: "Kh??a v?? thi???t b??? ch???ng tr???m",
                            name: "Locks & Security",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201428
                        },
                        {
                            
                            display_name: "Camera h??nh tr??nh & Camera l??i",
                            name: "Camcorders & Parking Cameras",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201429
                        },
                        {
                            
                            display_name: "HUD, ?????ng h??? t???c ?????, ?????ng h??? s???",
                            name: "HUD, Speedometers & Gauges",
                            
                            
                            children: [],
                            parent_id: 200747,
                            id: 201430
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ph??? ki???n ngo???i th???t ?? t??",
                    name: "Automobile Exterior Accessories",

                    
                    children: [{
                            
                            display_name: "N???p vi???n",
                            name: "Garnish",
                            
                            
                            children: [],
                            parent_id: 200748,
                            id: 201432
                        },
                        {
                            
                            display_name: "??ng-ten thu ph??t s??ng",
                            name: "Antennas",
                            
                            
                            children: [],
                            parent_id: 200748,
                            id: 201433
                        },
                        {
                            
                            display_name: "B???t ph???",
                            name: "Covers",
                            
                            
                            children: [],
                            parent_id: 200748,
                            id: 201434
                        },
                        {
                            
                            display_name: "H??nh d??n, logo, huy hi???u",
                            name: "Stickers, Logos & Emblems",
                            
                            
                            children: [],
                            parent_id: 200748,
                            id: 201435
                        },
                        {
                            
                            display_name: "T???m ch???n b??n",
                            name: "Mud Flaps & Splash Guards",
                            
                            
                            children: [],
                            parent_id: 200748,
                            id: 201436
                        },
                        {
                            
                            display_name: "N???p c???a ch???ng tr???y",
                            name: "Sill Plates",
                            
                            
                            children: [],
                            parent_id: 200748,
                            id: 201437
                        },
                        {
                            
                            display_name: "R??nh tho??t n?????c m??a",
                            name: "Gutters",
                            
                            
                            children: [],
                            parent_id: 200748,
                            id: 201438
                        },
                        {
                            
                            display_name: "C??i & ph??? ki???n",
                            name: "Horns & Accessories",
                            
                            
                            children: [],
                            parent_id: 200748,
                            id: 201439
                        },
                        {
                            
                            display_name: "G????ng & Ph??? ki???n",
                            name: "Mirrors & Accessories",
                            
                            
                            children: [],
                            parent_id: 200748,
                            id: 201440
                        },
                        {
                            
                            display_name: "Ph??? ki???n bi???n s???",
                            name: "License Plate Accessories",
                            
                            
                            children: [],
                            parent_id: 200748,
                            id: 201441
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ph??? t??ng ?? t??",
                    name: "Automobile Spare Parts",

                    
                    children: [{
                            
                            display_name: "H??? th???ng khung xe v?? gi???m s??c",
                            name: "Body, Frame & Bumpers",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201443
                        },
                        {
                            
                            display_name: "C???n g???t n?????c & v??ng ?????m k??nh ch???n gi??",
                            name: "Windshield Wipers & Washers",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201444
                        },
                        {
                            
                            display_name: "H??? th???ng kh?? x???",
                            name: "Exhaust & Emissions",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201445
                        },
                        {
                            
                            display_name: "B??nh xe, V??nh & Ph??? ki???n",
                            name: "Wheels, Rims & Accessories",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201446
                        },
                        {
                            
                            display_name: "L???p & Ph??? ki???n",
                            name: "Tires & Accessories",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201447
                        },
                        {
                            
                            display_name: "Gi???m x??c, thanh ch???ng v?? h??? th???ng treo",
                            name: "Shocks, Struts & Suspension",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201448
                        },
                        {
                            
                            display_name: "B??? t???n nhi???t, L??m m??t ?????ng c?? & Ki???m so??t nhi???t",
                            name: "Radiators, Engine Cooling & Climate Control",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201449
                        },
                        {
                            
                            display_name: "H??? th???ng truy???n ?????ng, h???p s??? & ly h???p",
                            name: "Drivetrain, Transmission & Clutches",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201450
                        },
                        {
                            
                            display_name: "V??ng bi & con d???u",
                            name: "Bearing & Seals",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201451
                        },
                        {
                            
                            display_name: "B??? ph???n ?????ng c??",
                            name: "Engine Parts",
        
                            
                            children: [],
                            parent_id: 200749,
                            id: 201452
                        },
                        {
                            
                            display_name: "H??? th???ng phanh",
                            name: "Brake System",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201453
                        },
                        {
                            
                            display_name: "D??y chuy???n ?????ng",
                            name: "Belts, Hoses & Pulleys",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201454
                        },
                        {
                            
                            display_name: "Thi???t b??? ??i???n t???",
                            name: "Electronics",
        
                            
                            children: [],
                            parent_id: 200749,
                            id: 201455
                        },
                        {
                            
                            display_name: "H??? th???ng x??? l?? nhi??n li???u",
                            name: "Fuel System",
                            
                            
                            children: [],
                            parent_id: 200749,
                            id: 201456
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "D???ng c??? s???a ch???a ?? t??",
                    name: "Automotive Tools",

                    
                    children: [{
                            
                            display_name: "D???ng c??? Ki???m tra, ch???n ??o??n & s???a ch???a",
                            name: "Test, Diagnostic & Repair Tools",
                            
                            
                            children: [],
                            parent_id: 200750,
                            id: 201458
                        },
                        {
                            
                            display_name: "M??y ??o ??p su???t l???p",
                            name: "Tire Pressure Detectors",
                            
                            
                            children: [],
                            parent_id: 200750,
                            id: 201459
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ch??m s??c ?? t??",
                    name: "Automotive Care",

                    
                    children: [{
                            
                            display_name: "Dung d???ch t???y r???a",
                            name: "Wash & Waxes",
                            
                            
                            children: [],
                            parent_id: 200751,
                            id: 201461
                        },
                        {
                            
                            display_name: "R???a k??nh & Ch???t ch???ng b??m n?????c",
                            name: "Glass Care & Water Repellents",
                            
                            
                            children: [],
                            parent_id: 200751,
                            id: 201462
                        },
                        {
                            
                            display_name: "Ch??m s??c n???i th???t",
                            name: "Interior Care",
                            
                            
                            children: [],
                            parent_id: 200751,
                            id: 201463
                        },
                        {
                            
                            display_name: "Ch??m s??c l???p & v??nh",
                            name: "Tire & Wheel Care",
                            
                            
                            children: [],
                            parent_id: 200751,
                            id: 201464
                        },
                        {
                            
                            display_name: "????nh b??ng, s??n ph??? & ch???t l??m k??n",
                            name: "Polish, Coating & Sealants",
                            
                            
                            children: [],
                            parent_id: 200751,
                            id: 201465
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "D???u nh???t v?? ph??? gia ?? t??",
                    name: "Automotive Oils & Lubes",

                    
                    children: [{
                            
                            display_name: "D???u",
                            name: "Oils",
                            
                            
                            children: [],
                            parent_id: 200752,
                            id: 201467
                        },
                        {
                            
                            display_name: "Ph??? gia",
                            name: "Fuel Additives & Savers",
                            
                            
                            children: [],
                            parent_id: 200752,
                            id: 201468
                        },
                        {
                            
                            display_name: "M??? & Ch???t b??i tr??n",
                            name: "Greases & Lubricants",
                            
                            
                            children: [],
                            parent_id: 200752,
                            id: 201469
                        },
                        {
                            
                            display_name: "Ch???t ch???ng ????ng & ch???t l??m m??t",
                            name: "Antifreezes & Coolants",
                            
                            
                            children: [],
                            parent_id: 200752,
                            id: 201470
                        },
                        {
                            
                            display_name: "D???u m??y",
                            name: "Automotive Fluids",
        
                            
                            children: [],
                            parent_id: 200752,
                            id: 201471
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "M??c ch??a kh??a v?? B???c ch??a ?? t??",
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

            display_name: "M?? t??, xe m??y",
            name: "Motorcycles",

            
            children: [{
                    
                    display_name: "Ph??? ki???n xe m??y",
                    name: "Motorcycle Accessories",

                    
                    children: [{
                            
                            display_name: "L??t s??n",
                            name: "Carpets",
                            
                            
                            children: [],
                            parent_id: 200756,
                            id: 201473
                        },
                        {
                            
                            display_name: "?????ng h??? ??o",
                            name: "Speedometers, Odometers & Gauges",
                            
                            
                            children: [],
                            parent_id: 200756,
                            id: 201474
                        },
                        {
                            
                            display_name: "B???t ph???",
                            name: "Covers",
                            
                            
                            children: [],
                            parent_id: 200756,
                            id: 201475
                        },
                        {
                            
                            display_name: "H??nh d??n, logo, huy hi???u",
                            name: "Stickers, Logos & Emblems",
                            
                            
                            children: [],
                            parent_id: 200756,
                            id: 201476
                        },
                        {
                            
                            display_name: "Gh??? & b???c gh???",
                            name: "Seats & Seat Covers",
                            
                            
                            children: [],
                            parent_id: 200756,
                            id: 201477
                        },
                        {
                            
                            display_name: "G????ng v?? ph??? ki???n",
                            name: "Mirrors & Accessories",
                            
                            
                            children: [],
                            parent_id: 200756,
                            id: 201478
                        },
                        {
                            
                            display_name: "Kh??a v?? thi???t b??? ch???ng tr???m",
                            name: "Locks & Security",
                            
                            
                            children: [],
                            parent_id: 200756,
                            id: 201479
                        },
                        {
                            
                            display_name: "Th??ng ch???a ?????",
                            name: "Boxes & Cases",
                            
                            
                            children: [],
                            parent_id: 200756,
                            id: 201480
                        },
                        {
                            
                            display_name: "Gi?? ????? ??i???n tho???i",
                            name: "Phone Holders",
                            
                            
                            children: [],
                            parent_id: 200756,
                            id: 201481
                        },
                        {
                            
                            display_name: "T???m ch???n b??n",
                            name: "Mud Flaps & Splash Guards",
                            
                            
                            children: [],
                            parent_id: 200756,
                            id: 201482
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ph??? t??ng xe m??y",
                    name: "Motorcycle Spare Parts",

                    
                    children: [{
                            
                            display_name: "B??? ph???n ????nh l???a & ?????ng c??",
                            name: "Ignition & Engine Parts",
        
                            
                            children: [],
                            parent_id: 200757,
                            id: 201484
                        },
                        {
                            
                            display_name: "H??? th???ng x??? l?? nhi??n li???u",
                            name: "Fuel System",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201485
                        },
                        {
                            
                            display_name: "H??? th???ng phanh",
                            name: "Brake System",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201486
                        },
                        {
                            
                            display_name: "H??? th???ng gi???m x??c",
                            name: "Shocks, Struts & Suspension",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201487
                        },
                        {
                            
                            display_name: "H??? th???ng d???n ?????ng",
                            name: "Drivetrain, Transmission & Clutches",
        
                            
                            children: [],
                            parent_id: 200757,
                            id: 201488
                        },
                        {
                            
                            display_name: "Pin & Ph??? ki???n",
                            name: "Batteries & Accessories",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201489
                        },
                        {
                            
                            display_name: "C??i & Ph??? ki???n",
                            name: "Horns & Accessories",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201490
                        },
                        {
                            
                            display_name: "D??y c??p & ???ng",
                            name: "Cables & Tubes",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201491
                        },
                        {
                            
                            display_name: "H??? th???ng khung xe",
                            name: "Body & Frame",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201492
                        },
                        {
                            
                            display_name: "H??? th???ng kh?? x???",
                            name: "Exhaust & Emissions",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201493
                        },
                        {
                            
                            display_name: "B??nh xe, V??nh & Ph??? ki???n",
                            name: "Wheels, Rims & Accessories",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201494
                        },
                        {
                            
                            display_name: "L???p xe & Ph??? ki???n",
                            name: "Tires & Accessories",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201495
                        },
                        {
                            
                            display_name: "????n",
                            name: "Lighting",
                            
                            
                            children: [],
                            parent_id: 200757,
                            id: 201496
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "M?? b???o hi???m & Ph??? ki???n",
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

            display_name: "S??ch & T???p Ch??",
            name: "Books & Magazines",

            
            children: [{
                region_setting: {
                    low_stock_value: 0,
                    enable_size_chart: false
                },
                display_name: "S??ch",
                name: "Books",

                
                children: [{
                    
                    display_name: "S??ch V???i",
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

            display_name: "M??y t??nh & Laptop",
            name: "Computers & Accessories",

            
            children: [{
                    
                    display_name: "M??y T??nh B??n",
                    name: "Desktop Computers",

                    
                    children: [{
                            
                            display_name: "B??? M??y T??nh B??n",
                            name: "Desktop PC",
                            
                            
                            children: [],
                            parent_id: 201932,
                            id: 201944
                        },
                        {
                            
                            display_name: "M??y T??nh Mini",
                            name: "Mini PC",
                            
                            
                            children: [],
                            parent_id: 201932,
                            id: 201945
                        },
                        {
                            
                            display_name: "M??y Ch???",
                            name: "Server PC",
                            
                            
                            children: [],
                            parent_id: 201932,
                            id: 201946
                        },
                        {
                            
                            display_name: "M??y T??nh All in one",
                            name: "All-in-One Desktops",
                            
                            
                            children: [],
                            parent_id: 201932,
                            id: 201947
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "M??n H??nh",
                    name: "Monitors",
                    
                    
                    children: [],
                    parent_id: 200644,
                    id: 201933
                },
                {
                    
                    display_name: "Linh Ki???n M??y T??nh",
                    name: "Desktop & Laptop Components",

                    
                    children: [{
                            
                            display_name: "Qu???t v?? T???n Nhi???t",
                            name: "Fans & Heatsinks",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201949
                        },
                        {
                            
                            display_name: "CPU - B??? Vi X??? L??",
                            name: "Processors",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201950
                        },
                        {
                            
                            display_name: "Mainboard - Bo M???ch Ch???",
                            name: "Motherboards",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201951
                        },
                        {
                            
                            display_name: "VGA - Card M??n H??nh",
                            name: "Graphics Cards",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201952
                        },
                        {
                            
                            display_name: "Keo T???n Nhi???t",
                            name: "Thermal Paste",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201953
                        },
                        {
                            
                            display_name: "Ngu???n M??y T??nh",
                            name: "Power Supply Units",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201954
                        },
                        {
                            
                            display_name: "Ram M??y T??nh",
                            name: "RAM",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201955
                        },
                        {
                            
                            display_name: "B??? L??u ??i???n",
                            name: "UPS & Stabilizers",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201956
                        },
                        {
                            
                            display_name: "Case M??y T??nh",
                            name: "PC Cases",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201957
                        },
                        {
                            
                            display_name: "??? ????a Quang",
                            name: "Optical Drives",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201958
                        },
                        {
                            
                            display_name: "Bo M???ch ??m Thanh",
                            name: "Sound Cards",
                            
                            
                            children: [],
                            parent_id: 201934,
                            id: 201959
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Thi???t B??? L??u Tr???",
                    name: "Data Storage",

                    
                    children: [{
                            
                            display_name: "??? C???ng Di ?????ng",
                            name: "Hard Drives",
                            
                            
                            children: [],
                            parent_id: 201935,
                            id: 201961
                        },
                        {
                            
                            display_name: "??? C???ng SSD",
                            name: "SSD",
                            
                            
                            children: [],
                            parent_id: 201935,
                            id: 201962
                        },
                        {
                            
                            display_name: "??? C???ng M???ng (NAS)",
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
                            
                            display_name: "Thi???t B??? ?????ng ??? C???ng",
                            name: "Hard Disk Casings & Dockings",
                            
                            
                            children: [],
                            parent_id: 201935,
                            id: 201965
                        },
                        {
                            
                            display_name: "????a CD",
                            name: "Compact Discs",
                            
                            
                            children: [],
                            parent_id: 201935,
                            id: 201966
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Thi???t B??? M???ng",
                    name: "Network Components",

                    
                    children: [{
                            
                            display_name: "B??? Ph??t Wifi",
                            name: "Modems & Wireless Routers",
                            
                            
                            children: [],
                            parent_id: 201936,
                            id: 201968
                        },
                        {
                            
                            display_name: "B??? K??ch Wifi",
                            name: "Repeaters",
                            
                            
                            children: [],
                            parent_id: 201936,
                            id: 201969
                        },
                        {
                            
                            display_name: "B??? Thu Wifi",
                            name: "Wireless Adapters & Network Cards",
                            
                            
                            children: [],
                            parent_id: 201936,
                            id: 201970
                        },
                        {
                            
                            display_name: "B??? Chuy???n ?????i M???ng",
                            name: "Powerline Adapters",
                            
                            
                            children: [],
                            parent_id: 201936,
                            id: 201971
                        },
                        {
                            
                            display_name: "B??? chia m???ng",
                            name: "Network Switches & PoE",
                            
                            
                            children: [],
                            parent_id: 201936,
                            id: 201972
                        },
                        {
                            
                            display_name: "C??p M??y T??nh",
                            name: "Network Cables & Connectors",
                            
                            
                            children: [],
                            parent_id: 201936,
                            id: 201973
                        },
                        {
                            
                            display_name: "B??? Chuy???n M???ch KMV",
                            name: "KVM Switches",
                            
                            
                            children: [],
                            parent_id: 201936,
                            id: 201974
                        },
                        {
                            
                            display_name: "M??y Ch??? M??y In",
                            name: "Print Servers",
                            
                            
                            children: [],
                            parent_id: 201936,
                            id: 201975
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ph???n M???m",
                    name: "Softwares",
                    
                    
                    children: [],
                    parent_id: 200644,
                    id: 201937
                },
                {
                    
                    display_name: "Thi???t B??? V??n Ph??ng",
                    name: "Office Equipment",

                    
                    children: [{
                            
                            display_name: "M??y ????nh Ch???",
                            name: "Typewriters",
                            
                            
                            children: [],
                            parent_id: 201938,
                            id: 201977
                        },
                        {
                            
                            display_name: "M??y Ch???m C??ng",
                            name: "Absence Machines",
                            
                            
                            children: [],
                            parent_id: 201938,
                            id: 201978
                        },
                        {
                            
                            display_name: "M??y H???y T??i Li???u",
                            name: "Paper Shredders",
                            
                            
                            children: [],
                            parent_id: 201938,
                            id: 201979
                        },
                        {
                            
                            display_name: "M??y ?????m Ti???n",
                            name: "Money Counters",
                            
                            
                            children: [],
                            parent_id: 201938,
                            id: 201980
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "M??y In & M??y Scan",
                    name: "Printers & Scanners",

                    
                    children: [{
                            
                            display_name: "M??y In, M??y Scan & M??y Photo",
                            name: "Printers, Scanners & Photocopy Machines",
                            
                            
                            children: [],
                            parent_id: 201939,
                            id: 201982
                        },
                        {
                            
                            display_name: "M??y In M?? V???ch",
                            name: "Thermal & Barcode Printers",
                            
                            
                            children: [],
                            parent_id: 201939,
                            id: 201983
                        },
                        {
                            
                            display_name: "M???c In & Khay M???c",
                            name: "Inks & Toners",
                            
                            
                            children: [],
                            parent_id: 201939,
                            id: 201984
                        },
                        {
                            
                            display_name: "M??y In 3D",
                            name: "3D Printers",
                            
                            
                            children: [],
                            parent_id: 201939,
                            id: 201985
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ph??? Ki???n M??y T??nh",
                    name: "Peripherals & Accessories",

                    
                    children: [{
                            
                            display_name: "B??? chia c???ng USB & ?????c th??? nh???",
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
                            
                            display_name: "Mi???ng D??n & ???p Laptop",
                            name: "Laptop Skins & Covers",
                            
                            
                            children: [],
                            parent_id: 201940,
                            id: 201989
                        },
                        {
                            
                            display_name: "????? T???n Nhi???t",
                            name: "Cooling Pads",
                            
                            
                            children: [],
                            parent_id: 201940,
                            id: 201990
                        },
                        {
                            
                            display_name: "B??n Laptop",
                            name: "Laptop Stands & Foldable Laptop Desks",
                            
                            
                            children: [],
                            parent_id: 201940,
                            id: 201991
                        },
                        {
                            
                            display_name: "Mi???ng D??n B??n Ph??m",
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
                            
                            display_name: "B??? S???c Laptop",
                            name: "Laptop Chargers & Adaptors",
                            
                            
                            children: [],
                            parent_id: 201940,
                            id: 201994
                        },
                        {
                            
                            display_name: "Thi???t B??? Truy???n H??nh H???i Ngh???",
                            name: "Video Conference Devices",
                            
                            
                            children: [],
                            parent_id: 201940,
                            id: 201995
                        },
                        {
                            
                            display_name: "B??n Di Chu???t",
                            name: "Mouse Pads",
                            
                            
                            children: [],
                            parent_id: 201940,
                            id: 201996
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Chu???t & B??n Ph??m",
                    name: "Keyboards & Mice",

                    
                    children: [{
                            
                            display_name: "Chu???t M??y T??nh",
                            name: "Mice",
                            
                            
                            children: [],
                            parent_id: 201941,
                            id: 201998
                        },
                        {
                            
                            display_name: "B??n Ph??m M??y T??nh",
                            name: "Keyboards",
                            
                            
                            children: [],
                            parent_id: 201941,
                            id: 201999
                        },
                        {
                            
                            display_name: "B???ng V??? ??i???n T???",
                            name: "Drawing Tablets",
                            
                            
                            children: [],
                            parent_id: 201941,
                            id: 202000
                        },
                        {
                            
                            display_name: "Kh??c",
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
                    
                    display_name: "Ph??? Ki???n M??y T??nh Kh??c",
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