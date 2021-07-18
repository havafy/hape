import { Injectable } from '@nestjs/common';
import { url } from 'inspector';
import { SearchService } from '../search/search.service';
import { ProductsService } from "../products/products.service";
import { CheckoutDto  } from './dto/checkout.dto';

@Injectable()
export class CheckoutService {
    constructor(readonly esService: SearchService,
        readonly productsService: ProductsService) {}
    
    async checkout(userID: string, checkoutDto: CheckoutDto) {
  
     return {userID, checkoutDto}

    }

}
