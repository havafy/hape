import { Injectable } from '@nestjs/common';
import { url } from 'inspector';
import { SearchService } from '../search/search.service';
import { ProductsService } from "../products/products.service";
import { ElasticsearchService } from '@nestjs/elasticsearch';
@Injectable()
export class CartService {
    constructor(readonly esService: SearchService,
        readonly productsService: ProductsService,
        readonly elasticsearchService: ElasticsearchService) {}
    
    async get(id: string = '') {

        if(!id ){
            return {}
        }
        
        return await this.productsService.getFullyProduct(id)
    
    }

}
