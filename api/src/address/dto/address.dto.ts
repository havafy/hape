import {
  MaxLength, MinLength, 
  IsNumber , IsOptional, 
  Min, Max,
} from 'class-validator';

export class AddressDto {
  @IsOptional()
  @MaxLength(70)
  @MinLength(5)
  id: string;

  @MaxLength(50)
  @MinLength(3)
  fullName: string;

  @MaxLength(50)
  @MinLength(3)
  phoneNumber: string;

  @MaxLength(20)
  @MinLength(2)
  province: string;
  
  @MaxLength(20)
  @MinLength(2)
  district: string;

  @MaxLength(20)
  @MinLength(2)
  ward: string;

  @MaxLength(100)
  @MinLength(3)
  address: string;

  @IsOptional()
  @MaxLength(10)
  @MinLength(3)
  addressType: string; // home or office

  @IsOptional()
  default: boolean; 
  
  @IsOptional()
  updatedAt: string

  
}
