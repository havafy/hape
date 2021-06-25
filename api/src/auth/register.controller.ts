import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RecaptchaService } from './recaptcha.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginService } from './login.service';
import { JwtPayload } from './interfaces/jwt.payload';
@Controller('api/auth/register')
export class RegisterController {
  constructor(
    private readonly registerService: RegisterService,
    private loginService: LoginService,
    private recaptchaService: RecaptchaService
    ) {}

  @Post()
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
      
      let accessToken = null

      const user = await this.registerService.register(registerUserDto);
      if(user){
        const payload: JwtPayload = {
          username: user.username,
          id: user.id,
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
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Error: User not registration!',
        status: 400,
      });
    }
  }
}
