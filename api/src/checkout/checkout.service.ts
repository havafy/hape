import { Injectable } from '@nestjs/common';
import { url } from 'inspector';
import { SearchService } from '../search/search.service';
import { ProductsService } from "../products/products.service";

@Injectable()
export class CheckoutService {
    constructor(readonly esService: SearchService,
        readonly productsService: ProductsService) {}
    
    async get(id: string = '') {

        if(!id ){
            return {}
        }
        
        return await this.productsService.getFullyProduct(id)
    
    }

}
