import { Controller, Get,Put, Body, Res, Post, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductDto } from './dto/product.dto';
import { AuthGuard } from '@nestjs/passport';
@UseGuards(AuthGuard('jwt'))     
@Controller('/api/products')
export class ProductsController {
    constructor(public readonly productService: ProductsService) {}

    @Post()
    async create(@Res() res,  @Body() productDto: ProductDto): Promise<any> {
        productDto.userID = res.req.user.id
        
        const status = await this.productService.create(productDto)
        return res.json({
            status
        })
    }
    @Put()
    async update(@Res() res,  @Body() productDto: ProductDto): Promise<any> {
        productDto.userID = res.req.user.id
        const status = await this.productService.update(productDto)
        return res.json({
            status
        })
    }
    
    
}
