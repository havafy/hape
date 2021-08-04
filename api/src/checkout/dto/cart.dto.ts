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
  @Min(1)
  @Max(10000)
  quantityTotal: number;


  @IsOptional()
  @IsNumber()
  grandTotal: number;

  @IsOptional()
  updatedAt: string

  @IsOptional()
  createdAt: string

}
export class Items {

  @IsOptional()
  active: boolean;

  @IsOptional()
  productStatus: boolean; // this product Out of stock or disabled

  @MaxLength(100)
  @MinLength(5)
  productID: string;
  
  @IsNumber()
  @Min(1)
  @Max(10000)
  quantity: number;

  @IsOptional()
  @MaxLength(20)
  @MinLength(1)
  variant: string;

  @IsNumber()
  @Min(1)
  @Max(10000)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  regular_price: number;
  
  @IsNumber()
  @Min(1)
  @Max(10000)
  total: number;

  @MaxLength(150)
  @MinLength(3)
  name: string;

  @MaxLength(300)
  @MinLength(5)
  thumb: string;

  @IsOptional()
  @MaxLength(300)
  @MinLength(5)
  sku: string;

}