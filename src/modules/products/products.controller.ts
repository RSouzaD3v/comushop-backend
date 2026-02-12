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
  async list(@Query("companyId") companyId?: string) {
    if (!companyId) return [];
    return await this.productsService.listByCompany(companyId);
  }

  @Get(":id")
  async get(@Param("id") id: string) {
    return await this.productsService.getById(id);
  }
}

