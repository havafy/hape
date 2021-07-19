import {
  MaxLength, MinLength, 
  IsArray , ArrayMaxSize
} from 'class-validator';

export class CheckoutDto {
 
  @MaxLength(100)
  @MinLength(5)
  addressID: string;

  @IsArray()
  @ArrayMaxSize(20)
  carts: Cart[];
}

export class Cart {

  @MaxLength(100)
  @MinLength(5)
  shopID: string;

  @MaxLength(10)
  @MinLength(2)
  shipping: string;

  @MaxLength(10)
  @MinLength(2)
  payment: string;

  }