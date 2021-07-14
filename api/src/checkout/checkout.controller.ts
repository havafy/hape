import { Controller, Get,Put, Body, Res, Post, Param, Delete, UseGuards} from '@nestjs/common';
import { CartService } from './cart.service';
import { CheckoutService } from './checkout.service';
import { AddToCartDto  } from './dto/add-to-cart.dto';
import { AuthGuard } from '@nestjs/passport';
@UseGuards(AuthGuard('jwt'))  
@Controller()
export class CheckoutController {
    constructor(
        public readonly cartService: CartService,
        ) {}

    @Post('/api/cart')
    async create(@Res() res,  @Body() addToCartDto: AddToCartDto): Promise<any> {
        const userID = res.req.user.id
        return res.json(await this.cartService.addToCart(userID, addToCartDto))
    }

}
