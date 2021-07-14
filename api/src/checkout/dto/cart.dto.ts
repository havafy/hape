import {
  MaxLength, MinLength, 
  IsNumber , IsOptional, 
  Min, Max,
} from 'class-validator';

export class CartDto {
  @MaxLength(100)
  @MinLength(5)
  userID: string;

  @MaxLength(100)
  @MinLength(5)
  shopID: string;

  items: Items[];

  @IsOptional()
  coupons: string[]

  @IsOptional()
  @IsNumber()
  subtotal: number;

  @IsOptional()
  @IsNumber()
  discount: number;

  @IsOptional()
  @IsNumber()
  shippingCost: number;

  @IsOptional()
  @IsNumber()
  grandTotal: number;

  @IsOptional()
  updatedAt: string

  @IsOptional()
  createdAt: string

}
export class Items {

  @MaxLength(100)
  @MinLength(5)
  productID: string;
  
  @IsNumber()
  @Min(1)
  @Max(10000)
  quantity: number;

}