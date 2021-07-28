import { Injectable } from '@nestjs/common';
import { url } from 'inspector';
import { SearchService } from '../search/search.service';
import { ProductsService } from "../products/products.service";

@Injectable()
export class StaticPageService {
    constructor(readonly esService: SearchService,
        readonly productsService: ProductsService) {}
    
    async get(id: string) {
        return {page: 'PID:<i>' + id + '</i>', status: 200 }

    }
    
}
