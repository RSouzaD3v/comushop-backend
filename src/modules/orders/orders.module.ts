import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { OrderRepository } from "./repositories/order.repository";
import { ProductRepository } from "../products/repositories/product.repository";
import { CouponsModule } from "../coupons/coupons.module";

@Module({
  imports: [CouponsModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderRepository, ProductRepository],
  exports: [OrdersService],
})
export class OrdersModule {}
