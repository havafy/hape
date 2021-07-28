import { Module, OnModuleInit } from '@nestjs/common';
import { HomePageService } from './page-home.service';
import { CategoryPageService } from './page-category.service';
import { ProductPageService } from './page-product.service';
import { PagesController } from './pages.controller';
import { SearchModule } from '../search/search.module';
import { FilesService } from "../files/files.service";
import { ProductsService } from "../products/products.service";
import { StaticPageService } from './page-static.service';
import { CategoriesService } from '../products/categories.service';

@Module({
    imports: [SearchModule],
    providers: [
        HomePageService, 
        ProductPageService, 
        CategoryPageService, FilesService, 
        CategoriesService, ProductsService,
        StaticPageService
    ],
    controllers: [PagesController],
})
export class PagesModule {
    constructor(private staticPageService: StaticPageService) {}
    onModuleInit() {
        // import the data about province/city/ward 
        this.staticPageService.createIndex().then();
    }
}