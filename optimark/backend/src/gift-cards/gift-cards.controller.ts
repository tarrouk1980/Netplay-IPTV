import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { GiftCardsService } from './gift-cards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('gift-cards')
export class GiftCardsController {
  constructor(private service: GiftCardsService) {}

  @Get('amounts')
  getAmounts() {
    return this.service.getAmounts();
  }

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  purchase(@Req() req: any, @Body('amount') amount: number) {
    return this.service.purchase(req.user.id, amount);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMy(@Req() req: any) {
    return this.service.getMy(req.user.id);
  }

  @Post('validate')
  validate(@Body('code') code: string) {
    return this.service.validate(code);
  }

  @Post('redeem')
  @UseGuards(JwtAuthGuard)
  redeem(@Body() body: { code: string; amount: number }) {
    return this.service.redeem(body.code, body.amount);
  }
}
