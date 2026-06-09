import { Body, Controller, Get, Param, Patch, Put, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VendorsService } from './vendors.service';

@Controller('vendors')
export class VendorsController {
  constructor(private vendorsService: VendorsService) {}

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
  @Patch('verify')
  requestVerification(@Request() req: any) {
    return this.vendorsService.requestVerification(req.user.id);
  }
}
