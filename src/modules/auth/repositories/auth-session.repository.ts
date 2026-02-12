import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AuthSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: { authUserId: string; refreshTokenHash: string }) {
    return await this.prisma.authSession.create({
      data: {
        authUserId: input.authUserId,
        refreshTokenHash: input.refreshTokenHash,
      },
    });
  }

  async revoke(sessionId: string) {
    return await this.prisma.authSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  async findByRefreshToken(refreshToken: string) {
    const candidates = await this.prisma.authSession.findMany({
      where: { revokedAt: null },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { authUser: true },
    });

    for (const s of candidates) {
      const ok = await bcrypt.compare(refreshToken, s.refreshTokenHash);
      if (ok) return s;
    }
    return null;
  }
}
