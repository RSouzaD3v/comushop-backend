import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { CompaniesService } from "./companies.service";

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

  @Get(":id")
  async get(@Param("id") id: string) {
    return await this.companiesService.getById(id);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateCompanyDto) {
    return await this.companiesService.update(id, dto);
  }
}

