import { Controller, Post, Body } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginDto } from './dto/login.dto';
import { LoginByPartyDto } from './dto/login-by-party.dto';
@Controller()
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('api/auth/login')
  public async login(@Body() loginDto: LoginDto): Promise<any> {
    return await this.loginService.login(loginDto);
  }
  @Post('api/auth/loginByParty')
  public async loginByParty(@Body() loginDto: LoginByPartyDto): Promise<any> {
    return await this.loginService.loginByParty(loginDto);
  }
}
