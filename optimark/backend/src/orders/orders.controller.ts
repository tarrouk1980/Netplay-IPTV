import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dtos/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto, @Request() req: any) {
    return this.ordersService.createOrder(dto, req.user.id);
  }

  @Get('me')
  getMyOrders(@Request() req: any) {
    return this.ordersService.getMyOrders(req.user.id);
  }

  @Get(':id/invoice')
  getInvoice(@Param('id') id: string, @Request() req: any) {
    return this.ordersService.getInvoice(id, req.user.id);
  }

  @Get(':id')
  getOrderById(@Param('id') id: string, @Request() req: any) {
    return this.ordersService.getOrderById(id, req.user.id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string, @Request() req: any) {
    return this.ordersService.updateStatus(id, status, req.user.id);
  }
}
