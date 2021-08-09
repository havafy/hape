import { Controller, Get,Put, Body, Res, Post, Param, Delete, UseGuards} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderUpdateDto  } from './dto/order-update.dto';
import { AuthGuard } from '@nestjs/passport';

// @UseGuards(AuthGuard('jwt'))  
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
    @Get('/api/shop/orders')
    async shopList(@Res() res): Promise<any> {
        const userID = res.req.user.id
        let {pageSize = 30, current = 1 } = res.req.query
        if(pageSize > 100){
            pageSize = 30
        } 
        const from = pageSize * (current -1 )
        return res.json(await this.ordersService.getByShopID(userID, pageSize, from))
    }
    @Get('/api/orders/test')
    async test(): Promise<any> {
         const data = await this.ordersService.test()

        return data
    }
    @Get('/api/orders/:id')
    async get(@Res() res, @Param() params: any): Promise<any> {
        const id = params.id
        const userID = res.req.user.id
        const data = await this.ordersService.getOrder(id, userID)
        return res.json(data)
    }
    @Get('/api/shop/orders/:id')
    async getByShop(@Res() res, @Param() params: any): Promise<any> {
        const id = params.id
        const userID = res.req.user.id
        const data = await this.ordersService.getOrderByShop(id, userID)
        return res.json(data)
    }
    @Put('/api/shop/orders/:id')
    async updateByShop(@Res() res, @Param() params: any, @Body() orderUpdateDto: OrderUpdateDto): Promise<any> {
        const id = params.id
        const userID = res.req.user.id
        const data = await this.ordersService.updateOrderByShop(id, userID, orderUpdateDto)
        return res.json(data)
    }
}
