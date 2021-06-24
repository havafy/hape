import { MaxLength, IsNotEmpty, IsEmail, IsString, MinLength } from "class-validator";

export class ChangePasswordDto {

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(60)
  readonly password: string;
}
