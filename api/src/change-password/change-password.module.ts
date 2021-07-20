import { Module } from "@nestjs/common";
import { ChangePasswordController } from "./change-password.controller";
import { ChangePasswordService } from "./change-password.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "../users/entities/users.entity";
import { UsersService } from "../users/users.service";
import { SearchModule } from '../search/search.module';
import { ShopModule } from '../shop/shop.module';
import { ShopService } from '../shop/shop.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users]),SearchModule, ShopModule],
  controllers: [ChangePasswordController],
  providers: [ChangePasswordService, UsersService, ShopService],
})
export class ChangePasswordModule {}
