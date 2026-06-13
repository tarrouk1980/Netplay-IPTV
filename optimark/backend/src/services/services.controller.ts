import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateServiceDto } from './dtos/create-service.dto';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.servicesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMy(@Request() req: any) {
    return this.servicesService.findAll({ sellerId: req.user.id });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateServiceDto, @Request() req: any) {
    return this.servicesService.create(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateServiceDto>, @Request() req: any) {
    return this.servicesService.update(id, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.servicesService.remove(id, req.user.id);
  }
}
