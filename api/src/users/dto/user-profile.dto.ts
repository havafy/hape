import { MaxLength, MinLength, IsOptional, IsEmail, IsString , IsNumber} from 'class-validator';

export class UserProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  @MinLength(3)
  username: string;

  @IsOptional()
  @MaxLength(14)
  @MinLength(8)
  phone: string;

  @IsOptional()
  @MaxLength(20)
  @MinLength(4)
  shopName: string;

  @IsOptional()
  @IsEmail()
  @MinLength(5)
  @MaxLength(100)
  email: string;
}
