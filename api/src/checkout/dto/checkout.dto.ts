import {
  MaxLength, MinLength, 
  IsArray , ArrayMaxSize, 
  Min, Max,
} from 'class-validator';

export class CheckoutDto {
 
  @MaxLength(100)
  @MinLength(5)
  addressID: string;

  @IsArray()
  @ArrayMaxSize(10)
  options: Option[];
}

export class Option {

  @MaxLength(100)
  @MinLength(5)
  shopID: string;

  @MaxLength(10)
  @MinLength(2)
  shipping_method: string;

  @MaxLength(10)
  @MinLength(2)
  payment_method?: string;

  }