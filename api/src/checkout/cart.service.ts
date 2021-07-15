import { Injectable } from '@nestjs/common';
import { url } from 'inspector';
import { SearchService } from '../search/search.service';
import { ProductsService } from "../products/products.service";
import { AddToCartDto  } from './dto/add-to-cart.dto';
import { CartDto  } from './dto/cart.dto';
const ES_INDEX_CART = 'carts'
const ES_INDEX_ORDER = 'orders'
@Injectable()
export class CartService {
    constructor(readonly esService: SearchService,
        readonly productsService: ProductsService) {}

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
            
                 // check any cart with this shopID and this user
                const cart = await this.getCartByUser(userID, shopID)
    
                //IF existing: let update product to this cart
                if(cart){
                    return await this.update(cart, addToCartDto, userID)
        
                }else{  // IF not: let create a new cart with this shopID and this user
                    return await this.create({ productID, quantity , userID, shopID })
                }
              
            }catch (err){
                return {
                    cart: null,
                    status: false,
                }
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
                    return {
                            id: hits[0]._id,
                            ...hits[0]._source, 
                        }
                }
            }catch (err){

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
                        // increase quantity to this product
                        cart.items[i].quantity += quantity
                    }
  
                    if(action === 'setQuantity'){
                       if(quantity > 0){
                           // force to set quantity
                            cart.items[i].quantity = quantity 
                       }else{
                           // IF quantity is <= 0, let remove this item from cart
                            delete cart.items[i]
                       }
                    }
                }else{ // IF product not existing on cart
                    if(quantity > 0){
                        // insert a new item to cart
                        cart.items.push({productID, quantity})
                    }
                }
               // return {cart, addToCartDto}
                //IF items empty, let remove this cart
                if(!cart.items.length || !cart.items[0]){
                    await this.esService.delete(ES_INDEX_CART, cart.id )
                    return {status: true, cart: null}
                }
                await this.rebuildCart(cart)

                //wait for ES running index
               //  await new Promise(f => setTimeout(f, 700));
                return await this.getByUserID(userID)
        
            }catch (err){
                console.log(err)
            }
            return {status: false}

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
                    {productID, quantity, userID, shopID}: 
                    {
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
                const { _source } =  await this.esService.findById(ES_INDEX_CART, cartID);
                return {
                    cart: { ..._source, id: cartID},
                    status: true,
                }
            }catch (err){
                console.log(err)
            }
            return {status: false}

        }
        async calcGrandTotal(cart: any) {

            let subtotal = 0
            let grandTotal = 0
            let discount = 0
            let shippingCost = 0
            let quantityTotal = 0
            try{
                let i = 0
                for(const { productID, quantity } of cart.items){
                    const {found, product} = await this.productsService.getRawProduct(productID)
                    cart.items[i].name = product.name
                    cart.items[i].price = product.price
                    cart.items[i].thumb = product.images[0]
                    if(found && product.status){
                        cart.items[i].total = product.price * quantity
                        subtotal += product.price * quantity
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
                shippingCost,
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
    async getByUserID(userID: string,  size: number = 100, from: number = 0) {
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
        let carts = []
        if(count){
            for(let cart of hits){
                carts.push({
                    id: cart._id,
                    ...cart._source,
                  
                 })
                 quantityTotal += cart._source.quantityTotal
            }
        }
        return {
            count,
            size,
            from,
            quantityTotal,
            carts
        }
    }
    
}
