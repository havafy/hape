import { Injectable } from '@nestjs/common';
import { url } from 'inspector';
import { SearchService } from '../search/search.service';
import { FilesService } from "../files/files.service";
import { ProductDto } from './dto/product.dto';
import { CategoriesService } from './categories.service';
import axios from 'axios'
const ES_INDEX_NAME = 'products'
const CDN = 'https://'+process.env.AWS_CLOUDFRONT+'/';
@Injectable()
export class ProductsService {
    constructor(readonly esService: SearchService,
        readonly categoriesService: CategoriesService,
        readonly filesService: FilesService) {}
    
    async getByUserID(userID: number,  size: number, from: number) {
        const { body: { 
            hits: { 
                total, 
                hits 
            } } } = await this.esService.findBySingleField(ES_INDEX_NAME, { userID }, size, from)
        const count = total.value
        let products = []
        if(count){
            products = hits.map((item: any) => {
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
            products
        }
    }

    applyCDN(files: string[]){
        const newFiles = []
        for (const url of files) {
            // let remove this file
            const urlSlipt = url.split('.amazonaws.com/');
            if (urlSlipt.length >= 2) {
                const Key = urlSlipt[1]
                newFiles.push(CDN+Key) 
            }
        }
        return newFiles
    }
    async getByMultiFields({must, size = 12, from = 0, sort = [{"createdAt": "desc"}]}) {
        try{
                const { body: { 
                    hits: { 
                        total, 
                        hits 
                    } } } = await this.esService.findByMultiFields({
                        index: ES_INDEX_NAME, must, 
                        _source: [
                            'name','sku','images','price',  'product_id',
                            'regular_price', 'sale_price', 'quantity'],
                        size, from, sort
                    })
                const count = total.value
                let products = []
                if(count){
                    products = hits.map((item: any) => {
                        return{
                            id: item._id,
                            ...item._source, 
                            images: this.applyCDN(item._source.images)
                        }
                    })
                }
                return {
                    count,
                    size,
                    from,
                    products
                }
        }catch (err){
            console.log('getByMultiFields: ', err)

        }
    }
    
    async searchByKeyword(keyword, size, from) {
        let count = 0
        let products = []
        try {
            const body = {
                size,
                from,
                query: {   
                    bool: {
                        must: [
                          {
                            query_string: {
                                fields: [ "name","tags.*"],
                                query: '*' + keyword + '*',
                                analyze_wildcard: true
                             }
                          },
                          {
                            match: {
                                status: true 
                            }
                          }
                        ]
                    }
                    
                },
                _source: [
                    'name','sku','images','price', 'product_id',
                    'regular_price', 'sale_price', 'quantity']
            }      
            
            const { body: { 
                hits: { 
                    total, 
                    hits 
                } } } = await this.esService.search(ES_INDEX_NAME, body)
            count = total.value
 
            if(count){
                products = hits.map((item: any) => {
                    return{
                        id: item._id,
                        ...item._source,
                     }
                })
            }
   
        }catch(error){
            
        }
        return {
            count,
            size,
            from,
            products
        }
    }
    async create(userID: string, productDto: any) {
        try {
            const now = new Date();
            const createdAt = now.toISOString()
            const existing = await this.isSkuExisting(userID, productDto.sku)
            if(existing !== false) {
                return {
                    status: false,
                    message: "This SKU is existing."
                }
            }
            //move file from Waiting to Production folder
            productDto.images = await this.filesService.formalizeS3Files(productDto.images)
            //filter the un-control tag on description
            productDto.description = this.allowedTags(productDto.description)
            // collect category ID and his parents
            let categories = []
            if(productDto.category){
                categories = await this.collectGroupCategory(productDto.category)
            }
            // apply discount price
            const price = productDto.discount_price ? productDto.discount_price : productDto.regular_price
            // get unique ID
            const product_id = await this.getUniqueID()
            const record: any = [
                { index: { _index: ES_INDEX_NAME } },  {
                ...productDto,
                price,
                product_id,
                userID, categories,
                updatedAt: createdAt,
                createdAt
            }]
            const {  body: {items} } = await this.esService.createByBulk(ES_INDEX_NAME, record);
            const productID = items[0].index._id
            const { _source } =  await this.esService.findById(ES_INDEX_NAME, productID);
            return {
                product: { ..._source, id: productID},
                status: true,
            }
        }catch (err){
            console.log('Create Product: ', err)
            return {
                product: null,
                status: false,
            }
        }
        
    }
    async getUniqueID (){
  
        try{
            let i = 0
            while(true){
                let product_id = this.esService.makeID()
                const { body: { 
                    hits: { 
                        total, 
                        hits 
                    } } } = await this.esService.findBySingleField(
                        ES_INDEX_NAME,  { product_id })
                const count = total.value
                if(!count){
                    return product_id
                }
                i++
                if(i > 10) break
            }
   
        }catch(err){
           
        }
        return this.esService.makeID()
    }
    async isSkuExisting(userID, sku: string){
        try{   
            if(sku === '') return true
            let  must = [ 
                {match: { sku }},
                {match: { userID }}
            ]
            const { count,products } = await this.getByMultiFields({must})

            if(count){
                return products[0]
            }

        } catch (err) {
            console.error('isSkuExisting:', err)
        }
        return false
    }
 
    async update(userID: string, productDto: any) {
        try{    
            const productID = productDto.id
            const checkProduct =  await this.esService.findById(ES_INDEX_NAME, productDto.id);
            const product = checkProduct._source
            if(product.userID !== userID ){
                return {
                    status: false,
                    message: "Permission is denied.",
                }
            }
            // if change SKU, let check new SKU is existing or not
            if(productDto.sku !== product.sku){
                const found = await this.isSkuExisting(userID, productDto.sku)
                if(found !== false){
                    return {
                        status: false,
                        message: "This SKU is existing.",
    
                    }
                }
            }
            const now = new Date();
            productDto.updatedAt = now.toISOString()
            if(productDto.images){
                //move file from Waiting to Production folder
                const updatedImages = await this.filesService.formalizeS3Files(productDto.images)
                productDto.images = updatedImages
                //remove unused images
                await this.filesService.cleanUnusedFiles(updatedImages, product.images)
            }
            //filter the un-control tag on description
            productDto.description = this.allowedTags(productDto.description)

            // collect category ID and his parents
            let categories = []
            if(productDto.category){
                categories = await this.collectGroupCategory(productDto.category)
            }
             // apply discount price
             const price = productDto.discount_price ? productDto.discount_price : productDto.regular_price
          
            await this.esService.update(ES_INDEX_NAME, productID ,{
                ...productDto, 
                price,
                categories
            })
            const updatedProduct =  await this.esService.findById(ES_INDEX_NAME, productID);
            const categoryRaw = await this.categoriesService.get(productDto.category)
            return {
                product: { ...updatedProduct._source, categoryRaw},
                status: true
            }
    
        }catch (err){
            console.log(err)
        }
        return {
            product: null,
            status: false,
        }
    }
    
    async collectGroupCategory(id: string) {
        if(id !==''){
            const category = await this.categoriesService.get(id)
            if(category.id){
                return [category.id, ...category.parents]
            }

        }
        return []

    }
    async getRawProduct(id: string) {
        let product: any
        let categoryRaw = {}
        let found = false
        try {
            const { body: { 
                hits: { 
                    total, 
                    hits 
                } } } = await this.esService.findBySingleField(
                    ES_INDEX_NAME, { product_id: id})
            if(total.value){
                product = { ...hits[0]._source, _id: hits[0]._id }
            }else{
                let data = await this.esService.findById(ES_INDEX_NAME, id);
                product = { ...data._source, _id: data._id }
                
            }
            if(product.product_id){
                found = true
                categoryRaw = await this.categoriesService.get(product.category)
            }
           

        }catch (err) {
        }

        return {
            found,
            categoryRaw,
            product
        }

    }

    async pullFromWoocommerce (userID: string, page: number, per_page: number) {
        const categoryMapping = {
            'thucpham-saykho': '200796',
            'thuc-pham-dong-hop': '200801',
            'thuc-pham-dong-lanh': '200802',
            'gia-vi': '200804',
            'nguyen-lieu-lam-bep': '200814',
            'nha-cua-doi-song': '201237',
            'bep-phong-an': '201237',
            'sua-do-uong': '200838',
            'banh-keo-chocolate': '200785',
    
        }
        try {

            const { data } = await axios.get(
                'https://www.havamall.com/wp-json/wc/v2/products?page='+page+'&per_page='+per_page+'&orderby=date&order=desc',
                {
                    auth: {
                        username: 'ck_17cffd73716807b8b1a4e83370ce8c918f264318',
                        password: 'cs_476889cb37aad917d3710e4cf7df248e82889eef'
                    }
                }
            )
        let result = []
        for(let product of data){
            const sku = String(product.id)
            const found = await this.isSkuExisting(userID, sku)
        
            let images = []
            if(product.images.length){
                images = product.images.map((image: any) => {
                    return image.src
                })
            }
            let tags = []
            let category = ''
            if(product.categories.length){
                tags = product.categories.map((cat: any) => {
                    return cat.slug
                })
                for(let tag of  tags){
                    if(categoryMapping[tag]){
                        category = categoryMapping[tag]
                        break
                    }
                }
                
            }

            const postData = {
                name: product.name,
                price: Number(product.price),
                quantity: product.stock_quantity,
                sku,
                regular_price: Number(product.regular_price),
                sale_price:  Number(product.sale_price),
                status: true,
                category,
                permalink: product.permalink,
                description: this.allowedTags(product.description),
                tags
            }
            if(found === false){
                await this.create(userID, { 
                    ...postData, images
                })
            }else{

                // don't allow update image
                await this.update(userID, {
                    ...postData, id: found.id
                    })

            }
            result.push(product.name)

        }

        return result
    }catch (error) {
        console.log('pullFromWoocommerce: ', error)
        return {
            error
        }
    }

    }
    async reindex(){
        try{

            let size = 50
            let page = 0
            let indexTotal = 0
            while(page < 30){
                const { body: { 
                    hits: { 
                        total, 
                        hits 
                    } } } = await this.esService.findBySingleField(
                        ES_INDEX_NAME, null, size, page * size,[{"createdAt": "desc"}])
                if(hits.length === 0) break
                for(let product of hits){
                    const product_id = await this.getUniqueID()
                    console.log('name:' + product._source.name)
                    if(product._source.product_id === undefined){
                        await this.esService.update(ES_INDEX_NAME, product._id ,{ product_id }, '')
                        indexTotal++
                    }
                   
                }
                console.log('reIndex page:' + page, indexTotal)
                page++
            }
            return { indexTotal }
        }catch (err) {
            console.log('reindex:', err)
        }
    }
    async getFullyProduct(id: string) {
        try {
            const { product } =  await this.getRawProduct(id);

            const categoryRaw = await this.categoriesService.get(product.categories[0])

            let must = [ 
                {match: { categories : product.category}},
                {match: { status: true }}
            ]
            const related = await this.getByMultiFields({
                must,  size: 12,  from: 0,   
                sort: [{"createdAt": "desc"}]  
            })
    
            return {
                found: true,
                product: {
                    ...product,
                    categoryRaw,
                    images: this.applyCDN(product.images)
                },
                related: related.products
            }
        }catch (err) {
       
        }
        return {
            found: false,
        }
    }
    async remove(userID: number, id: string) {
        try {
            const product = await this.esService.findById(ES_INDEX_NAME, id )
            if(product.found){
                if(product._source.userID !== userID ){
                    return {
                        status: false,
                        message: "Permission is denied.",
                    }
                }
                await this.filesService.removeFromS3(product._source.images)
                const res = await this.esService.delete(ES_INDEX_NAME, id )
                if(res.body.result === 'deleted'){
                    return {
                        status: true
                    }
                }
       
            }

 
        }catch (err) {
          
        }
        return {
            status: false,
            message: "This product is not found.",
        }
    }
    allowedTags (str:string){
        return this.strip_tags(str,'<div><ul><li><h2><h3><h4><b><i><span><img><p>')
     }
    strip_tags  (str:string, allow:string){
          // making sure the allow arg is a string containing only tags in lowercase (<a><b><c>)
          allow = (((allow || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('')
      
          var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
          var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi
          return str.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
              return allow.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 :''
          })
      }
      
      
    async createIndex(){
        const existing = await this.esService.checkIndexExisting(ES_INDEX_NAME)
        if(!existing){
            this.esService.createIndex(ES_INDEX_NAME, this.indicateBody())
        }
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
                        product_id:{ type: 'long'}, // must is unique
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
                        // --- stock ----
                        quantity: { type: 'long' },
                        manage_stock: { type: 'boolean' },
                        in_stock: { type: 'boolean' },
                        // --- price ------
                        price: { type: 'long' },
                        regular_price: { type: 'long' },
                        sale_price: { type: 'long' },
                        total_sales: { type: 'long' },
                        discountBegin: { type: 'date'},
                        discountEnd: { type: 'date'},
                        permalink: { type: 'text' },
                        short_description:  { type: 'text' },
                        description: { type: 'text' },
                        category: { type: 'text'},
                 
                        images: { type: 'text' },
                        tags: { type: 'text' },
                        userID: { type: 'long' },
                        //--- ------
                        type:{ type: 'text' }, // "simple"
                        status: { type: 'boolean' },// true = publish
                        catalog_visibility: { type: 'text' }, // "visible"
                        //---- review ------
                        reviews_allowed: { type: 'boolean' },
                        average_rating: { type: 'long' },
                        rating_count: { type: 'long' },
                        // ---- marketing ----
                        related_ids: { type: 'text' },
                        upsell_ids:{ type: 'text' },
                        cross_sell_ids: { type: 'text' },
                        //------
                        weight: { type: 'short' },
                        length: { type: 'short' },
                        width: { type: 'short' },
                        height: { type: 'short' },
                        countryOrigin: { type: 'text' },
                        brand: { type: 'short' },
                        expiryDate: { type: 'text' },
                        //--------
                        updatedAt: { type: 'date' },
                        createdAt: { type: 'date' },
                    },
                },
  
        }
    }
}
