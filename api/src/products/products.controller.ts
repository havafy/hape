import { Controller, Get, Body, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductDto } from './dto/product.dto';
@Controller('/api/products')
export class ProductsController {
    constructor(public readonly movieService: ProductsService) {}

    @Post()
    async create(@Body() productDto: ProductDto): Promise<any> {
        console.log(productDto)

        return {
            productDto
          };

    }
}
