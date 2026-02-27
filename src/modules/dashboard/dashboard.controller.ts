import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { OrdersQueryDto } from "./dto/orders-query.dto";
import { PrismaService } from "../prisma/prisma.service";

@UseGuards(JwtAuthGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly prisma: PrismaService,
  ) {}

  private async verifyCompanyAccess(userId: string, companyId: string) {
    const company = await this.prisma.company.findFirst({
      where: {
        id: companyId,
        ownerUserId: userId,
      },
    });

    if (!company) {
      throw new ForbiddenException(
        "Você não tem permissão para acessar este dashboard",
      );
    }

    return company;
  }

  @Get(":companyId/kpis")
  async getKPIs(
    @CurrentUser("userId") userId: string,
    @Param("companyId") companyId: string,
  ) {
    await this.verifyCompanyAccess(userId, companyId);
    return this.dashboardService.getKPIs(companyId);
  }

  @Get(":companyId/sales")
  async getSalesChart(
    @CurrentUser("userId") userId: string,
    @Param("companyId") companyId: string,
    @Query("period") period?: "day" | "week" | "month",
  ) {
    await this.verifyCompanyAccess(userId, companyId);
    return this.dashboardService.getSalesChart(
      companyId,
      period || "week",
    );
  }

  @Get(":companyId/top-products")
  async getTopProducts(
    @CurrentUser("userId") userId: string,
    @Param("companyId") companyId: string,
    @Query("limit") limit?: string,
  ) {
    await this.verifyCompanyAccess(userId, companyId);
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.dashboardService.getTopProducts(companyId, parsedLimit);
  }

  @Get(":companyId/orders")
  async getOrders(
    @CurrentUser("userId") userId: string,
    @Param("companyId") companyId: string,
    @Query() query: OrdersQueryDto,
  ) {
    await this.verifyCompanyAccess(userId, companyId);
    return this.dashboardService.getOrders(companyId, query);
  }
}
