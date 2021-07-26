import { Module, OnModuleInit } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { SearchModule } from '../search/search.module';
import { FilesModule } from '../files/files.module';
@Module({
    imports: [SearchModule, FilesModule],
    providers: [
        AddressService
    ],
    controllers: [AddressController],
})
export class AddressModule implements OnModuleInit {
    constructor(private addressService: AddressService) {}
    onModuleInit() {
        // import the data about province/city/ward 
        this.addressService.createRegionIndex().then();
        this.addressService.createAddressIndex().then();
    }
}
