import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AuthUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return await this.prisma.authUser.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return await this.prisma.authUser.findUnique({ where: { email } });
  }

  async create(input: {
    email: string;
    passwordHash: string;
    name: string | null;
  }) {
    try {
      return await this.prisma.authUser.create({
        data: {
          email: input.email,
          passwordHash: input.passwordHash,
          name: input.name,
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
