import { MaxLength, MinLength } from 'class-validator';

export class PageGetDto {

  @MaxLength(100)
  @MinLength(3)
  id: string;

}