import { MaxLength, MinLength, IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class UserProfileDto {
  @IsString()
  @MaxLength(20)
  @MinLength(2)
  @IsNotEmpty()
  name: string;

  @IsString()
  @MaxLength(20)
  @MinLength(4)
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(20)
  email: string;
}
