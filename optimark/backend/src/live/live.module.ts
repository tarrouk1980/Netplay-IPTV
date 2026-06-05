import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LiveController } from './live.controller';
import { LiveGateway } from './live.gateway';
import { LiveService } from './live.service';

@Module({
  imports: [PrismaModule],
  controllers: [LiveController],
  providers: [LiveService, LiveGateway],
  exports: [LiveService],
})
export class LiveModule {}
