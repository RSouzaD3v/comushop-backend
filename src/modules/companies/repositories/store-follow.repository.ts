import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class StoreFollowRepository {
  constructor(private readonly prisma: PrismaService) {}

  async followStore(userId: string, storeId: string) {
    return await this.prisma.storeFollow.create({
      data: {
        userId,
        storeId,
      },
    });
  }

  async unfollowStore(userId: string, storeId: string) {
    return await this.prisma.storeFollow.deleteMany({
      where: {
        userId,
        storeId,
      },
    });
  }

  async isFollowing(userId: string, storeId: string) {
    const follow = await this.prisma.storeFollow.findFirst({
      where: {
        userId,
        storeId,
      },
    });
    return !!follow;
  }

  async getFollowersCount(storeId: string) {
    return await this.prisma.storeFollow.count({
      where: { storeId },
    });
  }

  async getUserFollowing(userId: string) {
    return await this.prisma.storeFollow.findMany({
      where: { userId },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            description: true,
          },
        },
      },
    });
  }

  async getStoreFollowers(storeId: string) {
    return await this.prisma.storeFollow.findMany({
      where: { storeId },
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
}
