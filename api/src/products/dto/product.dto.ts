import {
  MaxLength, MinLength, 
  IsNumber ,IsNotEmpty, 
  IsArray, IsBoolean, 
  IsDate, IsOptional, 
  Min, Max,
  ArrayMinSize, ArrayMaxSize
} from 'class-validator';

export class ProductDto {
  @IsOptional()
  @MaxLength(70)
  @MinLength(10)
  id: string;

  @MaxLength(70)
  @MinLength(10)
  name: string;


  @MaxLength(70)
  @MinLength(5)
  sku: string;

  @IsOptional()
  @IsBoolean()
  status: boolean;

  @IsOptional()
  @MaxLength(250)
  @MinLength(10)
  url: string;

  
  @IsNumber()
  @Min(500)
  @Max(900000000)
  price: number;

  @MaxLength(100)
  @MinLength(3)
  category: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(500)
  @Max(100000000)
  priceDiscount: number;

  @IsOptional()
  @IsDate()
  discountBegin: Date;
  @IsOptional()
  @IsDate()
  discountEnd: Date;

  @IsNotEmpty()
  @MaxLength(1024)
  @MinLength(50)
  description: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(9)
  images: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  tags: string[];

  
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100000)
  weight: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100000)
  length: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100000)
  width: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100000)
  height: number;

  @IsOptional()
  @MaxLength(100)
  @MinLength(3)
  brand: string;

  @IsOptional()
  @MaxLength(100)
  @MinLength(3)
  countryOrigin: string;

  @IsOptional()
  @MaxLength(100)
  @MinLength(3)
  expiryDate: string;

  @IsOptional()
  updatedAt: string

}
