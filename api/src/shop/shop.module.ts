import { Module, OnModuleInit } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { SearchModule } from '../search/search.module';
import { FilesModule } from '../files/files.module';


@Module({
    imports: [SearchModule, FilesModule],
    providers: [
        ShopService
    ],
    controllers: [ShopController],
})
export class ShopModule{
    constructor(private shopService: ShopService) {}
    onModuleInit() {
        // import the data about province/city/ward 
        this.shopService.createIndex().then();
    }

}

