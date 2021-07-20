import {
  Controller,
  Put,
  Get,
  Body,
  Res,
  Param,
  UseGuards,
  HttpStatus,
  NotFoundException,
} from "@nestjs/common";
import { CartService } from "../checkout/cart.service";
import { UsersService } from "./users.service";
import { AuthGuard } from "@nestjs/passport";
import { UserProfileDto } from "./dto/user-profile.dto";
import { IUsers } from "./interfaces/users.interface";
import { ShopService } from '../shop/shop.service';

@UseGuards(AuthGuard("jwt"))
@Controller("/api/users")
export class UsersController {
  constructor(private readonly usersService: UsersService,
    private readonly cartService: CartService,
    readonly shopService: ShopService
    ) {}

  @Get("/profile")
  public async getUser(@Res() res ): Promise<IUsers> {
    const userId = res.req.user.id
    const user = await this.usersService.findById(userId);
    const carts = await this.cartService.getSummary(userId)
    const shop = await this.shopService.getByUserID(userId)
    if (!user) {
      throw new NotFoundException("User does not exist!");
    }
    delete user.password
    return res.status(HttpStatus.OK).json({
      user: user,
      carts,
      shop,
      status: 200,
    });
  }

  @Put("/profile")
  public async updateProfileUser(
    @Res() res,
    @Body() userProfileDto: UserProfileDto
  ): Promise<any> {
    try {
      const userId = res.req.user.id
  
      return res.status(HttpStatus.OK).json( 
         await this.usersService.updateProfileUser(userId, userProfileDto)
         );
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: "Error: User not updated!",
        status: 400,
      });
    }
  }
}
