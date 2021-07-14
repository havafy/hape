import { 
    Controller, Get,Put, 
    Body, Res, Post, Param, 
    Delete, UseGuards } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressDto  } from './dto/address.dto';
import { AddressActionDto  } from './dto/address-action.dto';
import { AuthGuard } from '@nestjs/passport';
@UseGuards(AuthGuard('jwt'))  
@Controller()
export class AddressController {
    constructor(
        public readonly addressService: AddressService
        ) {}

    @Post('/api/address')
    async create(@Res() res,  @Body() addressDto: AddressDto): Promise<any> {
        const userID = res.req.user.id
        const response = await this.addressService.create(userID, addressDto)
        return res.json({
            ...response
        })
    }
    @Get('/api/address')
    async getByUserID(@Res() res): Promise<any> {
        const userID = res.req.user.id
        const response = await this.addressService.getByUserID(userID, 100, 0 )
        return res.json(response)
    }
    @Put('/api/address')
    async update(@Res() res,  @Body() addressDto: AddressDto): Promise<any> {
        const userID = res.req.user.id
        const response = await this.addressService.update(userID, addressDto)
        return res.json(response)
    }
    @Put('/api/address/action')
    async action(@Res() res,  @Body() addressActionDto: AddressActionDto): Promise<any> {
        const userID = res.req.user.id
        const response = await this.addressService.action(userID, addressActionDto)
        return res.json(response)
    }

    @Delete('/api/address/:id')
    async delete(@Res() res, @Param() params: {id: string}): Promise<any> {
        const userID = res.req.user.id
        const id = params.id
        const data = await this.addressService.remove(userID, id)
        return res.json(data)
    }
    
    @Get('/api/regions')
    async regions(@Res() res): Promise<any> {
        let {parent = '' } = res.req.query
        return res.json(await this.addressService.getByParent(parent))
    }
}
