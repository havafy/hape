import { Injectable } from '@nestjs/common';
import { url } from 'inspector';
import { SearchService } from '../search/search.service';
import { ProductsService } from "../products/products.service";

@Injectable()
export class CategoryPageService {
    constructor(readonly esService: SearchService,
        readonly productsService: ProductsService) {}
    
    async get(id: string = '', size = 30, from =0) {

        if(!id ){
            return {}
        }
        let  must = [ 
            {match: { category : id}},
            {match: { status: true }}
        ]
        const sort = [{"createdAt": "desc"}];
        
        const data = await this.productsService.getByMultiFields({
            must, 
            size, 
            from,
            sort
            })

        return {
            ...data
        }

    }
    async getBlockByCategory(category: string, title = ''){
    
    }
}
