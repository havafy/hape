import { Injectable } from '@nestjs/common'
import { url } from 'inspector'
import { SearchService } from '../search/search.service'
import { ProductsService } from "../products/products.service"
import { CartService } from "./cart.service"
import { CheckoutDto  } from './dto/checkout.dto'
import { OrdersService } from '../orders/orders.service';
import { PAYMENT_METHODS, SHIPPING_METHODS  } from '../orders/orders.service'

@Injectable()
export class CheckoutService {
    constructor(readonly esService: SearchService,
        readonly productsService: ProductsService,
        readonly cartService: CartService,
        readonly ordersService: OrdersService) {}
    
    async checkout(userID: string, checkoutDto: CheckoutDto) {
        try{
            let orders = []
            let payments = []
            for(let cart of checkoutDto.carts){
                //checking is correct Payment and Shipping
                if(!PAYMENT_METHODS.includes(cart.payment)){
                    return {message: 'Do not support this payment: ' + cart.payment}
                }
                if(!SHIPPING_METHODS.includes(cart.shipping)){
                    return {message: 'Do not support this shipping: ' + cart.shipping}
                }
                const order = await this.ordersService.createOrderByCart({
                    cart, userID
                 })
                 if(order){
                    orders.push(order)
                    payments.push({
                        payment: 'MOMO_TRANSFER', 
                        accountNumber: '4444',
                        accountName: 'Nguyen van a'
                    })
                 }
        
            }
            return {orders, payments, statusCode: 200}
        }catch(err){
            console.log(err)
        }
 
        return {}
    }
}
