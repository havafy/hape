import { 
    Controller, Get,Put, 
    Body, Res, Post, Param, 
    Delete, UseGuards } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopDto  } from './dto/shop.dto';
import { AuthGuard } from '@nestjs/passport';
@UseGuards(AuthGuard('jwt'))  
@Controller()
export class ShopController {
    constructor(
        public readonly addressService: ShopService
        ) {}


}
