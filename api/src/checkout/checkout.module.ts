import { Module, OnModuleInit } from '@nestjs/common';
import { CartService } from './cart.service';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { SearchModule } from '../search/search.module';
import { FilesService } from "../files/files.service";
import { ProductsService } from "../products/products.service";
import { AddressService } from '../address/address.service';
import { AddressModule } from '../address/address.module';
import { ShopModule } from '../shop/shop.module';
import { ShopService } from "../shop/shop.service";
@Module({
    imports: [SearchModule, AddressModule, ShopModule],
    providers: [
        CartService, 
        CheckoutService, 
        FilesService, 
        ProductsService,
        AddressService,
        ShopService
    ],
    controllers: [CheckoutController],
})
export class CheckoutModule {}