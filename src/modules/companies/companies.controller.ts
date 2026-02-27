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
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CompaniesService } from "./companies.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { Public } from "../auth/decorators/public.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

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
  async getBySlug(@Param("slug") slug: string, @CurrentUser() user: any) {
    return await this.companiesService.getBySlug(slug, user?.userId);
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

  @Public()
  @Get(":storeId/reviews")
  @HttpCode(HttpStatus.OK)
  async getStoreReviews(
    @Param("storeId") storeId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const params: any = {};
    if (page) {
      params.page = parseInt(page);
    }
    if (limit) {
      params.limit = parseInt(limit);
    }
    return await this.companiesService.getStoreReviews(storeId, params);
  }

  @Post(":storeId/follow")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async followStore(
    @Param("storeId") storeId: string,
    @CurrentUser() user: any,
  ) {
    await this.companiesService.followStore(user.userId, storeId);
    return { message: "Store followed successfully" };
  }

  @Delete(":storeId/follow")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async unfollowStore(
    @Param("storeId") storeId: string,
    @CurrentUser() user: any,
  ) {
    await this.companiesService.unfollowStore(user.userId, storeId);
  }

  @Get(":storeId/followers")
  @HttpCode(HttpStatus.OK)
  async getStoreFollowers(@Param("storeId") storeId: string) {
    return await this.companiesService.getStoreFollowers(storeId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("user/following")
  @HttpCode(HttpStatus.OK)
  async getUserFollowing(@CurrentUser() user: any) {
    return await this.companiesService.getUserFollowing(user.userId);
  }
}
