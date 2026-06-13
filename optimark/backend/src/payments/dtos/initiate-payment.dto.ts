import { IsNumber, IsString, Min } from 'class-validator';

export class InitiatePaymentDto {
  @IsString()
  orderId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  description: string;
}
