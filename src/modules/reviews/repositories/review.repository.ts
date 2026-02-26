import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class ReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(input: {
    productId: string;
    userId: string;
    rating: number;
    title?: string | null;
    comment?: string | null;
  }) {
    return await this.prisma.productReview.create({
      data: {
        productId: input.productId,
        userId: input.userId,
        rating: input.rating,
        title: input.title ?? null,
        comment: input.comment ?? null,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findReviewById(id: string) {
    return await this.prisma.productReview.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findReviewsByProductId(
    productId: string,
    params: {
      rating?: number;
      skip?: number;
      take?: number;
    } = {},
  ) {
    const where: any = { productId };

    if (params.rating !== undefined) {
      where.rating = params.rating;
    }

    return await this.prisma.productReview.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: params.skip ?? 0,
      take: params.take ?? 10,
    });
  }

  async findReviewsByProductIdCount(productId: string) {
    return await this.prisma.productReview.count({
      where: { productId },
    });
  }

  async findUserReviewForProduct(userId: string, productId: string) {
    return await this.prisma.productReview.findFirst({
      where: {
        userId,
        productId,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async updateReview(
    id: string,
    input: {
      rating?: number | null;
      title?: string | null;
      comment?: string | null;
    },
  ) {
    const updateData: any = {};

    if (input.rating !== undefined) {
      updateData.rating = input.rating;
    }
    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    if (input.comment !== undefined) {
      updateData.comment = input.comment;
    }

    return await this.prisma.productReview.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async markReviewHelpful(id: string, helpful: boolean) {
    const review = await this.prisma.productReview.findUnique({
      where: { id },
    });

    if (!review) {
      return null;
    }

    return await this.prisma.productReview.update({
      where: { id },
      data: {
        helpfulCount: helpful
          ? { increment: 1 }
          : review.helpfulCount > 0
            ? { decrement: 1 }
            : 0,
        unhelpfulCount: !helpful
          ? { increment: 1 }
          : review.unhelpfulCount > 0
            ? { decrement: 1 }
            : 0,
      },
    });
  }

  async deleteReview(id: string) {
    return await this.prisma.productReview.delete({
      where: { id },
    });
  }

  async getProductRatingStats(productId: string) {
    return await this.prisma.productReview.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: true,
    });
  }

  async deleteUserReviewForProduct(userId: string, productId: string) {
    return await this.prisma.productReview.deleteMany({
      where: {
        userId,
        productId,
      },
    });
  }
}
