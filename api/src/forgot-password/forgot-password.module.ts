import { Module } from "@nestjs/common";
import { ForgotPasswordService } from "./forgot-password.service";
import { ForgotPasswordController } from "./forgot-password.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "../users/entities/users.entity";
import { UsersService } from "../users/users.service";
import { SearchModule } from '../search/search.module';
import { ShopModule } from '../shop/shop.module';
import { ShopService } from '../shop/shop.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users]), SearchModule, ShopModule],
  providers: [ForgotPasswordService, UsersService, ShopService],
  controllers: [ForgotPasswordController],
})
export class ForgotPasswordModule {}
