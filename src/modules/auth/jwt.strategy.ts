import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthUserRepository } from "./repositories/auth-user.repository";

type JwtPayload = {
  sub: string;
  email?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly authUserRepo: AuthUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("JWT_ACCESS_SECRET"),
    });
  }

  async validate(payload: JwtPayload) {
    const authUser = await this.authUserRepo.findById(payload.sub);

    if (!authUser) {
      throw new UnauthorizedException("Usuário não encontrado ou inativo.");
    }

    return {
      id: authUser.id,
      email: authUser.email,
      name: authUser.name,
      role: authUser.user?.role || "CUSTOMER",
    };
  }
}
