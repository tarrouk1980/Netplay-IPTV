import { Controller, Get, Post, Param, Req, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.favoritesService.findAll(req.user.id);
  }

  @Post(':productId/toggle')
  toggle(@Req() req: any, @Param('productId') productId: string) {
    return this.favoritesService.toggle(req.user.id, productId);
  }

  @Get(':productId/status')
  status(@Req() req: any, @Param('productId') productId: string) {
    return this.favoritesService.isFavorited(req.user.id, productId);
  }
}
