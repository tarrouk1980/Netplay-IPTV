import { Module } from '@nestjs/common';
import { AddressesModule } from './addresses/addresses.module';
import { AdsModule } from './ads/ads.module';
import { GiftCardsModule } from './gift-cards/gift-cards.module';
import { PriceAlertsModule } from './price-alerts/price-alerts.module';
import { PayoutsModule } from './payouts/payouts.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { BundlesModule } from './bundles/bundles.module';
import { ReferralModule } from './referral/referral.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { QuestionsModule } from './questions/questions.module';
import { AdminModule } from './admin/admin.module';
import { MessagesModule } from './messages/messages.module';
import { CouponsModule } from './coupons/coupons.module';
import { ReturnsModule } from './returns/returns.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { FlashSalesModule } from './flash-sales/flash-sales.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { FavoritesModule } from './favorites/favorites.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { LiveModule } from './live/live.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SearchModule } from './search/search.module';
import { ServicesModule } from './services/services.module';
import { VendorsModule } from './vendors/vendors.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProductsModule,
    ServicesModule,
    OrdersModule,
    PaymentsModule,
    VendorsModule,
    ReviewsModule,
    RecommendationsModule,
    SearchModule,
    AnalyticsModule,
    LiveModule,
    FavoritesModule,
    NotificationsModule,
    AdminModule,
    MessagesModule,
    CouponsModule,
    ReturnsModule,
    SubscriptionsModule,
    FlashSalesModule,
    QuestionsModule,
    LoyaltyModule,
    ReferralModule,
    BundlesModule,
    WishlistsModule,
    PayoutsModule,
    PriceAlertsModule,
    GiftCardsModule,
    AdsModule,
    AddressesModule,
  ],
})
export class AppModule {}
