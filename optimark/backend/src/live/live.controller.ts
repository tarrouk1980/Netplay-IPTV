import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LiveService } from './live.service';

@Controller('live')
export class LiveController {
  constructor(private liveService: LiveService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() body: { title: string; products: string[] },
    @Request() req: any,
  ) {
    return this.liveService.createLiveSession(req.user.id, body.title, body.products || []);
  }

  @Get()
  getAll() {
    return this.liveService.getLiveSessions();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMy(@Request() req: any) {
    return this.liveService.getVendorLiveSessions(req.user.id);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.liveService.getLiveSession(id);
  }

  @Patch(':id/end')
  @UseGuards(JwtAuthGuard)
  end(@Param('id') id: string, @Request() req: any) {
    return this.liveService.endLiveSession(id, req.user.id);
  }
}
