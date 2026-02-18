import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { CompaniesService } from "./companies.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { Public } from "../auth/decorators/public.decorator";

@Controller("companies")
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  async create(@Body() dto: CreateCompanyDto) {
    return await this.companiesService.create(dto);
  }

  @Get()
  async list() {
    return await this.companiesService.list();
  }

  // Endpoint para buscar loja por ID (Geralmente uso interno/admin)
  @Get(":id")
  async get(@Param("id") id: string) {
    return await this.companiesService.getById(id);
  }

  @Public()
  @Get("slug/:slug")
  async getBySlug(@Param("slug") slug: string) {
    console.log("DEBUG BACKEND: Buscando slug:", slug);
    return await this.companiesService.getBySlug(slug);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateCompanyDto) {
    return await this.companiesService.update(id, dto);
  }
}
