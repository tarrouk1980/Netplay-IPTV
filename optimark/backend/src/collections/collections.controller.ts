import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CollectionsService } from './collections.service';

@Controller('collections')
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}

  @Get('seller/:sellerId')
  getPublicBySeller(@Param('sellerId') sellerId: string) {
    return this.collectionsService.getPublicBySeller(sellerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectionsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getMine(@Request() req: any) {
    return this.collectionsService.getBySeller(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.collectionsService.create(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.collectionsService.update(id, req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/products')
  addProduct(@Param('id') id: string, @Request() req: any, @Body('productId') productId: string) {
    return this.collectionsService.addProduct(id, req.user.id, productId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/products/:productId')
  removeProduct(@Param('id') id: string, @Param('productId') productId: string, @Request() req: any) {
    return this.collectionsService.removeProduct(id, req.user.id, productId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.collectionsService.delete(id, req.user.id);
  }
}
