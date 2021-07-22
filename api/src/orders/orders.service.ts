import { Injectable } from '@nestjs/common'
import { SearchService } from '../search/search.service'
import { CartService } from '../checkout/cart.service';
import { ProductsService } from "../products/products.service"
import { OrderDto  } from './dto/orders.dto'
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
export class OrdersService {
    constructor(readonly esService: SearchService,
        readonly productsService: ProductsService,
        readonly cartService: CartService
        ) {}
    async getByUserID(userID: string){
        return {userID}
    }
    async getOrderUniqueNumber (){
  
        try{
            let i = 0
            while(true){
                let orderNumber =  nanoid(10).toUpperCase()
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
           
        }
        return nanoid(20).toUpperCase()
    }
   
    async createOrderByCart({cart, userID}) {

        const cartData = await this.cartService.getCartByUser(userID, cart.shopID)
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
