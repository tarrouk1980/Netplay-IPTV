import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReturnsService } from './returns.service';

@Controller('returns')
@UseGuards(JwtAuthGuard)
export class ReturnsController {
  constructor(private returnsService: ReturnsService) {}

  @Post()
  create(@Request() req: any, @Body() body: { orderId: string; reason: string }) {
    return this.returnsService.create(req.user.id, body.orderId, body.reason);
  }

  @Get('my')
  findMy(@Request() req: any) {
    return this.returnsService.findByBuyer(req.user.id);
  }

  @Get('all')
  findAll() {
    return this.returnsService.findAll();
  }

  @Get('seller')
  findBySeller(@Request() req: any) {
    return this.returnsService.findBySeller(req.user.id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string; adminNote?: string }) {
    return this.returnsService.updateStatus(id, body.status, body.adminNote);
  }

  // ─── Loyalty ─────────────────────────────────────────
  @Get('loyalty')
  getLoyalty(@Request() req: any) {
    return this.returnsService.getLoyaltyPoints(req.user.id);
  }

  @Post('loyalty/redeem')
  redeemPoints(@Request() req: any, @Body() body: { points: number }) {
    return this.returnsService.redeemPoints(req.user.id, body.points);
  }
}
