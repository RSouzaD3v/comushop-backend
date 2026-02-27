import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ViewedProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async recordView(userId: string, productId: string) {
    return await this.prisma.viewedProduct.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      update: {
        viewedAt: new Date(),
      },
      create: {
        userId,
        productId,
      },
      include: {
        product: {
          include: {
            company: true,
            images: true,
            variations: true,
          },
        },
      },
    });
  }

  async getRecentlyViewed(userId: string, limit: number = 10) {
    return await this.prisma.viewedProduct.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: {
        product: {
          include: {
            company: true,
            images: true,
            variations: true,
            reviews: {
              select: {
                rating: true,
              },
            },
          },
        },
      },
    });
  }

  async getProductsNearby(city?: string, limit: number = 20) {
    if (!city) {
      // Se não houver cidade, retorna produtos de qualquer lugar
      return await this.prisma.product.findMany({
        where: {
          status: "ACTIVE",
        },
        include: {
          company: true,
          images: true,
          variations: true,
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        take: limit,
      });
    }

    // Filtrar por cidade da loja
    return await this.prisma.product.findMany({
      where: {
        status: "ACTIVE",
        company: {
          city: {
            equals: city,
            mode: "insensitive",
          },
        },
      },
      include: {
        company: true,
        images: true,
        variations: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      take: limit,
    });
  }
}
