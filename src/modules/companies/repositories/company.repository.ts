import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: {
    name: string;
    slug: string;
    ownerUserId?: string | null;
  }) {
    return await this.prisma.company.create({
      data: {
        name: input.name,
        slug: input.slug,
        ownerUserId: input.ownerUserId ?? null,
      },
    });
  }

  async findById(id: string) {
    return await this.prisma.company.findUnique({ where: { id } });
  }

  async findBySlug(slug: string) {
    return await this.prisma.company.findUnique({ where: { slug } });
  }

  async findBySlugWithDetails(slug: string) {
    return await this.prisma.company.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            followers: true,
            products: true,
            orders: true,
          },
        },
      },
    });
  }

  async list() {
    return await this.prisma.company.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async listWithDetails() {
    return await this.prisma.company.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            followers: true,
            products: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    input: {
      name?: string;
      slug?: string;
      logoUrl?: string | null;
      description?: string | null;
    },
  ) {
    return await this.prisma.company.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
      },
    });
  }

  async getStoreReviews(
    storeId: string,
    params: { page?: number; limit?: number } = {},
  ) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 10));
    const skip = (page - 1) * limit;

    const store = await this.prisma.company.findUnique({
      where: { id: storeId },
      select: { name: true },
    });

    const reviews = await this.prisma.productReview.findMany({
      where: {
        product: {
          companyId: storeId,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await this.prisma.productReview.count({
      where: {
        product: {
          companyId: storeId,
        },
      },
    });

    const avgRating = await this.prisma.productReview.aggregate({
      where: {
        product: {
          companyId: storeId,
        },
      },
      _avg: { rating: true },
    });

    return {
      storeName: store?.name,
      totalReviews: total,
      averageRating: avgRating._avg.rating ?? 0,
      reviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
