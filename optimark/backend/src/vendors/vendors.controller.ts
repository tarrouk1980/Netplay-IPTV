import { Controller, Get, Patch, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VendorsService } from './vendors.service';

@Controller('vendors')
@UseGuards(JwtAuthGuard)
export class VendorsController {
  constructor(private vendorsService: VendorsService) {}

  @Get('dashboard')
  getDashboard(@Request() req: any) {
    return this.vendorsService.getDashboard(req.user.id);
  }

  @Get('products')
  getProducts(@Request() req: any) {
    return this.vendorsService.getProducts(req.user.id);
  }

  @Get('orders')
  getOrders(@Request() req: any) {
    return this.vendorsService.getOrders(req.user.id);
  }

  @Patch('verify')
  requestVerification(@Request() req: any) {
    return this.vendorsService.requestVerification(req.user.id);
  }
}
