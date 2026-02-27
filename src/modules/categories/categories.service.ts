import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { CategoriesRepository } from "./repositories/categories.repository";

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepo: CategoriesRepository) {}

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
  }) {
    const existing = await this.categoriesRepo.findBySlug(data.slug);
    if (existing) {
      throw new ConflictException("Slug já está em uso.");
    }
    return await this.categoriesRepo.create(data);
  }

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

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      imageUrl?: string;
    },
  ) {
    await this.getById(id);

    if (data.slug) {
      const existing = await this.categoriesRepo.findBySlug(data.slug);
      if (existing && existing.id !== id) {
        throw new ConflictException("Slug já está em uso.");
      }
    }

    return await this.categoriesRepo.update(id, data);
  }

  async delete(id: string) {
    await this.getById(id);
    await this.categoriesRepo.delete(id);
  }
}
