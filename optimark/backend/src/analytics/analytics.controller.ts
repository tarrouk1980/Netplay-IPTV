import { Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('vendor')
  @UseGuards(JwtAuthGuard)
  getVendorAnalytics(@Request() req: any, @Query('period') period?: '7d' | '30d' | '3m') {
    return this.analyticsService.getVendorAnalytics(req.user.id, period || '30d');
  }

  @Get('platform')
  @UseGuards(JwtAuthGuard)
  getPlatformAnalytics() {
    return this.analyticsService.getPlatformAnalytics();
  }

  @Post('track/view/:productId')
  trackView(@Param('productId') productId: string, @Request() req: any) {
    const userId = req.user?.id;
    return this.analyticsService.trackProductView(productId, userId);
  }
}
