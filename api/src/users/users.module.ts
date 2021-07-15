import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { UsersService } from './users.service';
import { CartService } from "../checkout/cart.service";
import { UsersController } from './users.controller';
import { SearchModule } from '../search/search.module';
import { ProductsService } from '../products/products.service';
import { FilesService } from '../files/files.service';
@Module({
    imports: [
        TypeOrmModule.forFeature([Users]),
        SearchModule
    ],
    controllers: [UsersController],
    providers: [UsersService, CartService, ProductsService, FilesService]
})
export class UsersModule {}
