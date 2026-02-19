import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CompaniesService } from "./companies.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { Public } from "../auth/decorators/public.decorator";

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

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

  // Endpoint para buscar loja por ID (Geralmente uso interno/admin)
  @Get(":id")
  async get(@Param("id") id: string) {
    return await this.companiesService.getById(id);
  }

  @Public()
  @Get("slug/:slug")
  async getBySlug(@Param("slug") slug: string) {
    console.log("DEBUG BACKEND: Buscando slug:", slug);
    return await this.companiesService.getBySlug(slug);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateCompanyDto) {
    return await this.companiesService.update(id, dto);
  }

  @Post(":id/logo")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
          return cb(new Error("Apenas imagens sao permitidas."), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadLogo(
    @Param("id") id: string,
    @UploadedFile() file: UploadedFile,
  ) {
    return await this.companiesService.uploadLogo(id, file);
  }

  @Delete(":id/logo")
  async deleteLogo(@Param("id") id: string) {
    return await this.companiesService.deleteLogo(id);
  }
}
