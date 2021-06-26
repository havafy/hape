import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { IUsers } from '../users/interfaces/users.interface';
import * as bcrypt from 'bcrypt';
import axios from 'axios'
import { JwtPayload } from './interfaces/jwt.payload';
import { LoginDto } from './dto/login.dto';
import { LoginByPartyDto } from './dto/login-by-party.dto';
@Injectable()
export class LoginService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async validate(loginDto: LoginDto): Promise<IUsers> {
    return await this.usersService.findByEmail(loginDto.email);
  }
  
  public async loginByParty(
    loginDto: LoginByPartyDto,
  ): Promise<any | { status: number; message: string }> {
    if(loginDto.party === 'google'){
      const { data } = await axios.get(
        `https://www.googleapis.com/userinfo/v2/me`, {
          headers: { Authorization: `Bearer ${loginDto.accessToken}` }
        })
      if(data.verified_email){
        const avatar = data.picture
        const name = data.name
        const email = data.email
        
        return {
          expiresIn: process.env.EXPIRES_IN_JWT,
          status: 200,
        };
      }
      /*
      {
    "id": "102514039483890396620",
    "email": "ntnpro@gmail.com",
    "verified_email": true,
    "name": "ken nguyen",
    "given_name": "ken",
    "family_name": "nguyen",
    "picture": "https://lh3.googleusercontent.com/a-/AOh14Gja_TOygyzC8vCyJ7qtfMrX9hLM4pWZjQFDalhzUw=s96-c",
    "locale": "en"
}
*/

    }
    throw new UnauthorizedException();
  }
  public async login(
    loginDto: LoginDto,
  ): Promise<any | { status: number; message: string }> {
    return this.validate(loginDto).then(userData => {
      if (!userData) {
        throw new UnauthorizedException();
      }

      const passwordIsValid = bcrypt.compareSync(
        loginDto.password,
        userData.password,
      );

      if (!passwordIsValid == true) {
        return {
          message: 'Authentication failed. Wrong password',
          status: 400,
        };
      }

      const payload: JwtPayload = {
        username: userData.username,
        id: userData.id,
      };

      const accessToken = this.getAccessToken(payload);

      return {
        expiresIn: process.env.EXPIRES_IN_JWT,
        accessToken: accessToken,
        user: payload,
        status: 200,
      };
    });
  }
  public getAccessToken(payload: JwtPayload) {
    return this.jwtService.sign( {
      username: payload.username,
      id: payload.id,
    });
  }
  public async validateUserByJwt(payload: JwtPayload) {
    // This will be used when the user has already logged in and has a JWT
    const user = await this.usersService.findById(payload.id);

    if (!user) {
      throw new UnauthorizedException();
    }
    return this.createJwtPayload(user);
  }

  protected createJwtPayload(user) {
    const data: JwtPayload = {
      username: user.username,
      id: user.id
    };

    const jwt = this.jwtService.sign(data);

    return {
      expiresIn: process.env.EXPIRES_IN_JWT,
      id: user.id,
      token: jwt,
    };
  }
}
