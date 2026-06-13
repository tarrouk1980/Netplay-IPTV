import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('suggestions')
  getSuggestions(@Query('q') q: string, @Query('limit') limit?: string) {
    return this.searchService.getSuggestions(q || '', limit ? Number(limit) : 8);
  }

  @Get('trending')
  getTrending(@Query('limit') limit?: string) {
    return this.searchService.getTrendingSearches(limit ? Number(limit) : 10);
  }

  @Get()
  search(
    @Query('q') q: string,
    @Query('type') type?: 'product' | 'service' | 'all',
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('isVerifiedSeller') isVerifiedSeller?: string,
  ) {
    return this.searchService.smartSearch(q || '', {
      type: type || 'all',
      category,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      isVerifiedSeller: isVerifiedSeller === 'true',
    });
  }
}
