import {
  MaxLength, MinLength, 
  IsNumber , IsOptional, 
  Min, Max,
} from 'class-validator';

export class OrderDto {
  @MaxLength(100)
  @MinLength(5)
  userID: string;

  @MaxLength(100)
  @MinLength(5)
  orderNumber: string;

  @MaxLength(100)
  @MinLength(5)
  shopID: string;

  items: Items[];

  @IsOptional()
  coupons: string[]

  @IsNumber()
  subtotal: number;

  @IsNumber()
  @Min(1)
  @Max(10000)
  weight: number;

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

  @MaxLength(300)
  @MinLength(5)
  sku: string;
  
  @IsNumber()
  @Min(1)
  @Max(10000)
  weight: number;

}