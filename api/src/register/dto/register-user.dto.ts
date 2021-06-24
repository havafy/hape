import { MaxLength, MinLength, IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class RegisterUserDto {
  readonly id: number;

  @IsString()
  @MaxLength(20)
  @MinLength(2)
  readonly name: string;

  @IsString()
  @MaxLength(20)
  @MinLength(4)
  readonly username: string;

  @IsEmail()
  @MaxLength(20)
  @MinLength(5)
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @MinLength(4)
  password: string;
}
