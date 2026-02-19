import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CreateCheckoutDto } from "./dto/create-checkout.dto";
import { OrdersService } from "./orders.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post("checkout")
  async checkout(
    @CurrentUser("userId") userId: string,
    @Body() dto: CreateCheckoutDto,
  ) {
    return await this.ordersService.createCheckout(userId, dto);
  }
}
