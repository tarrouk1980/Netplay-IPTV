import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FlashSalesService } from './flash-sales.service';

@Controller('flash-sales')
export class FlashSalesController {
  constructor(private flashSalesService: FlashSalesService) {}

  @Get('active')
  getActive() { return this.flashSalesService.getActive(); }

  @Get('upcoming')
  getUpcoming() { return this.flashSalesService.getUpcoming(); }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getBySeller(@Request() req: any) { return this.flashSalesService.getBySeller(req.user.id); }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() body: any) { return this.flashSalesService.create(req.user.id, body); }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/toggle')
  toggle(@Request() req: any, @Param('id') id: string) { return this.flashSalesService.toggle(id, req.user.id); }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Request() req: any, @Param('id') id: string) { return this.flashSalesService.delete(id, req.user.id); }
}
