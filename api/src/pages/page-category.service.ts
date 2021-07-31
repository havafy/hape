import { Injectable } from '@nestjs/common';
import { url } from 'inspector';
import { SearchService } from '../search/search.service';
import { ProductsService } from "../products/products.service";
import { CategoriesService } from "../products/categories.service";
@Injectable()
export class CategoryPageService {
    constructor(readonly esService: SearchService,
        readonly categoriesService: CategoriesService,
        readonly productsService: ProductsService) {}
    
    async get(id: string = '', size = 30, from =0) {

        if(!id ){
            return {}
        }
        let  must = [ 
            {match: { categories : id}},
            {match: { status: true }}
        ]
        const sort = [{"createdAt": "desc"}];
        const category = await this.categoriesService.get(id)
        const data = await this.productsService.getByMultiFields({
            must, 
            size, 
            from,
            sort
            })

        return {
            ...data, category
        }

    }
    async getBlockByCategory(category: string, title = ''){
    
    }
}
