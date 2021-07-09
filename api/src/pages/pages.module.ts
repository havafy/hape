import { Module, OnModuleInit } from '@nestjs/common';
import { PageHomeService } from './page-home.service';
import { PagesController } from './pages.controller';
import { SearchModule } from '../search/search.module';
import { FilesService } from "../files/files.service";
import { ProductsService } from "../products/products.service";
@Module({
    imports: [SearchModule],
    providers: [PageHomeService, FilesService, ProductsService],
    controllers: [PagesController],
})
export class PagesModule {}