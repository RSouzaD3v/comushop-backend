import { Body, Controller, Post } from "@nestjs/common";
import { CreateCheckoutDto } from "./dto/create-checkout.dto";
import { OrdersService } from "./orders.service";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post("checkout")
  async checkout(@Body() dto: CreateCheckoutDto) {
    return await this.ordersService.createCheckout(dto);
  }
}
