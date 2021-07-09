import { Controller, Get,Put, Body, Res, Post, Param, Delete } from '@nestjs/common';
import { PageHomeService } from './page-home.service';
import { PageGetDto  } from './dto/page-get.dto';
import { get } from 'https';
@Controller()
export class PagesController {
    constructor(public readonly pageHomeService: PageHomeService) {}

    @Get('/api/pages/:id')
    async create(@Res() res, @Param() params: PageGetDto): Promise<any> {
        const id = params.id
        if(id === 'home'){
            return res.json(await this.pageHomeService.getContent())
        }
        return res.json({})
    }
}
