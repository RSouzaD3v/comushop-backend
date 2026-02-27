import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { StorageModule } from "../storage/storage.module";
import { BannersService } from "./banners.service";
import { BannersController } from "./banners.controller";
import { BannerRepository } from "./repositories";

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [BannersController],
  providers: [BannersService, BannerRepository],
  exports: [BannersService],
})
export class BannersModule {}
