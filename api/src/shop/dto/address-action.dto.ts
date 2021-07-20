import {
    MaxLength, MinLength, 
    IsNumber , IsOptional, 
    Min, Max,
  } from 'class-validator';
  
  export class AddressActionDto {
 
    @MaxLength(70)
    @MinLength(5)
    id: string;
  
    @MaxLength(20)
    @MinLength(3)
    action: string; // setIsDefault
  

    
  }
  