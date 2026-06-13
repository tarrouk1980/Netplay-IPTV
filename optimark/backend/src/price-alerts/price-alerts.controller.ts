import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { PriceAlertsService } from './price-alerts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('price-alerts')
export class PriceAlertsController {
  constructor(private service: PriceAlertsService) {}

  @Post(':productId')
  @UseGuards(JwtAuthGuard)
  subscribe(@Req() req: any, @Param('productId') productId: string, @Body() body: { targetPrice?: number }) {
    return this.service.subscribe(req.user.id, productId, body.targetPrice);
  }

  @Delete(':productId')
  @UseGuards(JwtAuthGuard)
  unsubscribe(@Req() req: any, @Param('productId') productId: string) {
    return this.service.unsubscribe(req.user.id, productId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getMyAlerts(@Req() req: any) {
    return this.service.getMyAlerts(req.user.id);
  }

  @Get(':productId/status')
  @UseGuards(JwtAuthGuard)
  isSubscribed(@Req() req: any, @Param('productId') productId: string) {
    return this.service.isSubscribed(req.user.id, productId);
  }
}
