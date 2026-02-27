import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { Public } from "../auth/decorators/public.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // Admin - Criar categoria
  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: any) {
    return await this.categoriesService.create(dto);
  }

  // Public - Listar categorias
  @Public()
  @Get()
  async list() {
    return await this.categoriesService.listAll();
  }

  // Public - Buscar por ID
  @Public()
  @Get(":id")
  async getById(@Param("id") id: string) {
    return await this.categoriesService.getById(id);
  }

  // Public - Buscar por slug
  @Public()
  @Get("slug/:slug")
  async getBySlug(@Param("slug") slug: string) {
    return await this.categoriesService.getBySlug(slug);
  }

  // Admin - Atualizar categoria
  @Put(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async update(@Param("id") id: string, @Body() dto: any) {
    return await this.categoriesService.update(id, dto);
  }

  // Admin - Deletar categoria
  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param("id") id: string) {
    await this.categoriesService.delete(id);
  }
}
