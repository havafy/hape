import { MaxLength, MinLength, IsNotEmpty, IsEmail, IsString, IsNumber } from 'class-validator';

export class RegisterUserDto {
  readonly id: number;

  @IsString()
  @MaxLength(12)
  @MinLength(3)
  readonly username: string;

  @IsEmail()
  @MaxLength(50)
  @MinLength(5)
  readonly email: string;

  @MaxLength(512)
  @MinLength(5)
  readonly token: string;

  @MaxLength(14)
  @MinLength(8)
  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @MinLength(4)
  password: string;
}
