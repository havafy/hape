import { Injectable } from '@nestjs/common';
import { url } from 'inspector';
import { SearchService } from '../search/search.service';
import { ProductsService } from "../products/products.service";

@Injectable()
export class ProductPageService {
    constructor(readonly esService: SearchService,
        readonly productsService: ProductsService) {}
    
    async get(id: string = '') {

        if(!id ){
            return {}
        }
        
        return await this.productsService.getFullyProduct(id)
    
    }
        
    async search(keyword: string, pageSize, from) {

        if(keyword === '' ){
            return {}
        }
        return await this.productsService.searchByKeyword(keyword, pageSize, from)
    
    }
    
}
