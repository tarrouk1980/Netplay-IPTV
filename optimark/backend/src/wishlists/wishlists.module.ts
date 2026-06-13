import { Module } from '@nestjs/common';
import { WishlistsController } from './wishlists.controller';
import { WishlistsService } from './wishlists.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WishlistsController],
  providers: [WishlistsService],
})
export class WishlistsModule {}
