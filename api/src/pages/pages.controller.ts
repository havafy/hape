import { Controller, Get,Put, UseGuards, Body, Res, Post, Param, Delete } from '@nestjs/common';
import { HomePageService } from './page-home.service';
import { CategoryPageService } from './page-category.service';
import { ProductPageService } from './page-product.service';
import { StaticPageService } from './page-static.service';
import { PageGetDto  } from './dto/page-get.dto';
import { StaticPageDto } from "./dto/static-page.dto"
import { StaticPageUpdateDto } from "./dto/static-page-update.dto"
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class PagesController {
    constructor(public readonly homePageService: HomePageService,
        public readonly categoryPageService: CategoryPageService,
        public readonly productPageService: ProductPageService,
        public readonly staticPageService: StaticPageService,
        ) {}

    @Get('/api/pages/:id')
    async home(@Res() res, @Param() params: PageGetDto): Promise<any> {
        const id = params.id
        if(id === 'home'){
            return res.json(await this.homePageService.getContent())
        }else{
            return res.json(await this.staticPageService.get(id))
        }
    }
    @UseGuards(AuthGuard('jwt'))  
    @Post('/api/pages')
    async createStaticPage(@Res() res,  @Body() staticPageDto: StaticPageDto): Promise<any> {
        const userID = res.req.user.id
        return res.json(await this.staticPageService.create(userID, staticPageDto))
    }
    @UseGuards(AuthGuard('jwt'))  
    @Put('/api/pages/:id')
    async updateStaticPage(@Res() res,  
                    @Param() params: {id: string}, 
                    @Body() staticPageDto: StaticPageUpdateDto): Promise<any> {
        const id = params.id
        const userID = res.req.user.id
        return res.json(await this.staticPageService.update(userID, id, staticPageDto))
    }
    @UseGuards(AuthGuard('jwt'))  
    @Delete('/api/pages/:id')
    async delete(@Res() res, @Param() params: {id: string}): Promise<any> {
        const userID = res.req.user.id
        const id = params.id
        return res.json(await this.staticPageService.remove(userID, id))
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
