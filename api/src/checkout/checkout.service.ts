import { Injectable } from '@nestjs/common'
import axios from 'axios'
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
    async shippingRates(userID: string) {
        try{
            let params: any = {
                pick_province: 'Hà Nội',
                pick_district: 'Quận Hai Bà Trưng',
                district:'Quận Tân bình',
                address:'P.503 tòa nhà Auu Việt, số 1 Lê Đức Thọ',
                weight:100,
                province: "Hồ chí minh",
                value:10000,
                transport:'fly',
                deliver_option:'xteam',
                'tags%5B%5D': 1
            }
            const { data } = await axios({
                method: 'post',
                url: 'https://services.giaohangtietkiem.vn/services/shipment/fee',
                headers: { 
                  'Token': 'A5220eaffC2340Df093994eA106b7ce5F8cf40f2'
                },
                params
              })
             return data
        }catch(error){
            console.log('shippingRates:', error)
        }
        return {}
    }
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
                    cart, userID, addressID: checkoutDto.addressID
                 })
                 if(order){
                    orders.push(order)
                    payments.push({
                        // payment: 'MOMO_TRANSFER', 
                        // accountNumber: '4444',
                        // accountName: 'Nguyen van a'
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
