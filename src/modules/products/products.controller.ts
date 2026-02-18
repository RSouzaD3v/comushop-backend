import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() dto: CreateProductDto) {
    return await this.productsService.create(dto);
  }

  @Get()
  async list(
    @Query("companyId") companyId?: string,
    @Query("search") search?: string,
    @Query("category") category?: string,
    @Query("limit") limit?: string,
    @Query("status") status?: string,
  ) {
    const filters: {
      companyId?: string;
      search?: string;
      category?: string;
      take?: number;
      status?: string;
    } = {};

    if (companyId) filters.companyId = companyId;
    if (search) filters.search = search;
    if (category) filters.category = category;
    if (limit) filters.take = Number(limit);
    if (status) filters.status = status;

    if (!companyId && !status) {
      filters.status = "ACTIVE";
    }

    return await this.productsService.findAll(filters);
  }

  @Get(":id")
  async get(@Param("id") id: string) {
    return await this.productsService.getById(id);
  }
}
