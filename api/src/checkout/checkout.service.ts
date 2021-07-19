import { Injectable } from '@nestjs/common'
import { url } from 'inspector'
import { SearchService } from '../search/search.service'
import { ProductsService } from "../products/products.service"
import { CartService } from "./cart.service"
import { CheckoutDto  } from './dto/checkout.dto'
import { nanoid } from 'nanoid'
export const PAYMENT_METHODS = [
    'COD','ZALO_TRANSFER', 'MOMO_TRANSFER', 'BANK_TRANSFER',
    'VNPAY_TRANSFER', 'VIETTEL_TRANSFER',
    'VNPAY', 'PAYPAL'
]
export const SHIPPING_METHODS = [
    'UPS','BY_SHOP', 'VNPOST', 'GHN', 'GHTK', 'NINJAVAN'
]
const ES_INDEX_ORDER = 'orders'
@Injectable()
export class CheckoutService {
    constructor(readonly esService: SearchService,
        readonly productsService: ProductsService,
        readonly cartService: CartService) {}
    
    async getOrderUniqueNumber (){
        let orderNumber =  nanoid(10).toUpperCase()
        try{
            let i = 0
            while(true){
                const { body: { 
                    hits: { 
                        total, 
                        hits 
                    } } } = await this.esService.findBySingleField(
                        ES_INDEX_ORDER,  { orderNumber })
                const count = total.value
                if(!count){
                    return orderNumber
                }
                i++
                if(i > 10) break
            }
   
        }catch(err){
            if(err.meta.statusCode == 404){
                return orderNumber
            }
           
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
                const order = await this.createOrderByCart({
                    cart, userID
                 })
                 if(order){
                    orders.push(order)
                    payments.push({
                        payment: '', 
                        accountNumber: '',
                        accountName: ''
                    })
                 }
        
            }
            return {orders, payments}
        }catch(err){
            console.log(err)
        }
 
        return {}
    }
    async createOrderByCart({cart, userID}) {

        const cartData = await this.cartService.getCartByUser(userID, cart.shopID)
        console.log({cart, userID, cartData})
        //Not found any cart of this user and shop
        if(!cartData){
            return
        }
        // Begin to create order from cart
        const now = new Date();
        const createdAt = now.toISOString()
        const updatedAt = createdAt
        try{
            const orderNumber = await this.getOrderUniqueNumber()
            const cartID = cartData.id

            // sync cart to order
            delete cartData.id //clean up
            let order = {
                ...cartData,
                orderNumber,
                shipping: cart.shipping,
                payment: cart.payment,
                createdAt,
                updatedAt
            }

            // push order to ES
            const record: any = [{index: { _index: ES_INDEX_ORDER }}, order]
            const {  body: {items} } = await this.esService.createByBulk(ES_INDEX_ORDER, record);
            const orderID = items[0].index._id

            //get order information
            const { _source } =  await this.esService.findById(ES_INDEX_ORDER, orderID);

            //clean up the cart
            await this.cartService.remove(cartID)

            return {
             ..._source, 
             id: orderID
            }
          
        }catch (err){
            console.log(err)
        }
        return null

    }

}
