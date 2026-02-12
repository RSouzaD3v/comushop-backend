import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(input: {
    companyId: string;
    name: string;
    description?: string | null;
    variations?: Array<{
      sku?: string | null;
      title?: string | null;
      attributes?: any;
      priceCents: number;
      stockOnHand: number;
    }>;
  }) {
    const variationsData = input.variations?.length
      ? {
          variations: {
            create: input.variations.map((v) => ({
              sku: v.sku ?? null,
              title: v.title ?? null,
              attributes: v.attributes ?? undefined,
              priceCents: v.priceCents,
              stockOnHand: v.stockOnHand,
            })),
          },
        }
      : {};

    return await this.prisma.product.create({
      data: {
        companyId: input.companyId,
        status: "DRAFT",
        name: input.name,
        description: input.description ?? null,
        ...variationsData,
      },
      include: { variations: true },
    });
  }

  async listProductsByCompany(companyId: string) {
    return await this.prisma.product.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: { variations: true },
    });
  }

  async getProductById(id: string) {
    return await this.prisma.product.findUnique({
      where: { id },
      include: { variations: true },
    });
  }

  async findVariationsByIds(variationIds: string[]) {
    return await this.prisma.productVariation.findMany({
      where: { id: { in: variationIds } },
      include: {
        product: {
          include: {
            company: true,
          },
        },
      },
    });
  }
}
