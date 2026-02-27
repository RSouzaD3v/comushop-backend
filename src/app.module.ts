import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module";
import { CompaniesModule } from "./modules/companies/companies.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { ProductsModule } from "./modules/products/products.module";
import { UsersModule } from "./modules/users/users.module";
import { CouponsModule } from "./modules/coupons/coupons.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { PromotionsModule } from "./modules/promotions/promotions.module";
import { BannersModule } from "./modules/banners/banners.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    CompaniesModule,
    ProductsModule,
    OrdersModule,
    UsersModule,
    CouponsModule,
    CategoriesModule,
    ReviewsModule,
    PromotionsModule,
    BannersModule,
    NotificationsModule,
    DashboardModule,
  ],
})
export class AppModule {}
