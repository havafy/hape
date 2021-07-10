import { Controller, Get,Put, Body, Res, Post, Param, Delete } from '@nestjs/common';
import { HomePageService } from './page-home.service';
import { CategoryPageService } from './page-category.service';
import { ProductPageService } from './page-product.service';
import { PageGetDto  } from './dto/page-get.dto';
import { get } from 'https';
@Controller()
export class PagesController {
    constructor(public readonly homePageService: HomePageService,
        public readonly categoryPageService: CategoryPageService,
        public readonly productPageService: ProductPageService,
        ) {}

    @Get('/api/pages/:id')
    async home(@Res() res, @Param() params: PageGetDto): Promise<any> {
        const id = params.id
        if(id === 'home'){
            return res.json(await this.homePageService.getContent())
        }
        return res.json({})
    }
    @Get('/api/pages/category/:id')
    async category(@Res() res, @Param() params: PageGetDto): Promise<any> {
        const id = params.id
        let {pageSize = 30, current = 1 } = res.req.query
        if(pageSize > 100){
            pageSize = 30
        } 
        const from = pageSize * (current -1 )
        return res.json(await this.categoryPageService.get(id, pageSize, from))
    }
    @Get('/api/pages/product/:id')
    async product(@Res() res, @Param() params: PageGetDto): Promise<any> {
        const id = params.id
        let {pageSize = 30, current = 1 } = res.req.query
        if(pageSize > 100){
            pageSize = 30
        }
        const from = pageSize * (current -1 )
        return res.json(await this.productPageService.get(id))
    }
}
