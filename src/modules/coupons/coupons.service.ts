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
      throw new BadRequestException("Cupom inválido ou inexistente.");
    }

    if (coupon.expirationDate && coupon.expirationDate < new Date()) {
      throw new BadRequestException("Este cupom já expirou.");
    }

    if (subtotalCents < coupon.minPurchaseCents) {
      throw new BadRequestException(
        `O valor mínimo para este cupom é R$ ${coupon.minPurchaseCents / 100}`,
      );
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException("Este cupom atingiu o limite de usos.");
    }

    return {
      code: coupon.code,
      discountType: coupon.discountType,
      value: coupon.value,
    };
  }
}
