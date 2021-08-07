import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { SearchService } from '../search/search.service'
import { ProductsService } from "../products/products.service"
import { AddressService } from "../address/address.service"
import { CartService } from "./cart.service"
import { CheckoutDto  } from './dto/checkout.dto'
import { OrdersService } from '../orders/orders.service';
import { PAYMENT_METHODS, SHIPPING_METHODS  } from '../orders/orders.service'

@Injectable()
export class CheckoutService {
    constructor(readonly esService: SearchService,
        readonly productsService: ProductsService,
        readonly cartService: CartService,
        readonly ordersService: OrdersService,
        readonly addressService: AddressService,
        ) {}
    async shippingRates(userID: string, addressID: string) {
        const fees = []   
        const pick_province = "Hồ chí minh"
        const pick_district = 'Quận Tân Bình'
        const transport ='road'
        try{

            const { carts } = await this.cartService.getByUserID(userID)
  
            if(carts.length){
                const address:any = await this.addressService.get(addressID)

                if(!addressID) return
                for(let cart of carts){
                    const district = await this.addressService.getRegionName(address.district)
                    const weight = cart.weight > 100 ? cart.weight : 100 // gram
                    const province =  await this.addressService.getRegionName(address.province)
                    const value = cart.subtotal
                    const submit = {
                        pick_province, pick_district, district, 
                        weight,  province, value, transport,
                    }
                    const { fee } = await this.getShippingFeeGHTK(submit)
                    const days = 4
                    if(fee){
                        fees.push({ cart: cart.id, shipping_fee: fee.fee,  addressID, days})
                    }
                 
                }
            }

        }catch(error){
            console.log('shippingRates:', error)
        }
        return fees
    }
    async getShippingFeeGHTK({
        pick_province, pick_district, district,
        weight,  province, value, transport = 'road'
    }){
       try{
            let params: any = {
                pick_province, pick_district, district,
                weight,  province, value, transport,
                deliver_option:'none'
            }
        const { data } = await axios({
            method: 'post',
            url: 'https://services.giaohangtietkiem.vn/services/shipment/fee',
            headers: { 
              'Token': process.env.SHIPPING_KEY_GHTK
            },
            params
          })
         return data
    }catch(error){
        console.log('getShippingFeeByAddress:', error)
    }
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
