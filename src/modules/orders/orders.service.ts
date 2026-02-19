import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateCheckoutDto } from "./dto/create-checkout.dto";
import { CouponsService } from "../coupons/coupons.service";
import { OrderStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { OrderRepository } from "./repositories/order.repository";

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly couponsService: CouponsService,
    private readonly orderRepo: OrderRepository,
  ) {}

  async createCheckout(userId: string, dto: CreateCheckoutDto) {
    const { items, addressId, couponCode } = dto;

    if (!items || items.length === 0) {
      throw new BadRequestException("O carrinho está vazio.");
    }

    const variationIds = items.map((i) => i.variationId);
    const variations = await this.prisma.productVariation.findMany({
      where: { id: { in: variationIds } },
      include: {
        product: {
          include: { company: true },
        },
      },
    });

    if (variations.length !== items.length) {
      throw new BadRequestException(
        "Um ou mais produtos não foram encontrados.",
      );
    }

    const variationsMap = new Map(variations.map((v) => [v.id, v]));
    const groupedItems = new Map<string, typeof items>();

    for (const itemDto of items) {
      const variation = variationsMap.get(itemDto.variationId);

      if (!variation) continue;
      if (variation.product.status !== "ACTIVE") {
        throw new BadRequestException(
          `O produto "${variation.product.name}" não está mais disponível.`,
        );
      }

      if (variation.stockOnHand < itemDto.quantity) {
        throw new BadRequestException(
          `Estoque insuficiente para: ${variation.product.name}`,
        );
      }

      const companyId = variation.product.companyId;
      const group = groupedItems.get(companyId) || [];
      group.push(itemDto);
      groupedItems.set(companyId, group);
    }

    const createdOrders = [];

    for (const [companyId, groupItems] of groupedItems.entries()) {
      let subtotalCents = 0;

      const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];

      for (const itemDto of groupItems) {
        const variation = variationsMap.get(itemDto.variationId)!;
        const totalItemCents = variation.priceCents * itemDto.quantity;

        subtotalCents += totalItemCents;

        orderItemsData.push({
          productId: variation.productId,
          variationId: variation.id,
          quantity: itemDto.quantity,
          unitPriceCents: variation.priceCents,
          totalPriceCents: totalItemCents,
          productSnapshot: {
            name: variation.product.name,
            sku: variation.sku || "",
            title: variation.title || "",
            description: variation.product.description || "",
            companyName: variation.product.company.name,
          },
        });
      }

      let discountCents = 0;
      if (couponCode) {
        try {
          const coupon = await this.couponsService.validateCoupon(
            couponCode,
            subtotalCents,
          );

          if (coupon.discountType === "PERCENTAGE") {
            discountCents = Math.round(subtotalCents * (coupon.value / 100));
          } else {
            discountCents = coupon.value;
          }
        } catch (error: any) {
          throw new BadRequestException(
            `Erro no cupom para a loja ${companyId}: ${error.message}`,
          );
        }
      }

      const shippingCents = 990;
      const totalCents = Math.max(
        0,
        subtotalCents + shippingCents - discountCents,
      );

      const order = await this.prisma.$transaction(async (tx) => {
        for (const itemDto of groupItems) {
          await tx.productVariation.update({
            where: { id: itemDto.variationId },
            data: {
              stockOnHand: { decrement: itemDto.quantity },
              stockReserved: { increment: itemDto.quantity },
            },
          });
        }

        if (discountCents > 0 && couponCode) {
          await tx.coupon.update({
            where: { code: couponCode },
            data: { usedCount: { increment: 1 } },
          });
        }

        return tx.order.create({
          data: {
            companyId,
            customerUserId: userId,
            status: OrderStatus.PENDING_PAYMENT,
            currency: "BRL",
            subtotalCents,
            shippingCents,
            discountCents,
            totalCents,
            items: {
              create: orderItemsData,
            },
          },
          include: { items: true },
        });
      });

      createdOrders.push(order);
    }

    return createdOrders;
  }

  async listByUserId(userId: string, take?: number) {
    return await this.orderRepo.listByUserId(userId, take);
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await this.orderRepo.getOrderById(orderId, userId);

    if (!order) {
      throw new NotFoundException(
        "Pedido não encontrado ou não pertence a você.",
      );
    }

    return order;
  }
}
