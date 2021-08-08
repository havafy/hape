import { Controller, Get,Put, Body, Res, Post, Param, Delete, UseGuards} from '@nestjs/common';
import { CartService } from './cart.service';
import { CheckoutService } from './checkout.service';
import { ShippingService } from './shipping.service';
import { AddToCartDto  } from './dto/add-to-cart.dto';
import { CheckoutDto  } from './dto/checkout.dto';
import { AuthGuard } from '@nestjs/passport';
@UseGuards(AuthGuard('jwt'))  
@Controller()
export class CheckoutController {
    constructor(
        public readonly cartService: CartService,
        public readonly checkoutService: CheckoutService,
        public readonly shippingService: ShippingService,
        ) {}

    @Post('/api/cart')
    async create(@Res() res,  @Body() addToCartDto: AddToCartDto): Promise<any> {
        const userID = res.req.user.id
        return res.json(await this.cartService.addToCart(userID, addToCartDto))
    }
    @Get('/api/cart')
    async get(@Res() res): Promise<any> {
        const userID = res.req.user.id
        let {collect = '' } = res.req.query
        return res.json(await this.cartService.getByUserID(userID, collect))
    }
    @Get('/api/shipping/rates')
    async rates(@Res() res): Promise<any> {
        const userID = res.req.user.id
        let {addressID = '' } = res.req.query
        return res.json(await this.cartService.getRates(userID, addressID))
    }
    @Post('/api/checkout')
    async checkout(@Res() res,  @Body() checkoutDto: CheckoutDto): Promise<any> {
        const userID = res.req.user.id
       
        return res.json(await this.checkoutService.checkout(userID, checkoutDto))
    }

}
