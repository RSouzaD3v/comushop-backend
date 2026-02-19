import { Controller, Get, Param, Query } from "@nestjs/common";
import { CouponsService } from "./coupons.service";

@Controller("coupons")
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  async listActive() {
    return await this.couponsService.listActiveCoupons();
  }

  @Get("validate/:code")
  async validate(
    @Param("code") code: string,
    @Query("subtotal") subtotal: string,
  ) {
    return this.couponsService.validateCoupon(code, Number(subtotal));
  }
}
