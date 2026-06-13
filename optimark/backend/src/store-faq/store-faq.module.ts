import { Module } from '@nestjs/common';
import { StoreFaqController } from './store-faq.controller';
import { StoreFaqService } from './store-faq.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StoreFaqController],
  providers: [StoreFaqService],
})
export class StoreFaqModule {}
