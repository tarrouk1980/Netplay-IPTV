import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddressesService } from './addresses.service';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private addressesService: AddressesService) {}

  @Get()
  getAll(@Request() req: any) {
    return this.addressesService.getAll(req.user.id);
  }

  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.addressesService.create(req.user.id, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() body: any) {
    return this.addressesService.update(id, req.user.id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.addressesService.delete(id, req.user.id);
  }
}
