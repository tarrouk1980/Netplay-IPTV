import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LoyaltyService } from './loyalty.service';

@Controller('loyalty')
export class LoyaltyController {
  constructor(private loyaltyService: LoyaltyService) {}

  @UseGuards(JwtAuthGuard)
  @Get('balance')
  getBalance(@Request() req: any) {
    return this.loyaltyService.getBalance(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('redeem')
  redeem(@Request() req: any, @Body('points') points: number) {
    return this.loyaltyService.redeem(req.user.id, Math.floor(Number(points) || 0));
  }
}
