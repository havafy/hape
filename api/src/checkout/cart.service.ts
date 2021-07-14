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
                if(!found || !product.status){
                    return {message: 'Product is not found.'}
                }
                const shopID = product.userID
            
                 // check any cart with this shopID and this user
                const cart = await this.getCartByUser(userID, shopID)
    
                //IF existing: let update product to this cart
                if(cart){
                    return await this.update(productID, quantity , cart)
        
                }else{  // IF not: let create a new cart with this shopID and this user
                    return await this.create({ productID, quantity , userID, shopID })
                }

                /* const checkWard = await this.getRegionName(addToCartDto.ward)
                if(checkWard === ''){
                    return {
                        status: false,
                        message: "An error occurred on Ward Number.",
                    }
                }
                const now = new Date();
                const createdAt = now.toISOString()
                if(addressDto.default){
                    await this.removeDefaultAnother(userID)
                }
                const record: any = [
                    { index: { _index: ES_INDEX_CART } },  {
                    ...addressDto,
                    userID,
                    updatedAt: createdAt,
                    createdAt
                }]
    
                const {  body: {items} } = await this.esService.createByBulk(ES_INDEX_ADDRESS, record);
                const addressID = items[0].index._id
                const { _source } =  await this.esService.findById(ES_INDEX_ADDRESS, addressID);
                return {
                    address: { ..._source, id: addressID},
                    status: true,
                }
                */
            }catch (err){
                return {
                    cart: null,
                    status: false,
                }
            }
            
        }
        async getCartByUser(userID: string, shopID: string) {
          
          try{
                    let must = [ 
                    {match: { userID }},
                    {match: { shopID }}
                ]
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
        
        async update(productID: string, quantity: number, cart: any) {
  
            try{
                if(!cart.id || !cart.items.length){
                    return {message:"Cart is missing!"};
                }
                const cartID = cart.id
          
                let found = false
                let i = 0
                for( const item of cart.items){
                    if(item.productID === productID){
                        found = true
                        break;
                    }
                    i++
                }
           
                // IF product is existing on cart
                if(found){
                    // increase quantity to this product
                    cart.items[i].quantity += quantity
                }else{ // IF product not existing on cart
                    cart.items.push({productID, quantity})
                }
                const reCart = await this.calcGrandTotal(cart)
        
                const now = new Date();
                reCart.updatedAt = now.toISOString()
                await this.esService.update(ES_INDEX_CART, cartID ,reCart)
                const updated = await this.esService.findById(ES_INDEX_CART, cartID);
                return {
                    address: { id: cartID, ...updated._source },
                    status: true
                }
        
         
            }catch (err){
                console.log(err)
            }
            return {status: false}


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
    
}
