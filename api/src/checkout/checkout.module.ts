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
import { OrdersModule } from "../orders/orders.module";
import { OrdersService } from '../orders/orders.service';
import { CategoriesService } from '../products/categories.service';
@Module({
    imports: [SearchModule, AddressModule, ShopModule, OrdersModule],
    providers: [
        CartService, 
        CheckoutService, 
        FilesService, 
        ProductsService,
        AddressService,
        ShopService,
        OrdersService,
        CategoriesService
    ],
    controllers: [CheckoutController],
})
export class CheckoutModule {
    constructor(private cartService: CartService) {}
    onModuleInit() {
        this.cartService.createIndex().then();
    }
}