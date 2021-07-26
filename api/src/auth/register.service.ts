import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { RegisterUserDto } from './dto/register-user.dto';
import { IUsers } from './../users/interfaces/users.interface';
import { EmailDto } from './dto/email.dto';
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

      this.sendMailRegisterUser(registerUserDto);

      return await this.usersService.create({...registerUserDto, username, name: email[0]});
    }catch (err) {
      console.log('register:', err)
    }

  }

  private sendMailRegisterUser(user): void {
    this.mailerService
      .sendMail({
        to: user.email,
        from: process.env.EMAIL_FROM,
        subject: 'Registration successful ✔',
        text: 'Registration successful!',
        template: './index',
        context: {
          title: 'Registration successfully',
          description:
            "You did it! You registered!, You're successfully registered.✔",
          nameUser: user.name,
        },
      })
      .then(response => {
        console.log('User Registration: Send Mail successfully!');
      })
      .catch(err => {
        console.log('User Registration: Send Mail Failed!');
      });
  }
}
