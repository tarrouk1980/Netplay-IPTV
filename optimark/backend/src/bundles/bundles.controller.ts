import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BundlesService } from './bundles.service';

@Controller('bundles')
export class BundlesController {
  constructor(private bundlesService: BundlesService) {}

  @Get()
  findAll(@Query('sellerId') sellerId?: string) {
    return this.bundlesService.findAll(sellerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bundlesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: any, @Request() req: any) {
    return this.bundlesService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
    return this.bundlesService.update(id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.bundlesService.remove(id, req.user.id);
  }
}
