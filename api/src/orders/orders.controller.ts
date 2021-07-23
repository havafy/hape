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
    async list(@Res() res): Promise<any> {
        const userID = res.req.user.id
        let {pageSize = 30, current = 1 } = res.req.query
        if(pageSize > 100){
            pageSize = 30
        } 
        const from = pageSize * (current -1 )
        return res.json(await this.ordersService.getByUserID(userID, pageSize, from))
    }

    @Get('/api/orders/:id')
    async get(@Res() res, @Param() params: any): Promise<any> {
        const id = params.id
        const userID = res.req.user.id
        const data = await this.ordersService.getOrder(id, userID)
        return res.json(data)
    }

}
