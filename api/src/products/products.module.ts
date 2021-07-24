import { Module, OnModuleInit } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CategoriesService } from './categories.service';
import { ProductsController } from './products.controller';
import { SearchModule } from '../search/search.module';
import { FilesService } from "../files/files.service";
@Module({
    imports: [SearchModule],
    providers: [ProductsService, FilesService, CategoriesService],
    controllers: [ProductsController],
})
export class ProductsModule implements OnModuleInit {
    constructor(
        private productService: ProductsService,
        private categoriesService: CategoriesService
        ) {}
    onModuleInit() {
        this.productService.createIndex().then();
        this.categoriesService.createIndex().then();
    }
}
