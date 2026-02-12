import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import { AuthUserRepository } from "./repositories/auth-user.repository";
import { AuthSessionRepository } from "./repositories/auth-session.repository";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authUserRepo: AuthUserRepository,
    private readonly authSessionRepo: AuthSessionRepository
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const authUser = await this.authUserRepo.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      name: dto.name ?? null,
    });

    const tokens = await this.issueTokens(authUser.id);
    return { authUser: this.sanitizeAuthUser(authUser), ...tokens };
  }

  async login(dto: LoginDto) {
    const authUser = await this.authUserRepo.findByEmail(
      dto.email.toLowerCase()
    );
    if (!authUser) throw new UnauthorizedException("Invalid credentials");

    const ok = await bcrypt.compare(dto.password, authUser.passwordHash);
    if (!ok) throw new UnauthorizedException("Invalid credentials");

    const tokens = await this.issueTokens(authUser.id);
    return { authUser: this.sanitizeAuthUser(authUser), ...tokens };
  }

  async refresh(dto: RefreshDto) {
    const session = await this.authSessionRepo.findByRefreshToken(
      dto.refreshToken
    );
    if (!session) throw new UnauthorizedException("Invalid refresh token");

    const tokens = await this.issueTokens(session.authUserId);

    await this.authSessionRepo.revoke(session.id);
    return tokens;
  }

  private async issueTokens(authUserId: string) {
    const accessToken = await this.jwtService.signAsync({
      sub: authUserId,
    });

    const refreshToken = randomBytes(48).toString("base64url");
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    await this.authSessionRepo.create({
      authUserId,
      refreshTokenHash,
    });

    return { accessToken, refreshToken };
  }

  private sanitizeAuthUser(authUser: {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return authUser;
  }
}
