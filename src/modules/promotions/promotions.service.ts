import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { FlashSaleRepository } from "./repositories";
import {
  CreateFlashSaleDto,
  UpdateFlashSaleDto,
  FlashSaleResponseDto,
} from "./dto";

@Injectable()
export class PromotionsService {
  constructor(private readonly flashSaleRepo: FlashSaleRepository) {}

  async createFlashSale(
    dto: CreateFlashSaleDto,
  ): Promise<FlashSaleResponseDto> {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException("End date must be after start date");
    }

    const flashSale = await this.flashSaleRepo.create({
      title: dto.title,
      description: dto.description || null,
      startDate,
      endDate,
      discountPercent: dto.discountPercent,
      productId: dto.productId,
      isActive: dto.isActive ?? true,
    });

    return this.mapToResponseDto(flashSale);
  }

  async getFlashSaleById(id: string): Promise<FlashSaleResponseDto> {
    const flashSale = await this.flashSaleRepo.findById(id);
    if (!flashSale) {
      throw new NotFoundException("Flash sale not found");
    }
    return this.mapToResponseDto(flashSale);
  }

  async getAllFlashSales(isActive?: boolean): Promise<FlashSaleResponseDto[]> {
    const params: { isActive?: boolean } = {};
    if (isActive !== undefined) {
      params.isActive = isActive;
    }
    const flashSales = await this.flashSaleRepo.findAll(params);
    return flashSales.map((fs: any) => this.mapToResponseDto(fs));
  }

  async getActiveFlashSales(): Promise<FlashSaleResponseDto[]> {
    const flashSales = await this.flashSaleRepo.findActive();
    return flashSales.map((fs: any) => this.mapToResponseDto(fs));
  }

  async updateFlashSale(
    id: string,
    dto: UpdateFlashSaleDto,
  ): Promise<FlashSaleResponseDto> {
    const flashSale = await this.flashSaleRepo.findById(id);
    if (!flashSale) {
      throw new NotFoundException("Flash sale not found");
    }

    const updateData: any = {};

    if (dto.title !== undefined) {
      updateData.title = dto.title;
    }
    if (dto.description !== undefined) {
      updateData.description = dto.description || null;
    }
    if (dto.startDate !== undefined) {
      updateData.startDate = new Date(dto.startDate);
    }
    if (dto.endDate !== undefined) {
      updateData.endDate = new Date(dto.endDate);
    }
    if (dto.discountPercent !== undefined) {
      updateData.discountPercent = dto.discountPercent;
    }
    if (dto.isActive !== undefined) {
      updateData.isActive = dto.isActive;
    }

    // Validate dates if both are being updated
    if (updateData.startDate && updateData.endDate) {
      if (updateData.endDate <= updateData.startDate) {
        throw new BadRequestException("End date must be after start date");
      }
    }

    const updated = await this.flashSaleRepo.update(id, updateData);
    return this.mapToResponseDto(updated);
  }

  async deleteFlashSale(id: string): Promise<void> {
    const flashSale = await this.flashSaleRepo.findById(id);
    if (!flashSale) {
      throw new NotFoundException("Flash sale not found");
    }
    await this.flashSaleRepo.delete(id);
  }

  async getFlashSaleByProductId(productId: string) {
    return await this.flashSaleRepo.findByProductId(productId);
  }

  private mapToResponseDto(flashSale: any): FlashSaleResponseDto {
    const dto: FlashSaleResponseDto = {
      id: flashSale.id,
      title: flashSale.title,
      description: flashSale.description,
      startDate: flashSale.startDate,
      endDate: flashSale.endDate,
      discountPercent: flashSale.discountPercent,
      isActive: flashSale.isActive,
      productId: flashSale.productId,
      createdAt: flashSale.createdAt,
      updatedAt: flashSale.updatedAt,
    };

    if (flashSale.product) {
      dto.product = {
        id: flashSale.product.id,
        name: flashSale.product.name,
        description: flashSale.product.description,
        images: flashSale.product.images?.map((img: any) => ({
          url: img.url,
          isPrimary: img.isPrimary,
        })),
        variations: flashSale.product.variations,
        company: flashSale.product.company,
      };
    }

    return dto;
  }
}
