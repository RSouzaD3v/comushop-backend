import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateCheckoutDto } from "./dto/create-checkout.dto";
import { ProductRepository } from "../products/repositories/product.repository";
import { OrderRepository } from "./repositories/order.repository";

@Injectable()
export class OrdersService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly orderRepo: OrderRepository
  ) {}

  /**
   * CRITICAL RULE: checkout cannot produce multi-company orders.
   * This method groups items by seller/company and creates one Order per Company.
   */
  async createCheckout(dto: CreateCheckoutDto) {
    if (dto.items.length === 0) throw new BadRequestException("No items");

    const variationIds = dto.items.map((i) => i.variationId);
    const variations = await this.productRepo.findVariationsByIds(variationIds);

    const variationsById = new Map(variations.map((v) => [v.id, v]));
    for (const item of dto.items) {
      const v = variationsById.get(item.variationId);
      if (!v)
        throw new BadRequestException(
          `Variation not found: ${item.variationId}`
        );
      if (v.product.status !== "ACTIVE")
        throw new BadRequestException("Product is not active");
      if (v.stockOnHand - v.stockReserved < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for variation: ${item.variationId}`
        );
      }
    }

    // Group by companyId (seller)
    const grouped = new Map<string, typeof dto.items>();
    for (const item of dto.items) {
      const v = variationsById.get(item.variationId)!;
      const companyId = v.product.companyId;
      const arr = grouped.get(companyId) ?? [];
      arr.push(item);
      grouped.set(companyId, arr);
    }

    const orders = [];
    for (const [companyId, items] of grouped.entries()) {
      const orderItems = items.map((i) => {
        const v = variationsById.get(i.variationId)!;

        const unitPriceCents = v.priceCents;
        const totalPriceCents = unitPriceCents * i.quantity;

        const productSnapshot = {
          product: {
            id: v.product.id,
            name: v.product.name,
            description: v.product.description,
          },
          variation: {
            id: v.id,
            sku: v.sku,
            title: v.title,
            attributes: v.attributes,
            priceCents: v.priceCents,
          },
          company: {
            id: v.product.companyId,
            name: v.product.company.name,
            slug: v.product.company.slug,
          },
        };

        return {
          productId: v.product.id,
          variationId: v.id,
          quantity: i.quantity,
          unitPriceCents,
          totalPriceCents,
          productSnapshot,
        };
      });

      orders.push(
        await this.orderRepo.createOrderWithItems({
          companyId,
          customerUserId: dto.customerUserId ?? null,
          currency: "BRL",
          items: orderItems,
        })
      );
    }

    return { orders };
  }
}
