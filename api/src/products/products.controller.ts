import { Controller, Get,Put, Body, Res, Post, UseGuards, Param, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CategoriesService } from './categories.service';
import { ProductDto } from './dto/product.dto';
import { AuthGuard } from '@nestjs/passport';
import { ProductGetDto  } from './dto/product-get.dto';
@UseGuards(AuthGuard('jwt'))  
@Controller()
export class ProductsController {
    constructor(public readonly productService: ProductsService,
        public readonly categoriesService: CategoriesService
        ) {}
 
    @Post('/api/products')
    async create(@Res() res,  @Body() productDto: ProductDto): Promise<any> {
        const userID = res.req.user.id
        
        const response = await this.productService.create(userID, productDto)
        return res.json({
            ...response
        })
    }
    @Get('/api/products/pull')
    async pull(@Res() res): Promise<any> {
        const userID = res.req.user.id
        let {page = 1, per_page = 30 } = res.req.query
        return res.json(await this.productService.pullFromWoocommerce(userID, page, per_page))
    }
    @Put('/api/products')
    async update(@Res() res,  @Body() productDto: ProductDto): Promise<any> {
        const userID = res.req.user.id
        const response = await this.productService.update(userID, productDto)
        return res.json(response)
    }
 
    @Get('/api/products')
    async getByUserID(@Res() res): Promise<any> {
        const userID = res.req.user.id
        let {pageSize = 30, current = 1 } = res.req.query
        if(pageSize > 100){
            pageSize = 30
        } 
        const from = pageSize * (current -1 )
     
        const response = await this.productService.getByUserID(userID, pageSize, from )
        return res.json(response)
    }
    @Get('/api/products/:id')
    async get(@Res() res, @Param() params: ProductGetDto): Promise<any> {
        const id = params.id
        const data = await this.productService.getRawProduct(id)
        return res.json(data)
    }

    @Delete('/api/products/:id')
    async delete(@Res() res, @Param() params: ProductGetDto): Promise<any> {
        const userID = res.req.user.id
        const id = params.id
        const data = await this.productService.remove(userID, id)
        return res.json(data)
    }
    @Get('/api/categories')
    async categoryGet(@Res() res): Promise<any> {
        let { keyword = '' } = res.req.query

        return res.json(await this.categoriesService.search(keyword))
    }
    @Get('/api/categories/reIndex')
    async categoryReindex(@Res() res): Promise<any> {
        let {id = '' } = res.req.query
        return res.json(await this.categoriesService.reIndex(id))
    }


}
