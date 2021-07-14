import {
  MaxLength, MinLength, 
  IsNumber , IsOptional, 
  Min, Max,
} from 'class-validator';

export class AddToCartDto {
 
  @MaxLength(70)
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
}
