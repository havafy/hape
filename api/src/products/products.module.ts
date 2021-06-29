import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SearchModule } from '../search/search.module';

@Module({
    imports: [SearchModule],
    providers: [ProductsService],
    controllers: [ProductsController],
})
export class ProductsModule {}
