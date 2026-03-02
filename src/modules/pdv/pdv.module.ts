import { Module } from "@nestjs/common";
import { PdvController } from "./pdv.controller";
import { PdvService } from "./pdv.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [PdvController],
  providers: [PdvService],
})
export class PdvModule {}
