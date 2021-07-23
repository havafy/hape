import {
  MaxLength
} from 'class-validator';

export class OrderUpdateDto {

  @MaxLength(10)
  paymentStatus: string; // waiting, completed, fail

  @MaxLength(20)
  status: string; //   'COMPLETED','PENDING', 'PROCESSING','SHIPPING', 'SHIPPING_FAIL', 'CANCELLED'

}