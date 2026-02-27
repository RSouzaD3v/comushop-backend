import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { BannerRepository } from './repositories';
import { CreateBannerDto, UpdateBannerDto, BannerResponseDto } from './dto';

@Injectable()
export class BannersService {
  constructor(private readonly bannerRepo: BannerRepository) {}

  async createBanner(dto: CreateBannerDto): Promise<BannerResponseDto> {
    // Validate position is unique
    const existingBanner = await this.bannerRepo.findAll();
    if (existingBanner.some((b: any) => b.position === dto.position)) {
      throw new BadRequestException('Position must be unique');
    }

    // Validate dates if both exist
    if (dto.startDate && dto.endDate) {
      const start = new Date(dto.startDate);
      const end = new Date(dto.endDate);
      if (end <= start) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const banner = await this.bannerRepo.create(dto);
    return this.mapToResponseDto(banner);
  }

  async getAllBanners(): Promise<BannerResponseDto[]> {
    const banners = await this.bannerRepo.findAll();
    return banners.map((banner: any) => this.mapToResponseDto(banner));
  }

  async getBannerById(id: string): Promise<BannerResponseDto> {
    const banner = await this.bannerRepo.findById(id);
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }
    return this.mapToResponseDto(banner);
  }

  async getActiveBanners(): Promise<BannerResponseDto[]> {
    const banners = await this.bannerRepo.findActive();
    return banners.map((banner: any) => this.mapToResponseDto(banner));
  }

  async updateBanner(
    id: string,
    dto: UpdateBannerDto,
  ): Promise<BannerResponseDto> {
    const banner = await this.bannerRepo.findById(id);
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    // Validate dates if both are being updated
    if (dto.startDate && dto.endDate) {
      const start = new Date(dto.startDate);
      const end = new Date(dto.endDate);
      if (end <= start) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // If updating position, check uniqueness
    if (dto.position !== undefined) {
      const existingBanners = await this.bannerRepo.findAll();
      if (
        existingBanners.some(
          (b: any) => b.position === dto.position && b.id !== id,
        )
      ) {
        throw new BadRequestException('Position must be unique');
      }
    }

    const updated = await this.bannerRepo.update(id, dto);
    return this.mapToResponseDto(updated);
  }

  async deleteBanner(id: string): Promise<void> {
    const banner = await this.bannerRepo.findById(id);
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }
    await this.bannerRepo.delete(id);
  }

  private mapToResponseDto(banner: any): BannerResponseDto {
    return {
      id: banner.id,
      title: banner.title || undefined,
      subtitle: banner.subtitle || undefined,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || undefined,
      linkType: banner.linkType,
      linkTargetId: banner.linkTargetId || undefined,
      position: banner.position,
      isActive: banner.isActive,
      startDate: banner.startDate || undefined,
      endDate: banner.endDate || undefined,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt,
    };
  }
}
