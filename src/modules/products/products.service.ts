import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductRepository } from "./repositories/product.repository";
import { CreateProductDto } from "./dto/create-product.dto";
import { CompaniesService } from "../companies/companies.service";

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly companiesService: CompaniesService,
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
}
