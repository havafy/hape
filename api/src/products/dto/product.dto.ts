import { MaxLength, MinLength, IsNumber ,IsNotEmpty, IsArray, IsBoolean, IsDate, IsOptional } from 'class-validator';

export class ProductDto {
  @IsNotEmpty()
  @MaxLength(70)
  @MinLength(10)
  name: string;

  @IsOptional()
  @IsBoolean()
  status: boolean;

  @IsNotEmpty()
  @MaxLength(250)
  @MinLength(10)
  url: string;

  @IsNumber()
  price: number;

  @MaxLength(100)
  @MinLength(2)
  categorySlug: string;

  @IsNumber()
  priceOriginal: number;

  @IsDate()
  dealBegin: Date;

  @IsDate()
  dealEnd: Date;

  @IsNotEmpty()
  @MaxLength(1024)
  @MinLength(50)
  description: string;

  @IsArray()
  images: string[];

}
