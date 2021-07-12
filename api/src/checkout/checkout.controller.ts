import { Controller, Get,Put, Body, Res, Post, Param, Delete } from '@nestjs/common';
import { CartService } from './cart.service';
import { CheckoutService } from './checkout.service';
import { AddToCartDto  } from './dto/add-to-cart.dto';
import { get } from 'https';
@Controller()
export class CheckoutController {
    constructor(public readonly homePageService: CheckoutService,
        public readonly categoryPageService: CartService,
        ) {}

    @Put('/api/cart')
    async home(@Res() res, @Param() params: AddToCartDto): Promise<any> {

        return res.json({})
    }

}
