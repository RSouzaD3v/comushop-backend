import { Module } from "@nestjs/common";
import { CompaniesModule } from "../companies/companies.module";
import { ProductRepository } from "./repositories/product.repository";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";

@Module({
  imports: [CompaniesModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepository],
  exports: [ProductsService],
})
export class ProductsModule {}

