import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InitiatePaymentDto } from './dtos/initiate-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('konnect/initiate')
  initiateKonnect(@Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiateKonnect(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('paymee/initiate')
  initiatePaymee(@Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiatePaymee(dto);
  }

  @Get('konnect/verify/:paymentId')
  verifyKonnect(@Param('paymentId') paymentId: string) {
    return this.paymentsService.verifyPayment(paymentId, 'konnect');
  }

  @Get('paymee/verify/:paymentId')
  verifyPaymee(@Param('paymentId') paymentId: string) {
    return this.paymentsService.verifyPayment(paymentId, 'paymee');
  }
}
