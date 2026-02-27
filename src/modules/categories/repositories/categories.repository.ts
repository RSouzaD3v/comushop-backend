import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
  }) {
    return await this.prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        imageUrl: data.imageUrl ?? null,
      },
    });
  }

  async findAll(take?: number) {
    return await this.prisma.category.findMany({
      orderBy: { name: "asc" },
      take: take ?? 100,
    });
  }

  async findById(id: string) {
    return await this.prisma.category.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string) {
    return await this.prisma.category.findUnique({
      where: { slug },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string | null;
      imageUrl?: string | null;
    },
  ) {
    const updateData: any = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.slug !== undefined) {
      updateData.slug = data.slug;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.imageUrl !== undefined) {
      updateData.imageUrl = data.imageUrl;
    }

    return await this.prisma.category.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return await this.prisma.category.delete({
      where: { id },
    });
  }
}
