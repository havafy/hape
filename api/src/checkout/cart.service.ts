import { Injectable } from '@nestjs/common';
import axios from 'axios'
import { SearchService } from '../search/search.service';
import { ProductsService } from "../products/products.service";
import { AddressService } from '../address/address.service';
import { ShopService } from '../shop/shop.service';
import { AddToCartDto  } from './dto/add-to-cart.dto';
import { ShippingService } from './shipping.service';
import { CartDto  } from './dto/cart.dto';
const ES_INDEX_CART = 'carts'
const ES_INDEX_ORDER = 'orders'
@Injectable()
export class CartService {
    constructor(
        // readonly shippingService: ShippingService,
        readonly esService: SearchService,
        readonly productsService: ProductsService,
       
        readonly addressService: AddressService,
 
        readonly shopService: ShopService) {}

        async addToCart(userID: string, addToCartDto: AddToCartDto) {
            try {

                // load product
                //   - check this product is existing or not
                //   - get shopID
                // check any cart with this shopID and this user
                //   - IF existing: let update product to this cart
                //   - IF not: let create a new cart with this shopID and this user
                const { productID, quantity } = addToCartDto

                const {found, product} = await this.productsService.getRawProduct(productID)
                //check this product is existing or not
                if(!found || !product.status){
                    return {message: 'Product is not found.'}
                }
                const shopID = product.userID
                if(userID === shopID){
                    return {statusCode: 500}
                }
                 // check any cart with this shopID and this user
                const cart = await this.getCartByUser(userID, shopID)
    
                //IF existing: let update product to this cart
                if(cart){
                    return await this.update(cart, addToCartDto, userID)
        
                }
                // IF not: let create a new cart with this shopID and this user
                if(!cart && quantity > 0) { 
                    return await this.create({ productID, quantity , userID, shopID })
                }
              
            }catch (err){
 
            }
            return {
                cart: null,
                statusCode: 404,
            }
        }
        async getCartByUser(userID: string, shopID: string) {
          
          try{
                let must = [{match: { userID }}, {match: { shopID }}]
                const { body: { 
                    hits: { 
                        total, 
                        hits 
                    } } } = await this.esService.findByMultiFields({
                        index: ES_INDEX_CART, must })
                const count = total.value

                //IF existing: let update product to this cart
                if(count){
                    if(count > 1){
                        console.log('[ALERT] CART count over 1', userID)
                    }
                    const cart = hits[0]._source

                    return {
                        id: hits[0]._id,
                        ...cart
                    }
                }
            }catch (err){
                console.log(err)
            }
            return false

        }
 
        async update(cart: any, addToCartDto: AddToCartDto, userID: string) {
            const { productID, quantity, action = 'addToCart' } = addToCartDto
            try{
                if(!cart.id || !cart.items.length || !cart.items[0]){
                    return {message:"Cart is missing!"};
                }
    
                let found = false
                let i = 0
                for( const item of cart.items){
                    if(item.productID === productID){
                        found = true
                        break;
                    }
                    i++
                }
                // IF product is available from cart
                if(found){
                    if(action === 'addToCart'){
                        if(quantity > 0){
                            // increase quantity to this product
                            cart.items[i].quantity += quantity
                        }
                    }
  
                    if(action === 'setQuantity'){
                       if(quantity > 0){
                           // force to set quantity
                            cart.items[i].quantity = quantity 
                       }
                       if(quantity === 0){
                            // IF quantity is <= 0, let remove this item from cart
                            cart.items.splice(i,1)
                       }
                    }
                }else{ // IF product not existing on cart
                    if(quantity > 0){
                        // insert a new item to cart
                        cart.items.push({productID, quantity})
                    }
                }


                //IF items empty, let remove this cart
                if(cart.items.length === 0){
                    await this.esService.delete(ES_INDEX_CART, cart.id )
                }else{
                    await this.rebuildCart(cart)
                }

                //wait for ES running index
               //  await new Promise(f => setTimeout(f, 700));
                return await this.getByUserID(userID)
        
            }catch (err){
                console.log(err)
            }
            return {status: false}

        }
        async remove(cartID: string){
            return await this.esService.delete(ES_INDEX_CART, cartID )
        }
        async rebuildCart(cart: any){
            const cartID = cart.id
            const reCart = await this.calcGrandTotal(cart)
        
            const now = new Date();
            reCart.updatedAt = now.toISOString()
            await this.esService.update(ES_INDEX_CART, cartID ,reCart)
            const updated = await this.esService.findById(ES_INDEX_CART, cartID);
            return {
                cart: { id: cartID, ...updated._source },
                status: true
            }
        }
        async create(
                    {   productID, quantity,
                        userID, shopID
                    }:{
                        productID: string; 
                        quantity: number; 
                        userID: string; 
                        shopID: string;
                        }) {
            const now = new Date();
            const createdAt = now.toISOString()
            try{
                const cart = await this.calcGrandTotal({
                    userID, 
                    shopID,
                    items:[{productID, quantity}],
                    updatedAt: createdAt,
                    createdAt
                })
         
                const record: any = [{index: { _index: ES_INDEX_CART }}, cart]
    
                const {  body: {items} } = await this.esService.createByBulk(ES_INDEX_CART, record);
                const cartID = items[0].index._id
               //  await new Promise(f => setTimeout(f, 700));
                await this.esService.findById(ES_INDEX_CART, cartID);
                return await this.getByUserID(userID)
            }catch (err){
                // console.log(err)
            }
            return {status: false}

        }
        async calcGrandTotal(cart: any) {

            let subtotal = 0
            let grandTotal = 0
            let discount = 0
            let quantityTotal = 0
            let weight = 0
            try{
                let i = 0
                for(const { productID, quantity } of cart.items){
                    const {found, product} = await this.productsService.getRawProduct(productID)
                    cart.items[i].name = product.name
                    cart.items[i].price = product.price
                    cart.items[i].thumb = product.images[0]
                    cart.items[i].sku = product.sku
                    cart.items[i].regular_price = product.regular_price
                    
                    if(found && product.status){
                        const item_weight = (product.weight ? product.weight : 0) * quantity
                        weight += item_weight
                        cart.items[i].weight = item_weight

                        const item_total = product.price * quantity
                        cart.items[i].total = item_total
                        subtotal += item_total
        
                        quantityTotal += quantity
                        cart.items[i].productStatus = true
                        cart.items[i].active = true
                    }else{
                        cart.items[i].price = false
                        cart.items[i].productStatus = false
                    }
                    
                    i++
                }
    
            }catch (err){
            
            }
            grandTotal = subtotal
            return { 
                ...cart,
                subtotal,
                grandTotal,
                discount,
                weight,
                quantityTotal
            }

        }
        async getSummary(userID: string){
            const { body: { 
                hits: { 
                    total,
                    hits 
                } } } = await this.esService.findBySingleField(
                    ES_INDEX_CART, 
                    { userID }, 100, 0, 
                    [{"createdAt": "desc"}])
            const count = total.value
            let quantityTotal = 0

            if(count){
                for(let cart of hits){
                    quantityTotal += cart._source.quantityTotal
                }
            }
            return {
                quantityTotal
            }
         }
    async getByUserID(userID: string, collect: string = '', address = '', size: number = 100, from: number = 0) {
        const payments = ['COD']
        const shippings = [{code: 'FREE_SHIPPING', cost: 0}]
        const { body: { 
            hits: { 
                total, 
                hits 
            } } } = await this.esService.findBySingleField(
                ES_INDEX_CART, 
                { userID }, size, from, 
                [{"createdAt": "desc"}])
        const count = total.value
        let quantityTotal = 0
        let grandTotal = 0
        let shippingTotal = 0
        let carts = []

        if(count){
            let addressSelected: any = null
            if(address !== ''){
                addressSelected = await this.addressService.get(address)
            }else{
                addressSelected = await this.addressService.getDefault(userID)
            }
        
            for(let cart of hits){
                const shop = await this.shopService.getShopSummary(cart._source.shopID)
                const cartData = {
                    id: cart._id,
                    ...cart._source,
                    shop,
                    payments,
                    shippings
                  
                 }
                // get shipping fee by cart
                if(collect === 'address,payments,shippings' && addressSelected){
                    const feeRes = await this.getShippingFee({cart: cartData, address: addressSelected })
                    if(feeRes){
                        shippingTotal += feeRes.fee
                        cartData['shipping'] = feeRes
                    }
                }
                carts.push(cartData)
                quantityTotal += cart._source.quantityTotal
                grandTotal += cart._source.grandTotal
            }
        }
        let response: any = {
            count,
            grandTotal,
            quantityTotal,
            shippingTotal,
            carts
        }

        if(collect === 'address,payments,shippings'){
            const { addresses } = await this.addressService.getByUserID(userID, 10, 0)
            response = {
                ...response,
                addresses
            }
        }
        return response
    }
    async createIndex(){
        const existing = await this.esService.checkIndexExisting(ES_INDEX_CART)
        if(!existing){
            this.esService.createIndex(ES_INDEX_CART, { mappings: { 
                properties: {  name: { type: 'text'  }, createdAt: { type: 'date' },  }  
            } })
        }
    }
    //----------------------------------------

    async getRates(userID: string, addressID: string) {
        const fees = []   
        try{

            const { carts } = await this.getByUserID(userID)
  
            if(carts.length){
                const address:any = await this.addressService.get(addressID)

                if(!addressID) return
                for(let cart of carts){
                    const { fee, days } = await this.getShippingFee({ cart, address  })
                    if(fee){
                        fees.push({ cart: cart.id, shipping_fee: fee,  addressID, days})
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
            console.log(params)
            return data
        }catch(error){
            console.log('getShippingFeeByAddress:', error)
        }
    }
    async getShippingFee({cart, address}){
        const pick_province = "Hồ chí minh"
        const pick_district = 'Quận Tân Bình'
        const district = await this.addressService.getRegionName(address.district)
        const weight = cart.weight > 100 ? cart.weight : 100 // gram
        const province =  await this.addressService.getRegionName(address.province)
        const value = cart.subtotal
        const submit = {
            pick_province, pick_district, district, 
            weight,  province, value,
        }
        const { fee: {fee} } = await this.getShippingFeeGHTK(submit)
        const days = 4
        return  { fee, days }
    }
   
}
