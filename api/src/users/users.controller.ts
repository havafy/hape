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

@UseGuards(AuthGuard("jwt"))
@Controller("/api/users")
export class UsersController {
  constructor(private readonly usersService: UsersService,
    private readonly cartService: CartService) {}

  @Get("/profile")
  public async getUser(@Res() res ): Promise<IUsers> {
    const userId = res.req.user.id
    const user = await this.usersService.findById(userId);
    const carts = await this.cartService.getSummary(userId)
    if (!user) {
      throw new NotFoundException("User does not exist!");
    }
    delete user.password
    return res.status(HttpStatus.OK).json({
      user: user,
      carts,
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
      await this.usersService.updateProfileUser(userId, userProfileDto);

      return res.status(HttpStatus.OK).json({
        message: "User Updated successfully!",
        status: 200,
      });
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: "Error: User not updated!",
        status: 400,
      });
    }
  }
}
