import { Module } from "@nestjs/common";
import { LoginService } from "./login.service";
import { LoginController } from "./login.controller";
import { RegisterController } from "./register.controller";
import { RegisterService } from "./register.service";
import { RecaptchaService } from "./recaptcha.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "../users/entities/users.entity";
import { JwtModule } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Users]),
    PassportModule.register({ defaultStrategy: "jwt", session: false }),
    JwtModule.register({
      secret: process.env.SECRET_KEY_JWT,
      signOptions: {
        expiresIn: process.env.EXPIRES_IN_JWT,
      },
    }),
  ],
  providers: [LoginService, RegisterService, RecaptchaService, UsersService, JwtStrategy],
  controllers: [LoginController, RegisterController],
})
export class AuthModule {}
