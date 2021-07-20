import {
  MaxLength, MinLength, 
  IsNumber , IsOptional, 
  Min, Max,
} from 'class-validator';

export class ShopDto {
  @IsOptional()
  @MaxLength(70)
  @MinLength(5)
  id: string;

  @MaxLength(100)
  @MinLength(3)
  userID: string;

  @MaxLength(50)
  @MinLength(3)
  name: string;

  @MaxLength(50)
  @MinLength(3)
  phoneNumber: string;

  @MaxLength(30)
  @MinLength(2)
  shopName: string;

  @IsOptional()
  @MaxLength(200)
  @MinLength(5)
  shopIcon?: string;

  @IsOptional()
  @MaxLength(200)
  @MinLength(5)
  coverBanner?: string;

  @IsOptional()
  @MaxLength(200)
  @MinLength(10)
  announcement?: string;

  @IsOptional()
  @MaxLength(500)
  @MinLength(3)
  messageToBuyers: string; // We include this message on receipt pages and in the email buyers receive when they purchase from your shop.

  @IsOptional()
  @MaxLength(300)
  @MinLength(3)
  returnsPolicy: string; 

  @IsOptional()
  @MaxLength(300)
  @MinLength(3)
  paymentPolicy: string; 

  @IsOptional()
  @MaxLength(300)
  @MinLength(3)
  shippingPolicy: string; 


  @IsOptional()
  @MaxLength(1000)
  @MinLength(3)
  questionAndAnswer: string; 

  @IsOptional()
  default: boolean; 
  
  @IsOptional()
  updatedAt: string

  
}
