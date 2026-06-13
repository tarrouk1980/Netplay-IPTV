import { Controller, Get, Param, Query, Request } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private recommendationsService: RecommendationsService) {}

  @Get('personalized')
  getPersonalized(@Request() req: any, @Query('limit') limit?: string) {
    const userId = req.user?.id;
    if (!userId) return this.recommendationsService.getTrendingProducts(Number(limit) || 8);
    return this.recommendationsService.getPersonalizedProducts(userId, Number(limit) || 8);
  }

  @Get('trending')
  getTrending(@Query('limit') limit?: string) {
    return this.recommendationsService.getTrendingProducts(Number(limit) || 8);
  }

  @Get('similar/:productId')
  getSimilar(@Param('productId') productId: string, @Query('limit') limit?: string) {
    return this.recommendationsService.getSimilarProducts(productId, Number(limit) || 8);
  }

  @Get('services')
  getServices(@Request() req: any, @Query('limit') limit?: string) {
    const userId = req.user?.id || '';
    return this.recommendationsService.getRecommendedServices(userId, Number(limit) || 8);
  }
}
