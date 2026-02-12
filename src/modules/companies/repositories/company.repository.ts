import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: { name: string; slug: string; ownerUserId?: string | null }) {
    return await this.prisma.company.create({
      data: {
        name: input.name,
        slug: input.slug,
        ownerUserId: input.ownerUserId ?? null,
      },
    });
  }

  async findById(id: string) {
    return await this.prisma.company.findUnique({ where: { id } });
  }

  async findBySlug(slug: string) {
    return await this.prisma.company.findUnique({ where: { slug } });
  }

  async list() {
    return await this.prisma.company.findMany({ orderBy: { createdAt: "desc" } });
  }

  async update(id: string, input: { name?: string; slug?: string }) {
    return await this.prisma.company.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
      },
    });
  }
}

