import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProductDto } from './dtos/create-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.productsService.findAll(query);
  }

  @Get('featured')
  getFeatured() {
    return this.productsService.findAll({ isBestSeller: true } as any);
  }

  @Get('trending')
  getTrending() {
    return this.productsService.getTrending(8);
  }

  @Get('suggestions')
  getSuggestions(@Query('q') q: string) {
    return this.productsService.getSuggestions(q);
  }

  @Get(':id/similar')
  getSimilar(@Param('id') id: string) {
    return this.productsService.getSimilar(id);
  }

  @Get(':id/also-bought')
  getAlsoBought(@Param('id') id: string) {
    return this.productsService.getAlsoBought(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post(':id/view')
  trackView(@Param('id') id: string, @Request() req: any) {
    return this.productsService.trackView(id, req.user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateProductDto, @Request() req: any) {
    return this.productsService.create(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>, @Request() req: any) {
    return this.productsService.update(id, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  patch(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>, @Request() req: any) {
    return this.productsService.update(id, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.productsService.remove(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('bulk')
  bulkCreate(@Body('products') products: CreateProductDto[], @Request() req: any) {
    return this.productsService.bulkCreate(products, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/clone')
  clone(@Param('id') id: string, @Request() req: any) {
    return this.productsService.clone(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string, @Request() req: any) {
    return this.productsService.toggleActive(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recently-viewed')
  recentlyViewed(@Request() req: any) {
    return this.productsService.getRecentlyViewed(req.user.id);
  }
}
