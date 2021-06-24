import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class ChangePasswordService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService,
  ) {}

  public async changePassword(userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<any> {
    
    const user = await this.usersService.updateByPassword(
      userId,
      changePasswordDto.password,
    );
    this.sendMailChangePassword(changePasswordDto);
    return user
  }

  private sendMailChangePassword(user): void {
    this.mailerService
      .sendMail({
        to: user.email,
        from: process.env.EMAIL_FROM,
        subject: 'Change Password successful ✔',
        text: 'Change Password successful!',
        template: './index',
        context: {
          title: 'Change Password successful!',
          description:
            'Change Password Successfully! ✔, This is your new password: ' +
            user.password,
          nameUser: user.name,
        },
      })
      .then(response => {
        console.log('Change Password: Send Mail successfully!');
      })
      .catch(err => {
        console.log('Change Password: Send Mail Failed!');
      });
  }
}
