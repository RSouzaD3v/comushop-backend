import { Module } from "@nestjs/common";
import { CompaniesController } from "./companies.controller";
import { CompaniesService } from "./companies.service";
import { CompanyRepository } from "./repositories/company.repository";

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService, CompanyRepository],
  exports: [CompaniesService],
})
export class CompaniesModule {}

