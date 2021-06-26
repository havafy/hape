import { MaxLength, IsNotEmpty, IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MaxLength(50)
  readonly email: string;

  
  @IsNotEmpty()
  @IsString()
  @MaxLength(60)
  readonly password: string;
}
