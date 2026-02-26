import { Module } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { ReviewsController } from "./reviews.controller";
import { ReviewRepository } from "./repositories";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [ReviewsService, ReviewRepository],
  controllers: [ReviewsController],
  exports: [ReviewsService],
})
export class ReviewsModule {}
