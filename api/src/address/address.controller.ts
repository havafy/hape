import { Controller, Get,Put, Body, Res, Post, Param, Delete } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddToCartDto  } from './dto/add-to-cart.dto';
@Controller()
export class AddressController {
    constructor(
        public readonly addressService: AddressService
        ) {}

    @Put('/api/cart')
    async home(@Res() res, @Param() params: AddToCartDto): Promise<any> {

        return res.json({})
    }

}
