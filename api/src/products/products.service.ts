import { Injectable } from '@nestjs/common';
import { url } from 'inspector';
import { SearchService } from '../search/search.service';
import { FilesService } from "../files/files.service";
import { ProductDto } from './dto/product.dto';
import { CategoriesService } from './categories.service';
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
     
        const { body: { 
            hits: { 
                total, 
                hits 
            } } } = await this.esService.findByMultiFields({index: ES_INDEX_NAME, must, size, from, sort})
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
    }

    async create(userID: number, productDto: ProductDto) {
        try {
            const now = new Date();
            const createdAt = now.toISOString()
            const existing = await this.esService.checkExisting(ES_INDEX_NAME, 'sku', productDto.sku)
            if(existing){
                return {
                    status: false,
                    message: "This SKU is existing."
                }
            }

            //move file from Waiting to Production folder
            productDto.images = await this.filesService.formalizeS3Files(productDto.images)

            const record: any = [
                { index: { _index: ES_INDEX_NAME } },  {
                ...productDto,
                userID,
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
            return {
                product: null,
                status: false,
            }
        }
        
    }
 
    async update(userID: number, productDto: ProductDto) {
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
                const found = await this.esService.findBySingleField(ES_INDEX_NAME, { sku: productDto.sku })
                if(found.body.hits.total.value >= 1  || !Array.isArray(found.body.hits.hits)){
                    return {
                        status: false,
                        message: "This SKU is existing.",
    
                    }
                }
            }
            const now = new Date();
            productDto.updatedAt = now.toISOString()
     
            //move file from Waiting to Production folder
            const updatedImages = await this.filesService.formalizeS3Files(productDto.images)
            productDto.images = updatedImages
            //remove unused images
            await this.filesService.cleanUnusedFiles(updatedImages, product.images)
            await this.esService.update(ES_INDEX_NAME, productID ,productDto)
            const updatedProduct =  await this.esService.findById(ES_INDEX_NAME, productID);
            return {
                product: { ...updatedProduct._source },
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

    async getRawProduct(id: string) {
        try {
            const { _source } =  await this.esService.findById(ES_INDEX_NAME, id);
            console.log(_source)
            const categoryRaw = await this.categoriesService.get(_source.category)
            return {
                found: true,
                product: {
                    ..._source, categoryRaw
                }
            }
        }catch (err) {
            console.log(err)
            return {
                found: false,
            }
        }

    }
    async getFullyProduct(id: string) {
        try {
            const { _source } =  await this.esService.findById(ES_INDEX_NAME, id);
            return {
                found: true,
                product: {
                    ..._source,
                    images: this.applyCDN(_source.images)
                }
            }
        }catch (err) {
            return {
                found: false,
            }
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
                        quantity: { type: 'long' },
                        price: { type: 'long' },
                        priceDiscount: { type: 'long' },
                        discountBegin: { type: 'date'},
                        discountEnd: { type: 'date'},
                        url: { type: 'text' },
                        description: { type: 'text' },
                        category: { type: 'text'},
                        status: { type: 'boolean' },
                        images: { type: 'text' },
                        tags: { type: 'text' },
                        userID: { type: 'long' },
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
