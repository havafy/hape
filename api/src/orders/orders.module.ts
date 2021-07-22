import { Module, OnModuleInit } from '@nestjs/common';
import { CartService } from '../checkout/cart.service';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { SearchModule } from '../search/search.module';
import { FilesService } from "../files/files.service";
import { ProductsService } from "../products/products.service";
import { AddressService } from '../address/address.service';
import { AddressModule } from '../address/address.module';
import { ShopModule } from '../shop/shop.module';
import { CheckoutModule } from '../checkout/checkout.module';
import { ShopService } from "../shop/shop.service";
@Module({
    imports: [SearchModule, AddressModule, ShopModule],
    providers: [
        CartService, 
        OrdersService, 
        FilesService, 
        ProductsService,
        AddressService,
        ShopService
    ],
    controllers: [OrdersController],
})
export class OrdersModule {}