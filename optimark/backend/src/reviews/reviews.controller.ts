import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateReviewDto } from './dtos/create-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateReviewDto, @Request() req: any) {
    return this.reviewsService.create(dto, req.user.id);
  }

  @Get('product/:productId')
  getByProduct(@Param('productId') productId: string) {
    return this.reviewsService.getByProduct(productId);
  }

  @Get('service/:serviceId')
  getByService(@Param('serviceId') serviceId: string) {
    return this.reviewsService.getByService(serviceId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('seller')
  getForSeller(@Request() req: any) {
    return this.reviewsService.getForSeller(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/reply')
  reply(@Param('id') id: string, @Body('reply') reply: string, @Request() req: any) {
    return this.reviewsService.sellerReply(id, req.user.id, reply);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyReviews(@Request() req: any) {
    return this.reviewsService.getMyReviews(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteReview(@Param('id') id: string, @Request() req: any) {
    return this.reviewsService.delete(id, req.user.id);
  }
}
