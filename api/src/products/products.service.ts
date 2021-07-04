import { Injectable } from '@nestjs/common';
import { SearchService } from '../search/search.service';
import { ProductDto } from './dto/product.dto';

const ES_INDEX_NAME = 'products'
@Injectable()
export class ProductsService {
    constructor(readonly esService: SearchService) {}
    
    async getByUserID(userID: number,  size: number, from: number) {
        const { body: { 
            hits: { 
                total, 
                hits 
            } } } = await this.esService.findByFields(ES_INDEX_NAME, { userID }, size, from)
        const count = total.value
        let products = []
        if(count){
            products = hits.map((item: any) => {
                return{
                    id: item._id,
                    ...item._source
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

    async create(productDto: ProductDto) {
        const now = new Date();
        const createdAt = now.toISOString()
        const existing = await this.esService.checkExisting(ES_INDEX_NAME, 'sku', productDto.sku)
        if(existing){
            return {
                status: false,
                message: "This SKU is existing."
            }
        }
        const record: any = [ 
             { index: { _index: ES_INDEX_NAME } },  {
            ...productDto,
            updatedAt: createdAt,
            createdAt
        }]
        
        const res = await this.esService.createByBulk(ES_INDEX_NAME, record);
        if(res.statusCode === 200) {
            return {
                status: true,
            }
        }
        return {
            status: false,
        }
    }
    async update(userID: number, productDto: ProductDto) {
 
        const found = await this.esService.findByFields(ES_INDEX_NAME, { sku: productDto.sku })
        if(found.body.hits.total.value === 0  || !Array.isArray(found.body.hits.hits)){
            return {
                status: false,
                message: "This SKU is not existing.",

            }
        }

        if(found.body.hits.hits[0]._source.userID !== userID ){
            return {
                status: false,
                message: "Permission is denied.",
            }
        }

        const id = found.body.hits.hits[0]._id

        delete productDto.userID
        const now = new Date();
        productDto.updatedAt = now.toISOString()
        const status = await this.esService.update(ES_INDEX_NAME, id ,productDto);
        if(status && status.statusCode === 200){
            return {
                status: true
            }
        }
        return {
            status: false
        }
    }
    async search(search: string = '') {
        return await this.esService.search(search);
    }
    async get(id: string) {
        try {
            const { _source } =  await this.esService.findById(ES_INDEX_NAME, id);
            return {
                found: true,
                product: {
                    ..._source
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
        this.esService.createIndex(ES_INDEX_NAME, this.indicateBody())
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
                        userID: { type: 'long' },
                        updatedAt: { type: 'date' },
                        createdAt: { type: 'date' },
                    },
                },
  
        }
    }
}
