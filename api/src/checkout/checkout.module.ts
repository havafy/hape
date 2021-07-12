import { Module, OnModuleInit } from '@nestjs/common';
import { CartService } from './cart.service';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { SearchModule } from '../search/search.module';
import { FilesService } from "../files/files.service";
import { ProductsService } from "../products/products.service";
import { ElasticsearchService } from '@nestjs/elasticsearch';
@Module({
    imports: [SearchModule],
    providers: [
        CartService, 
        CheckoutService, 
        FilesService, 
        ProductsService,
        ElasticsearchService
    ],
    controllers: [CheckoutController],
})
export class CheckoutModule {}