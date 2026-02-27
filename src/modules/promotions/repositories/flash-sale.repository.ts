import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FlashSaleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: {
    title: string;
    description?: string | null;
    startDate: Date;
    endDate: Date;
    discountPercent: number;
    productId: string;
    isActive?: boolean;
  }) {
    return await this.prisma.flashSale.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        startDate: input.startDate,
        endDate: input.endDate,
        discountPercent: input.discountPercent,
        productId: input.productId,
        isActive: input.isActive ?? true,
      },
      include: {
        product: {
          include: {
            images: {
              orderBy: { order: 'asc' },
            },
            variations: true,
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string) {
    return await this.prisma.flashSale.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            images: {
              orderBy: { order: 'asc' },
            },
            variations: true,
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(params: { isActive?: boolean } = {}) {
    const where: any = {};

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    return await this.prisma.flashSale.findMany({
      where,
      include: {
        product: {
          include: {
            images: {
              orderBy: { order: 'asc' },
            },
            variations: true,
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    const now = new Date();
    return await this.prisma.flashSale.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        product: {
          include: {
            images: {
              orderBy: { order: 'asc' },
            },
            variations: true,
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { endDate: 'asc' },
    });
  }

  async update(id: string, input: {
    title?: string;
    description?: string | null;
    startDate?: Date;
    endDate?: Date;
    discountPercent?: number;
    isActive?: boolean;
  }) {
    const updateData: any = {};

    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.startDate !== undefined) {
      updateData.startDate = input.startDate;
    }
    if (input.endDate !== undefined) {
      updateData.endDate = input.endDate;
    }
    if (input.discountPercent !== undefined) {
      updateData.discountPercent = input.discountPercent;
    }
    if (input.isActive !== undefined) {
      updateData.isActive = input.isActive;
    }

    return await this.prisma.flashSale.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          include: {
            images: {
              orderBy: { order: 'asc' },
            },
            variations: true,
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }

  async delete(id: string) {
    return await this.prisma.flashSale.delete({
      where: { id },
    });
  }

  async findByProductId(productId: string) {
    const now = new Date();
    return await this.prisma.flashSale.findFirst({
      where: {
        productId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });
  }
}
