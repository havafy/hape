import { Controller, Post, Body, Res} from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginDto } from './dto/login.dto';
import { LoginByPartyDto } from './dto/login-by-party.dto';
@Controller()
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('api/auth/login')
  public async login(@Res() res, @Body() loginDto: LoginDto): Promise<any> {
    let {role = ''} = res.req.query
    return res.json(await this.loginService.login(loginDto, role))
  }
  @Post('api/auth/loginByParty')
  public async loginByParty(@Body() loginDto: LoginByPartyDto): Promise<any> {
    return await this.loginService.loginByParty(loginDto);
  }
}
