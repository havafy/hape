import { MaxLength, MinLength, IsNotEmpty, IsEmail, IsString , IsNumber} from 'class-validator';

export class UserProfileDto {
  @IsString()
  @MaxLength(20)
  @MinLength(2)
  name: string;

  @IsString()
  @MaxLength(12)
  @MinLength(3)
  username: string;


  @MaxLength(14)
  @MinLength(8)
  phone: string;

  @IsEmail()
  @MinLength(5)
  @MaxLength(20)
  email: string;
}
