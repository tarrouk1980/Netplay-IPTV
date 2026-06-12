import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrent(@Request() req: any) {
    return this.subscriptionsService.getCurrentPlan(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upgrade')
  upgrade(@Request() req: any, @Body() body: { plan: string }) {
    return this.subscriptionsService.upgrade(req.user.id, body.plan);
  }
}
