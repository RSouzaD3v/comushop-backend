import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOrderWithItems(input: {
    companyId: string;
    customerUserId: string | null;
    currency: string;
    items: Array<{
      productId: string | null;
      variationId: string | null;
      quantity: number;
      unitPriceCents: number;
      totalPriceCents: number;
      productSnapshot: any;
    }>;
  }) {
    const subtotalCents = input.items.reduce(
      (sum, i) => sum + i.totalPriceCents,
      0
    );

    return await this.prisma.order.create({
      data: {
        companyId: input.companyId,
        customerUserId: input.customerUserId,
        currency: input.currency,
        subtotalCents,
        totalCents: subtotalCents,
        items: {
          create: input.items.map((i) => ({
            productId: i.productId,
            variationId: i.variationId,
            quantity: i.quantity,
            unitPriceCents: i.unitPriceCents,
            totalPriceCents: i.totalPriceCents,
            productSnapshot: i.productSnapshot,
          })),
        },
      },
      include: { items: true },
    });
  }
}
