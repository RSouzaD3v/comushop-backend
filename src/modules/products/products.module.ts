import { Module } from "@nestjs/common";
import { CompaniesModule } from "../companies/companies.module";
import { StorageModule } from "../storage/storage.module";
import { ProductRepository } from "./repositories/product.repository";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";

@Module({
  imports: [CompaniesModule, StorageModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepository],
  exports: [ProductsService],
})
export class ProductsModule {}
