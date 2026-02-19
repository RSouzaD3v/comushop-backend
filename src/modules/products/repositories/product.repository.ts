import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma, ProductStatus } from "@prisma/client";

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

  async findAll(params: {
    companyId?: string;
    search?: string;
    category?: string;
    take?: number;
    status?: ProductStatus;
  }) {
    const where: Prisma.ProductWhereInput = {};

    if (params.status) {
      where.status = params.status as ProductStatus;
    }

    if (params.companyId) {
      where.companyId = params.companyId;
    }

    if (params.category) {
      where.category = params.category;
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const queryOptions: Prisma.ProductFindManyArgs = {
      where,
      orderBy: { createdAt: "desc" },
      include: {
        variations: true,
        images: {
          orderBy: { order: "asc" },
        },
        company: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    };

    if (params.take) {
      queryOptions.take = Number(params.take);
    }

    return await this.prisma.product.findMany(queryOptions);
  }

  async getProductById(id: string) {
    return await this.prisma.product.findUnique({
      where: { id },
      include: {
        variations: true,
        images: {
          orderBy: { order: "asc" },
        },
        company: true,
      },
    });
  }

  async getNextImageOrder(productId: string) {
    const lastImage = await this.prisma.productImage.findFirst({
      where: { productId },
      orderBy: { order: "desc" },
    });

    return lastImage ? lastImage.order + 1 : 0;
  }

  async addProductImages(
    productId: string,
    images: Array<{
      key: string;
      url: string;
      order: number;
      isPrimary: boolean;
    }>,
  ) {
    return await this.prisma.$transaction(
      images.map((image) =>
        this.prisma.productImage.create({
          data: {
            productId,
            key: image.key,
            url: image.url,
            order: image.order,
            isPrimary: image.isPrimary,
          },
        }),
      ),
    );
  }

  async findProductImage(productId: string, imageId: string) {
    return await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
  }

  async setPrimaryImage(productId: string, imageId: string) {
    const [, updatedImage] = await this.prisma.$transaction([
      this.prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      }),
      this.prisma.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      }),
    ]);

    return updatedImage;
  }

  async deleteProductImage(imageId: string) {
    return await this.prisma.productImage.delete({
      where: { id: imageId },
    });
  }

  async updateImageOrders(
    productId: string,
    items: Array<{ imageId: string; order: number }>,
  ) {
    return await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.productImage.updateMany({
          where: { id: item.imageId, productId },
          data: { order: item.order },
        }),
      ),
    );
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
