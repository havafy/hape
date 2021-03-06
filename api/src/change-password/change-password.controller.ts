import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ChangePasswordService } from '../change-password/change-password.service';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dto/change-password.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('api/auth/change-password')
export class ChangePasswordController {
  constructor(private readonly changePasswordService: ChangePasswordService) {}

  @Post()
  public async changePassword(
    @Res() res,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<any> {
    try {
      const userId = res.req.user.id
      await this.changePasswordService.changePassword(userId, changePasswordDto);

      return res.status(HttpStatus.OK).json({
        message: 'Request Change Password Successfully!',
        statusCode: 200,
      });
    } catch (err) {
      console.log(err)
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Error: Change password failed!',
        statusCode: 400,
      });
    }
  }
}
