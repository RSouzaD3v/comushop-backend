import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import type { Request } from "express";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Post("login")
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Post("refresh")
  async refresh(@Body() dto: RefreshDto) {
    return await this.authService.refresh(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@Req() req: Request) {
    return { user: (req as any).user };
  }
}
