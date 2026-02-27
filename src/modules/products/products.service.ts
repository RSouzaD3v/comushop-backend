import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ProductRepository } from "./repositories/product.repository";
import { CreateProductDto } from "./dto/create-product.dto";
import { CompaniesService } from "../companies/companies.service";
import { S3Service } from "../storage/s3.service";
import { UpdateProductImageOrderDto } from "./dto/update-product-image-order.dto";
import { ViewedProductRepository } from "./repositories/viewed-product.repository";

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly companiesService: CompaniesService,
    private readonly s3Service: S3Service,
    private readonly viewedProductRepo: ViewedProductRepository,
  ) {}

  async create(dto: CreateProductDto) {
    await this.companiesService.getById(dto.companyId);

    return await this.productRepo.createProduct({
      companyId: dto.companyId,
      name: dto.name,
      description: dto.description ?? null,
      ...(dto.variations
        ? {
            variations: dto.variations.map((v) => ({
              sku: v.sku ?? null,
              title: v.title ?? null,
              attributes: v.attributes,
              priceCents: v.priceCents,
              stockOnHand: v.stockOnHand,
            })),
          }
        : {}),
    });
  }

  async findAll(params: {
    companyId?: string;
    search?: string;
    category?: string;
    take?: number;
  }) {
    return await this.productRepo.findAll(params);
  }

  async getById(id: string) {
    const product = await this.productRepo.getProductById(id);

    if (!product) throw new NotFoundException("Product not found");

    return product;
  }

  async uploadImages(
    productId: string,
    files: Array<{ buffer: Buffer; originalname: string; mimetype: string }>,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException("Nenhuma imagem foi enviada.");
    }

    const product = await this.getById(productId);
    const hasPrimary = product.images?.some((image) => image.isPrimary);
    let nextOrder = await this.productRepo.getNextImageOrder(productId);

    const uploads = [] as Array<{
      key: string;
      url: string;
      order: number;
      isPrimary: boolean;
    }>;

    for (const [index, file] of files.entries()) {
      if (!file.mimetype.startsWith("image/")) {
        throw new BadRequestException(
          "Apenas arquivos de imagem sao permitidos.",
        );
      }

      const { key, url } = await this.s3Service.uploadProductImage(
        productId,
        file,
      );

      uploads.push({
        key,
        url,
        order: nextOrder++,
        isPrimary: !hasPrimary && index === 0,
      });
    }

    return await this.productRepo.addProductImages(productId, uploads);
  }

  async setPrimaryImage(productId: string, imageId: string) {
    const image = await this.productRepo.findProductImage(productId, imageId);

    if (!image) {
      throw new NotFoundException("Imagem nao encontrada para este produto.");
    }

    return await this.productRepo.setPrimaryImage(productId, imageId);
  }

  async updateImageOrder(productId: string, dto: UpdateProductImageOrderDto) {
    const product = await this.getById(productId);
    const imageIds = new Set(product.images?.map((image) => image.id));

    for (const item of dto.items) {
      if (!imageIds.has(item.imageId)) {
        throw new BadRequestException(
          "Uma ou mais imagens nao pertencem a este produto.",
        );
      }
    }

    return await this.productRepo.updateImageOrders(productId, dto.items);
  }

  async deleteImage(productId: string, imageId: string) {
    const image = await this.productRepo.findProductImage(productId, imageId);

    if (!image) {
      throw new NotFoundException("Imagem nao encontrada para este produto.");
    }

    await this.s3Service.deleteObject(image.key);
    await this.productRepo.deleteProductImage(imageId);

    return { success: true };
  }

  async recordProductView(userId: string, productId: string) {
    return await this.viewedProductRepo.recordView(userId, productId);
  }

  async getRecentlyViewed(userId: string, limit: number = 10) {
    const viewedItems = await this.viewedProductRepo.getRecentlyViewed(
      userId,
      limit,
    );

    return viewedItems.map((item: any) => ({
      ...item.product,
      viewedAt: item.viewedAt,
    }));
  }

  async getProductsNearby(city?: string, limit: number = 20) {
    return await this.viewedProductRepo.getProductsNearby(city, limit);
  }
}
