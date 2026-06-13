import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { StoreFaqService } from './store-faq.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('store-faq')
export class StoreFaqController {
  constructor(private readonly service: StoreFaqService) {}

  @Get('seller/:sellerId')
  getPublic(@Param('sellerId') sellerId: string) {
    return this.service.getPublic(sellerId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMy(@Request() req: any) {
    return this.service.getBySeller(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() dto: { question: string; answer: string }) {
    return this.service.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() dto: { question?: string; answer?: string; position?: number }) {
    return this.service.update(id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.service.delete(id, req.user.id);
  }
}
