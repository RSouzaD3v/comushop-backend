import { Controller, Get, Param } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { Public } from "../auth/decorators/public.decorator";

@Public()
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async list() {
    return await this.categoriesService.listAll();
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    return await this.categoriesService.getById(id);
  }

  @Get("slug/:slug")
  async getBySlug(@Param("slug") slug: string) {
    return await this.categoriesService.getBySlug(slug);
  }
}
