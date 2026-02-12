import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CompanyRepository } from "./repositories/company.repository";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

@Injectable()
export class CompaniesService {
  constructor(private readonly companyRepo: CompanyRepository) {}

  async create(dto: CreateCompanyDto) {
    const existing = await this.companyRepo.findBySlug(dto.slug);
    if (existing) throw new ConflictException("Slug already in use");
    return await this.companyRepo.create({ name: dto.name, slug: dto.slug });
  }

  async list() {
    return await this.companyRepo.list();
  }

  async getById(id: string) {
    const company = await this.companyRepo.findById(id);
    if (!company) throw new NotFoundException("Company not found");
    return company;
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.getById(id);
    if (dto.slug) {
      const existing = await this.companyRepo.findBySlug(dto.slug);
      if (existing && existing.id !== id) throw new ConflictException("Slug already in use");
    }
    return await this.companyRepo.update(id, dto);
  }
}

