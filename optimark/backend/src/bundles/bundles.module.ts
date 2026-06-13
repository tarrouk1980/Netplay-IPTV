import { Module } from '@nestjs/common';
import { BundlesController } from './bundles.controller';
import { BundlesService } from './bundles.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BundlesController],
  providers: [BundlesService],
})
export class BundlesModule {}
