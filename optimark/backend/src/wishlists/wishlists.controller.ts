import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WishlistsService } from './wishlists.service';

@Controller('wishlists')
export class WishlistsController {
  constructor(private wishlistsService: WishlistsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getAll(@Request() req: any) {
    return this.wishlistsService.getAll(req.user.id);
  }

  @Get('public/:id')
  getPublic(@Param('id') id: string) {
    return this.wishlistsService.getPublic(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body('name') name: string, @Body('isPublic') isPublic: boolean, @Request() req: any) {
    return this.wishlistsService.create(req.user.id, name, isPublic);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
    return this.wishlistsService.update(id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.wishlistsService.delete(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/items')
  addItem(@Param('id') id: string, @Body('productId') productId: string, @Request() req: any) {
    return this.wishlistsService.addItem(id, req.user.id, productId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/items/:productId')
  removeItem(@Param('id') id: string, @Param('productId') productId: string, @Request() req: any) {
    return this.wishlistsService.removeItem(id, req.user.id, productId);
  }
}
