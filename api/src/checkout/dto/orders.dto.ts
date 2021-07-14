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

  @IsNumber()
  subtotal: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  quantityTotal: number;

  @IsNumber()
  discount: number;

  @IsNumber()
  shippingCost: number;

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
  @Max(500)
  quantity: number;

  @IsOptional()
  @MaxLength(20)
  @MinLength(1)
  variant: string;

  @IsNumber()
  @Min(1)
  @Max(10000)
  price: number;

  @MaxLength(150)
  @MinLength(3)
  name: string;

  @MaxLength(300)
  @MinLength(5)
  thumb: string;

}