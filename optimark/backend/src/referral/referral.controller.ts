import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReferralService } from './referral.service';

@Controller('referral')
export class ReferralController {
  constructor(private referralService: ReferralService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my-code')
  getMyCode(@Request() req: any) {
    return this.referralService.getMyCode(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('apply')
  applyReferral(@Request() req: any, @Body('code') code: string) {
    return this.referralService.applyReferral(req.user.id, code);
  }
}
