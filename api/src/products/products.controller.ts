import { Controller, Get,Put, Body, Res, Post, UseGuards, Param, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductDto } from './dto/product.dto';
import { AuthGuard } from '@nestjs/passport';
import { ProductGetDto  } from './dto/product-get.dto';
@Controller()
export class ProductsController {
    constructor(public readonly productService: ProductsService) {}
    @UseGuards(AuthGuard('jwt'))   
    @Post('/api/products')
    async create(@Res() res,  @Body() productDto: ProductDto): Promise<any> {
        const userID = res.req.user.id
        
        const response = await this.productService.create(userID, productDto)
        return res.json({
            ...response
        })
    }
    @UseGuards(AuthGuard('jwt'))   
    @Put('/api/products')
    async update(@Res() res,  @Body() productDto: ProductDto): Promise<any> {
        const userID = res.req.user.id
        const response = await this.productService.update(userID, productDto)
        return res.json(response)
    }
    
    @UseGuards(AuthGuard('jwt'))   
    @Get('/api/products')
    async getByUserID(@Res() res): Promise<any> {
        const userID = res.req.user.id
        const {pageSize = 30, current = 1 } = res.req.query
        const from = pageSize * (current - 1)
        const response = await this.productService.getByUserID(userID, pageSize, from )
        return res.json(response)
    }
    @Get('/api/products/:id')
    async get(@Res() res, @Param() params: ProductGetDto): Promise<any> {
        const id = params.id
        const data = await this.productService.get(id)
        return res.json(data)
    }
    @UseGuards(AuthGuard('jwt'))  
    @Delete('/api/products/:id')
    async delete(@Res() res, @Param() params: ProductGetDto): Promise<any> {
        const userID = res.req.user.id
        const id = params.id
        const data = await this.productService.remove(userID, id)
        return res.json(data)
    }
}
