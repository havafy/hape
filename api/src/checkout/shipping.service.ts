import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { SearchService } from '../search/search.service'
import { ProductsService } from "../products/products.service"
import { AddressService } from "../address/address.service"
import { CartService } from "./cart.service"

@Injectable()
export class ShippingService {
    constructor(readonly esService: SearchService,
        readonly productsService: ProductsService,
        readonly cartService: CartService,
        readonly addressService: AddressService,
        ) {}
   
}
