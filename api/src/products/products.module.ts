import { Module, OnModuleInit } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SearchModule } from '../search/search.module';
import { FilesService } from "../files/files.service";
@Module({
    imports: [SearchModule],
    providers: [ProductsService, FilesService],
    controllers: [ProductsController],
})
export class ProductsModule implements OnModuleInit {
    constructor(private productService: ProductsService) {}
    onModuleInit() {
        this.productService.createIndex().then();
    }
}
