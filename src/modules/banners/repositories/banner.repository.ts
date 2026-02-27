import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBannerDto, UpdateBannerDto } from '../dto';

@Injectable()
export class BannerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBannerDto) {
    const createData: any = {
      title: data.title || null,
      subtitle: data.subtitle || null,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl || null,
      linkType: data.linkType || 'NONE',
      linkTargetId: data.linkTargetId || null,
      position: data.position,
      isActive: data.isActive ?? true,
    };

    if (data.startDate) {
      createData.startDate = new Date(data.startDate);
    }
    if (data.endDate) {
      createData.endDate = new Date(data.endDate);
    }

    return await this.prisma.carouselBanner.create({ data: createData });
  }

  async findAll() {
    return await this.prisma.carouselBanner.findMany({
      orderBy: { position: 'asc' },
    });
  }

  async findById(id: string) {
    return await this.prisma.carouselBanner.findUnique({
      where: { id },
    });
  }

  async findActive() {
    const now = new Date();

    return await this.prisma.carouselBanner.findMany({
      where: {
        isActive: true,
        OR: [
          {
            startDate: null,
            endDate: null,
          },
          {
            AND: [
              {
                startDate: {
                  lte: now,
                },
              },
              {
                endDate: {
                  gte: now,
                },
              },
            ],
          },
          {
            startDate: null,
            endDate: {
              gte: now,
            },
          },
          {
            startDate: {
              lte: now,
            },
            endDate: null,
          },
        ],
      },
      orderBy: { position: 'asc' },
    });
  }

  async update(id: string, data: UpdateBannerDto) {
    const updateData: any = {};

    if (data.title !== undefined) {
      updateData.title = data.title || null;
    }
    if (data.subtitle !== undefined) {
      updateData.subtitle = data.subtitle || null;
    }
    if (data.imageUrl !== undefined) {
      updateData.imageUrl = data.imageUrl;
    }
    if (data.linkUrl !== undefined) {
      updateData.linkUrl = data.linkUrl || null;
    }
    if (data.linkType !== undefined) {
      updateData.linkType = data.linkType;
    }
    if (data.linkTargetId !== undefined) {
      updateData.linkTargetId = data.linkTargetId || null;
    }
    if (data.position !== undefined) {
      updateData.position = data.position;
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    }

    return await this.prisma.carouselBanner.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return await this.prisma.carouselBanner.delete({
      where: { id },
    });
  }
}
