import { Injectable } from '@nestjs/common';
import { SearchService } from '../search/search.service';
import { ProductDto } from './dto/product.dto';
const ES_INDEX_NAME = 'products'
@Injectable()
export class ProductsService {
    constructor(readonly esService: SearchService) {}
    async create(productDto: ProductDto) {
        const record = [ 
             { index: { _index: ES_INDEX_NAME } },  {
            ...productDto
        }]
        
        const res = await this.esService.createByBulk(ES_INDEX_NAME, record);
        return res
    }
    async search(search: string = '') {
        return await this.esService.search(search);
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
                        price: { type: 'long' },
                        priceOriginal: { type: 'long' },
                        dealBegin: { type: 'date'},
                        dealEnd: { type: 'date'},
                        url: { type: 'text' },
                        description: { type: 'text' },
                        categorySlug: { type: 'text'},
                        status: { type: 'boolean' },
                        images: { type: 'nested' },
                        userID: { type: 'long' },
                        updatedAt: { type: 'date' },
                        createdAt: { type: 'date' },
                    },
                },
  
        }
    }
}
