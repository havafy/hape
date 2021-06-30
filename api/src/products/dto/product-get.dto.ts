import { MaxLength, MinLength } from 'class-validator';

export class ProductGetDto {

  @MaxLength(100)
  @MinLength(5)
  id: string;

}