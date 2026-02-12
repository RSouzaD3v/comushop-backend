import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthUserRepository } from "./repositories/auth-user.repository";

type JwtPayload = {
  sub: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly authUserRepo: AuthUserRepository
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("JWT_ACCESS_SECRET"),
    });
  }

  async validate(payload: JwtPayload) {
    const authUser = await this.authUserRepo.findById(payload.sub);
    if (!authUser) return null;
    return {
      id: authUser.id,
      email: authUser.email,
      name: authUser.name,
    };
  }
}
