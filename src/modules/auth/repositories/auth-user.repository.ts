import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AuthUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return await this.prisma.authUser.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            companiesOwned: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return await this.prisma.authUser.findUnique({
      where: { email },
      include: {
        user: {
          include: {
            companiesOwned: true,
          },
        },
      },
    });
  }

  async create(input: {
    email: string;
    passwordHash: string;
    name: string | null;
    userId?: string | null;
  }) {
    try {
      return await this.prisma.authUser.create({
        data: {
          email: input.email,
          passwordHash: input.passwordHash,
          name: input.name,
          userId: input.userId ?? null,
        },
      });
    } catch (e: any) {
      // Prisma unique constraint
      if (e?.code === "P2002")
        throw new ConflictException("Email already in use");
      throw e;
    }
  }
}
