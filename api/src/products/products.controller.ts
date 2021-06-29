import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller()
export class ProductsController {
    constructor(public readonly movieService: ProductsService) {}

    @Get('movies')
    async getProductss(@Query('search') search: string) {
        console.log(search)
        if (search !== undefined && search.length > 1) {
            return await this.movieService.findProductss(search);
        }
    }
}
