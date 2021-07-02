import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserDto } from '../users/dto/user.dto';
import { IUsers } from '../users/interfaces/users.interface';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
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
    try {
      if (loginDto.party === 'google') {
        return await this.loginByGoogle(loginDto);
      }
      if (loginDto.party === 'facebook') {
        return await this.loginByFacebook(loginDto);
      }
      
    } catch (err) {
      console.log(err);
      return {
        message: err.message,
        status: 400,
      };
    }
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
      delete userData.password
      return {
        expiresIn: process.env.EXPIRES_IN_JWT,
        accessToken: accessToken,
        user: userData,
        status: 200,
      };
    });
  }
  public getAccessToken(payload: JwtPayload) {
    return this.jwtService.sign({
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
      id: user.id,
    };

    const jwt = this.jwtService.sign(data);

    return {
      expiresIn: process.env.EXPIRES_IN_JWT,
      id: user.id,
      token: jwt,
    };
  }
  protected async loginByFacebook(loginDto: LoginByPartyDto) {
    try {
      const { data } = await axios.get(
        `https://graph.facebook.com/v2.3/me`,
        { params: { 
            access_token: loginDto.accessToken,
            fields: 'name,email,picture',
            locale: 'en_US',
            method:'get',
            sdk: 'joey',
            suppress_http_code:1
         } }
      );
     /*     {
    "name": "Kenzin Nguyen",
    "email": "ntnpro@gmail.com",
    "picture": {
        "data": {
            "height": 50,
            "is_silhouette": false,
            "url": "https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=10159160398303948&height=50&width=50&ext=1627411798&hash=AeQfGETDGnBfMnsauxU",
            "width": 50
        }
    },
    "id": "10159160398303948",

}*/      console.log(loginDto, data)


      if (data.id) {
        const avatar = data.picture.data.url;
        const name = data.name;
        const email = data.email;

        // Check existing email or google ID
        let user = await this.usersService.findOne({ email });
        // if not exist let create a new user
        if (!user) {
          let r = Math.random()
            .toString(36)
            .substring(7);
          const username = await this.usersService.getUniqueUserName(data.name);
          const userDto = {
            avatar,
            name,
            email,
            username,
            phone: null,
            password: r,
            facebook_id: data.id,
          };
          userDto.password = bcrypt.hashSync(userDto.password, 8);

          user = await this.usersService.create(userDto);
        }
        if(user){
          let fields: any = {
            avatar
          }
          if(user.facebook_id === null){
            fields.facebook_id = data.id
          }
          await this.usersService.saveByField(user.id, fields)
        }


        // return  user and accessToken
        const payload: JwtPayload = {
          username: user.username,
          id: user.id,
        };

        const accessToken = this.getAccessToken(payload);
        // remove unused fields and return to client
        delete user.password
        return {
          accessToken,
          user,
          expiresIn: process.env.EXPIRES_IN_JWT,
          status: 200,
        };
        /*
            {
          "id": "5654645645",
          "email": "test@gmail.com",
          "verified_email": true,
          "name": "ken nguyen",
          "given_name": "ken",
          "family_name": "nguyen",
          "picture": "https://lh3.googleusercontent.com/a-/AOh14Gja_TOygyzC8vCyJ7qtfMrX9hLM4pWZjQFDalhzUw=s96-c",
          "locale": "en"
      }
      */
      }
    } catch (err) {
      console.log(err);
      return {
        message: err.message,
        status: 400,
      };
    }
  }
  protected async loginByGoogle(loginDto: LoginByPartyDto) {
    try {
      const { data } = await axios.get(
        `https://www.googleapis.com/userinfo/v2/me`,
        {
          headers: { Authorization: `Bearer ${loginDto.accessToken}` },
        },
      );
      if (data.verified_email) {
        const avatar = data.picture;
        const name = data.name;
        const email = data.email;

        // Check existing email or google ID
        let user = await this.usersService.findOne({ email });
        // if not exist let create a new user
        if (!user) {
          let r = Math.random()
            .toString(36)
            .substring(7);
          const username = await this.usersService.getUniqueUserName(data.name);
          const userDto = {
            avatar,
            name,
            email,
            username,
            phone: null,
            password: r,
            google_id: data.id,
          };
          console.log('r:', r);
          userDto.password = bcrypt.hashSync(userDto.password, 8);

          user = await this.usersService.create(userDto);
        }
        if(user){
          let fields: any = {
            name,
            avatar
          }
          if(user.google_id === null){
            fields.google_id = data.id
          }
          await this.usersService.saveByField(user.id, fields)
        }

        // return  user and accessToken
        const payload: JwtPayload = {
          username: user.username,
          id: user.id,
        };

        const accessToken = this.getAccessToken(payload);
        // remove unused fields and return to client
        delete user.password
        return {
          accessToken,
          user,
          expiresIn: process.env.EXPIRES_IN_JWT,
          status: 200,
        };
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
    } catch (err) {
      console.log(err);
      return {
        message: err.message,
        status: 400,
      };
    }
  }
}
