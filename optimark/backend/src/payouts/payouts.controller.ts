import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payouts')
export class PayoutsController {
  constructor(private payouts: PayoutsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() body: { amount: number; bankInfo: any }) {
    return this.payouts.create(req.user.id, body);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMy(@Req() req: any) {
    return this.payouts.getMy(req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getAll() {
    return this.payouts.getAll();
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(@Param('id') id: string, @Body() body: { status: string; adminNote?: string }) {
    return this.payouts.updateStatus(id, body.status, body.adminNote);
  }
}
