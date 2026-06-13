import { IsArray, IsEnum, IsNumber, IsObject, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export enum PaymentMethod {
  KONNECT = 'KONNECT',
  PAYMEE = 'PAYMEE',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  CARD = 'CARD',
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsObject()
  deliveryAddress?: Record<string, any>;

  @IsOptional()
  @IsString()
  couponCode?: string;
}
