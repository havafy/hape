import { Module, OnModuleInit } from '@nestjs/common';
import { HomePageService } from './page-home.service';
import { CategoryPageService } from './page-category.service';
import { PagesController } from './pages.controller';
import { SearchModule } from '../search/search.module';
import { FilesService } from "../files/files.service";
import { ProductsService } from "../products/products.service";
@Module({
    imports: [SearchModule],
    providers: [HomePageService, CategoryPageService, FilesService, ProductsService],
    controllers: [PagesController],
})
export class PagesModule {}