import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdsService } from './ads.service';

@Controller('ads')
@UseGuards(JwtAuthGuard)
export class AdsController {
  constructor(private adsService: AdsService) {}

  @Get()
  getCampaigns(@Request() req: any) {
    return this.adsService.getCampaigns(req.user.id);
  }

  @Get('stats')
  getStats(@Request() req: any) {
    return this.adsService.getStats(req.user.id);
  }

  @Post()
  createCampaign(@Request() req: any, @Body() body: any) {
    return this.adsService.createCampaign(req.user.id, body);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string, @Request() req: any) {
    return this.adsService.toggleCampaign(id, req.user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.adsService.deleteCampaign(id, req.user.id);
  }
}
