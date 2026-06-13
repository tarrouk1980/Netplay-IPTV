import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CouponsService } from './coupons.service';

@Controller('coupons')
export class CouponsController {
  constructor(private couponsService: CouponsService) {}

  @Get('validate')
  validate(@Query('code') code: string, @Query('amount') amount: string) {
    return this.couponsService.validate(code, parseFloat(amount) || 0);
  }

  @Post('validate')
  validatePost(@Body() body: any) {
    return this.couponsService.validateCode(body.code);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMy(@Request() req: any) {
    return this.couponsService.findBySeller(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.couponsService.create(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/toggle')
  toggle(@Request() req: any, @Param('id') id: string) {
    return this.couponsService.toggle(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Request() req: any, @Param('id') id: string) {
    return this.couponsService.delete(id, req.user.id);
  }
}
