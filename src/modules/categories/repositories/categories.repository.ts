import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

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
}
