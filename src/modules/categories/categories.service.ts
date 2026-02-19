import { Injectable, NotFoundException } from "@nestjs/common";
import { CategoriesRepository } from "./repositories/categories.repository";

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepo: CategoriesRepository) {}

  async listAll() {
    return await this.categoriesRepo.findAll();
  }

  async getById(id: string) {
    const category = await this.categoriesRepo.findById(id);

    if (!category) {
      throw new NotFoundException("Categoria não encontrada.");
    }

    return category;
  }

  async getBySlug(slug: string) {
    const category = await this.categoriesRepo.findBySlug(slug);

    if (!category) {
      throw new NotFoundException("Categoria não encontrada.");
    }

    return category;
  }
}
