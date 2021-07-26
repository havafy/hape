import { MaxLength, MinLength, IsNotEmpty, IsEmail, IsString, IsNumber, IsOptional } from "class-validator";

export class UserDto {

  @IsString()
  @MaxLength(14)
  @MinLength(8)
  phone: string;

  @IsEmail()
  @MinLength(5)
  @MaxLength(20)
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(60)
  password: string;

  @IsOptional()
  @MaxLength(250)
  @MinLength(5)
  google_id: string;
}
