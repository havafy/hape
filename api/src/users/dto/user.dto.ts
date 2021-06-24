import { MaxLength, MinLength, IsNotEmpty, IsEmail, IsString } from "class-validator";

export class UserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  readonly name: string;

  @IsString()
  @MaxLength(20)
  @MinLength(4)
  readonly username: string;

  @IsEmail()
  @MinLength(5)
  @MaxLength(20)
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(60)
  password: string;
}
