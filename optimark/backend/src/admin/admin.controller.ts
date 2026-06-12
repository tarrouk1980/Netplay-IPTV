import { Body, Controller, Get, Param, Patch, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminService } from './admin.service';

function AdminGuard() {
  return function (target: any, key: string, descriptor: PropertyDescriptor) { return descriptor; };
}

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  private checkAdmin(req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('Accès refusé');
  }

  @Get('stats')
  getStats(@Request() req: any) {
    this.checkAdmin(req);
    return this.adminService.getStats();
  }

  @Get('users')
  getUsers(@Request() req: any, @Query('page') page = '1', @Query('limit') limit = '20') {
    this.checkAdmin(req);
    return this.adminService.getUsers(parseInt(page), parseInt(limit));
  }

  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body('role') role: string, @Request() req: any) {
    this.checkAdmin(req);
    return this.adminService.updateUserRole(id, role);
  }

  @Patch('users/:id/verify')
  toggleVerified(@Param('id') id: string, @Request() req: any) {
    this.checkAdmin(req);
    return this.adminService.toggleUserVerified(id);
  }

  @Get('orders')
  getOrders(@Request() req: any, @Query('page') page = '1', @Query('limit') limit = '20') {
    this.checkAdmin(req);
    return this.adminService.getOrders(parseInt(page), parseInt(limit));
  }

  @Patch('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body('status') status: string, @Request() req: any) {
    this.checkAdmin(req);
    return this.adminService.updateOrderStatus(id, status);
  }

  @Get('products')
  getProducts(@Request() req: any, @Query('page') page = '1', @Query('limit') limit = '20') {
    this.checkAdmin(req);
    return this.adminService.getProducts(parseInt(page), parseInt(limit));
  }

  @Patch('products/:id/toggle')
  toggleProduct(@Param('id') id: string, @Request() req: any) {
    this.checkAdmin(req);
    return this.adminService.toggleProductActive(id);
  }

  @Get('orders/:id/invoice')
  getInvoice(@Param('id') id: string, @Request() req: any) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SELLER') throw new Error('Accès refusé');
    return this.adminService.getInvoice(id);
  }

  @Get('revenue-chart')
  revenueChart(@Request() req: any, @Query('days') days = '30') {
    this.checkAdmin(req);
    return this.adminService.getRevenueChart(parseInt(days));
  }
}
