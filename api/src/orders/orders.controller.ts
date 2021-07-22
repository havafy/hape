import { Controller, Get,Put, Body, Res, Post, Param, Delete, UseGuards} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderDto  } from './dto/orders.dto';
import { AuthGuard } from '@nestjs/passport';
@UseGuards(AuthGuard('jwt'))  
@Controller()
export class OrdersController {
    constructor(
        public readonly ordersService: OrdersService,
        ) {}

    @Get('/api/orders')
    async get(@Res() res): Promise<any> {
        const userID = res.req.user.id
        return res.json(await this.ordersService.getByUserID(userID))
    }
   

}
