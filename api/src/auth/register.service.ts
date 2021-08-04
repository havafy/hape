import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { RegisterUserDto } from './dto/register-user.dto';
import { IUsers } from './../users/interfaces/users.interface';
import { EmailDto } from './dto/email.dto';
import { nanoid  } from 'nanoid';
@Injectable()
export class RegisterService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService,
  ) {}

  public async checkEmail(emailDto: EmailDto): Promise<boolean> {
    const user = await this.usersService.findOne({email: emailDto.email});
    if(user){
      return true
    }
    return false
  }
  public async register(registerUserDto: RegisterUserDto): Promise<IUsers> {
    try{
      const email = registerUserDto.email.split('@')
      const username = await this.usersService.getUniqueUserName(email[0]);
      registerUserDto.password = bcrypt.hashSync(registerUserDto.password, 8);
      const verify_key = nanoid()
      this.sendMailConfirmEmail(registerUserDto, verify_key);

      return await this.usersService.create({
        ...registerUserDto, 
        username, 
        name: email[0], 
        email_verify: false,
        verify_key
      }
        );
    }catch (err) {
      console.log('register:', err)
    }

  }
  public async verifyEmail(key: string)  {
    try{
      const user = await this.usersService.findOne({verify_key: key, email_verify: false});
      if(user){
        user.email_verify = true
        user.verify_key = null
        await this.usersService.save(user);
        return true
      }
      return false
    }catch (err) {
      console.log('verifyEmail:', err)
    }

  }
  
  sendMailConfirmEmail(user, key: string): void {
    this.mailerService
      .sendMail({
        to: user.email,
        from: process.env.EMAIL_FROM,
        subject: 'Xác nhận email của bạn trên Hape.vn',
        text: 'Xác nhận email của bạn trên Hape.vn',
        template: './index',
        context: {
          title: 'Xác nhận email của bạn trên Hape.vn',
          description:
            "Cảm ơn bạn đã đăng ký tài khoản. Vui lòng xác nhận địa chỉ email "+user.email+" bên dưới và đăng ký nhận bản tin từ Hape để cập nhật tin tức mới nhất.",
          LinkURL: process.env.FRONTEND_URL + "api/auth/verify?key=" + key,
          LinkText: "Xác nhận email."
        },
      })
      .then(response => {
        console.log('User Registration: Send Mail successfully!');
      })
      .catch(err => {
        console.log('User Registration: Send Mail Failed!', err);
      });
  }
}
