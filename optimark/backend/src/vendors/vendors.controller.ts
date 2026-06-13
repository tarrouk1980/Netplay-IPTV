import { Body, Controller, Get, Param, Patch, Post, Put, Query, Request, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VendorsService } from './vendors.service';

@Controller('vendors')
export class VendorsController {
  constructor(private vendorsService: VendorsService) {}

  @Get('top')
  getTopSellers(@Query('limit') limit?: string) {
    return this.vendorsService.getTopSellers(limit ? Number(limit) : 20);
  }

  @Get('store/public/:sellerId')
  getPublicStore(@Param('sellerId') sellerId: string) {
    return this.vendorsService.getPublicStore(sellerId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  getDashboard(@Request() req: any) {
    return this.vendorsService.getDashboard(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('products')
  getProducts(@Request() req: any) {
    return this.vendorsService.getProducts(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  getOrders(@Request() req: any) {
    return this.vendorsService.getOrders(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body() body: { status: string }, @Request() req: any) {
    return this.vendorsService.updateOrderStatus(id, body.status, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('store')
  getStore(@Request() req: any) {
    return this.vendorsService.getStore(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('store')
  upsertStore(@Request() req: any, @Body() body: any) {
    return this.vendorsService.upsertStore(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('earnings')
  getEarnings(@Request() req: any) {
    return this.vendorsService.getEarnings(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  getAnalytics(@Request() req: any) {
    return this.vendorsService.getAnalytics(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('store-visits')
  getStoreVisits(@Request() req: any) {
    return this.vendorsService.getStoreVisits(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/export-csv')
  async exportOrdersCsv(@Request() req: any, @Res() res: Response) {
    const csv = await this.vendorsService.exportOrdersCsv(req.user.id);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="commandes.csv"');
    res.send(csv);
  }

  @UseGuards(JwtAuthGuard)
  @Get('products/export-csv')
  async exportProductsCsv(@Request() req: any, @Res() res: Response) {
    const csv = await this.vendorsService.exportProductsCsv(req.user.id);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="produits.csv"');
    res.send(csv);
  }

  @UseGuards(JwtAuthGuard)
  @Get('revenue/daily')
  getDailyRevenue(@Request() req: any) {
    return this.vendorsService.getDailyRevenue(req.user.id, 30);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('verify')
  requestVerification(@Request() req: any) {
    return this.vendorsService.requestVerification(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':sellerId/follow')
  follow(@Param('sellerId') sellerId: string, @Request() req: any) {
    return this.vendorsService.toggleFollow(req.user.id, sellerId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('performance')
  getPerformance(@Request() req: any) {
    return this.vendorsService.getPerformanceScore(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('broadcast')
  broadcast(@Request() req: any, @Body('message') message: string) {
    return this.vendorsService.broadcastToFollowers(req.user.id, message);
  }

  @Get(':sellerId/follow/status')
  followStatus(@Param('sellerId') sellerId: string, @Request() req: any) {
    const followerId = req.user?.id;
    return this.vendorsService.getFollowStatus(followerId, sellerId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('products/:productId/featured')
  toggleFeatured(@Param('productId') productId: string, @Request() req: any) {
    return this.vendorsService.toggleFeatured(req.user.id, productId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('following/my')
  getFollowing(@Request() req: any) {
    return this.vendorsService.getFollowedSellers(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('products/bulk-price')
  bulkUpdatePrices(@Request() req: any, @Body('updates') updates: { id: string; price?: number; promoPrice?: number | null }[]) {
    return this.vendorsService.bulkUpdatePrices(req.user.id, updates);
  }

  @UseGuards(JwtAuthGuard)
  @Get('customers/top')
  getTopCustomers(@Request() req: any) {
    return this.vendorsService.getTopCustomers(req.user.id);
  }
}
