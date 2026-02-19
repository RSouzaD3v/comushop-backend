// src/modules/coupons/coupons.service.ts

import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async validateCoupon(code: string, subtotalCents: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      throw new BadRequestException("Cupom inválido ou expirado.");
    }

    if (subtotalCents < coupon.minPurchaseCents) {
      throw new BadRequestException(
        `Compra mínima para este cupom é de R$ ${(coupon.minPurchaseCents / 100).toFixed(2)}`,
      );
    }

    return {
      code: coupon.code,
      discountType: coupon.discountType,
      value: coupon.value,
    };
  }
}
