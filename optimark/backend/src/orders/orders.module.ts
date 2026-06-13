import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { ReturnsModule } from '../returns/returns.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { ReferralModule } from '../referral/referral.module';

@Module({
  imports: [NotificationsModule, ReturnsModule, LoyaltyModule, ReferralModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
