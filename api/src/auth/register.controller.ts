import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RecaptchaService } from './recaptcha.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { Not} from 'typeorm';
import { EmailDto } from './dto/email.dto';
import { LoginService } from './login.service';
import { JwtPayload } from './interfaces/jwt.payload';
import { UsersService } from '../users/users.service';
import * as cleanTextUtils from 'clean-text-utils';
import console = require('console');
@Controller()
export class RegisterController {
  constructor(
    private readonly registerService: RegisterService,
    private loginService: LoginService,
    private recaptchaService: RecaptchaService,
    private readonly usersService: UsersService,
    ) {}

  @Post('api/auth/register')
  public async register(
    @Res() res,
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<any> {
    try {
      const recaptchaValue = await this.recaptchaService.validate(registerUserDto.token)
      if(!recaptchaValue){
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Error: token is invalid!',
          status: 400,
        });
      }
      


      if(await this.usersService.findOne({ email: registerUserDto.email }) ){
        return {
          message: "Email này đã đăng ký.",
          status: 400
        }
      }
      const phone = this.getSlug(registerUserDto.phone)
      if(await this.usersService.findOne({ phone }) ){
        return {
          message: "Số điện thoại này đã đăng ký.",
          statusCode: 400
        }
      }
 
      const user = await this.registerService.register({...registerUserDto, phone})
      if(user && user.id){
        let accessToken = null
        const payload: JwtPayload = {
          id: user.id
        }

        accessToken = this.loginService.getAccessToken(payload)
        return res.status(HttpStatus.OK).json({
          message: 'User registration successfully!',
          accessToken,
          user: payload,
          status: 200,
        });
      }


    } catch (err) {
      console.log(err)
    }
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Error: User not registration!',
      status: 400,
    })
  }
  public getSlug (path: string){
    if(path === undefined) return
    path = path.replace(/^\/|\/$/g, '')
          .trim()
          .replace(/[&\/\\#”“!@$`’;,+()$~%.'':*^?<>{}]/g, '')
          .replace(/ /g, '').replace(/_/g, '')
          .replace(/-/g, '')
          .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
          .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
          .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
          .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
          .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
          .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
          .replace(/đ/g, 'd')
          .replace(/’/g, '')
      return cleanTextUtils.strip.nonASCII(path)
  }
  @Post('api/auth/checkEmail')
  public async checkEmail(
    @Res() res,
    @Body() emailDto: EmailDto,
  ): Promise<any> {
    try {  
      const status = await this.registerService.checkEmail(emailDto);
      return res.status(HttpStatus.OK).json({
          status
      })

    } catch (err) {
      console.log(err)
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Error!',
        status: 400,
      })
    }
  }
}
