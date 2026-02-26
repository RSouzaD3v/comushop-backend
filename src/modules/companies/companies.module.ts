import { Module } from "@nestjs/common";
import { CompaniesController } from "./companies.controller";
import { CompaniesService } from "./companies.service";
import { CompanyRepository } from "./repositories/company.repository";
import { StoreFollowRepository } from "./repositories/store-follow.repository";
import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [StorageModule],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompanyRepository, StoreFollowRepository],
  exports: [CompaniesService],
})
export class CompaniesModule {}
