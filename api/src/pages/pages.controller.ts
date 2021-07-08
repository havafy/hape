import { Controller, Get,Put, Body, Res, Post, Param, Delete } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PageGetDto  } from './dto/page-get.dto';
import { get } from 'https';
@Controller()
export class PagesController {
    constructor(public readonly productService: PagesService) {}

    @Get('/api/pages/:id')
    async create(@Res() res, @Param() params: PageGetDto): Promise<any> {
        const id = params.id
        return res.json({
            id
        })
    }
}
