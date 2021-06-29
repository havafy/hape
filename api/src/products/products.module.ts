import { Module, OnModuleInit } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SearchModule } from '../search/search.module';

@Module({
    imports: [SearchModule],
    providers: [ProductsService],
    controllers: [ProductsController],
})
export class ProductsModule implements OnModuleInit {
    constructor(private productService: ProductsService) {}
    onModuleInit() {
        this.productService.createIndex().then();
    }
}
