import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { IUsers } from '../users/interfaces/users.interface';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt.payload';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class LoginService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async validate(loginDto: LoginDto): Promise<IUsers> {
    return await this.usersService.findByEmail(loginDto.email);
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
