import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { Public } from "../auth/decorators/public.decorator";
import { S3Service } from "../storage/s3.service";
import { BannersService } from "./banners.service";
import { CreateBannerDto, UpdateBannerDto, BannerResponseDto } from "./dto";

@Controller("banners")
export class BannersController {
  constructor(
    private readonly bannersService: BannersService,
    private readonly s3Service: S3Service,
  ) {}

  @Post("upload")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor("file"))
  async uploadBannerImage(
    @UploadedFile()
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
  ): Promise<{ url: string; key: string }> {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        "Invalid file type. Only JPEG, PNG and WebP are allowed",
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException("File too large. Maximum size is 5MB");
    }

    return await this.s3Service.uploadBannerImage(file);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createBanner(
    @Body() createBannerDto: CreateBannerDto,
  ): Promise<BannerResponseDto> {
    return this.bannersService.createBanner(createBannerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllBanners(): Promise<BannerResponseDto[]> {
    return this.bannersService.getAllBanners();
  }

  @Get("active")
  @Public()
  async getActiveBanners(): Promise<BannerResponseDto[]> {
    return this.bannersService.getActiveBanners();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getBannerById(@Param("id") id: string): Promise<BannerResponseDto> {
    return this.bannersService.getBannerById(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateBanner(
    @Param("id") id: string,
    @Body() updateBannerDto: UpdateBannerDto,
  ): Promise<BannerResponseDto> {
    return this.bannersService.updateBanner(id, updateBannerDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteBanner(@Param("id") id: string): Promise<void> {
    await this.bannersService.deleteBanner(id);
  }
}
