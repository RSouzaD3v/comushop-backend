import { Module } from "@nestjs/common";
import { CompaniesModule } from "../companies/companies.module";
import { StorageModule } from "../storage/storage.module";
import { ProductRepository } from "./repositories/product.repository";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { ViewedProductRepository } from "./repositories/viewed-product.repository";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [CompaniesModule, StorageModule, PrismaModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepository, ViewedProductRepository],
  exports: [ProductsService],
})
export class ProductsModule {}
