import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DashboardKPIsDto } from "./dto/dashboard-kpis.dto";
import { SalesChartDto, SalesDataPoint } from "./dto/sales-chart.dto";
import { TopProductsDto, TopProductDto } from "./dto/top-products.dto";
import {
  OrdersListDto,
  DashboardOrderDto,
  OrderItemDto,
} from "./dto/dashboard-orders.dto";
import { OrdersQueryDto } from "./dto/orders-query.dto";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getKPIs(companyId: string): Promise<DashboardKPIsDto> {
    // Verificar se empresa existe
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException("Empresa não encontrada");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Pedidos de hoje
    const todayOrders = await this.prisma.order.count({
      where: {
        companyId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Receita de hoje (apenas pedidos pagos)
    const todayRevenue = await this.prisma.order.aggregate({
      where: {
        companyId,
        status: "PAID",
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      _sum: {
        totalCents: true,
      },
    });

    // Pedidos pendentes
    const pendingOrders = await this.prisma.order.count({
      where: {
        companyId,
        status: "PENDING_PAYMENT",
      },
    });

    // Produtos ativos
    const activeProducts = await this.prisma.product.count({
      where: {
        companyId,
        status: "ACTIVE",
      },
    });

    // Total de clientes únicos
    const totalCustomers = await this.prisma.order.findMany({
      where: { companyId },
      select: { customerUserId: true },
      distinct: ["customerUserId"],
    });

    // Valor médio do pedido (últimos 30 dias, apenas pagos)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await this.prisma.order.aggregate({
      where: {
        companyId,
        status: "PAID",
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _avg: {
        totalCents: true,
      },
    });

    return {
      todayOrders,
      todayRevenue: todayRevenue._sum.totalCents || 0,
      pendingOrders,
      activeProducts,
      totalCustomers: totalCustomers.length,
      averageOrderValue: Math.round(recentOrders._avg.totalCents || 0),
    };
  }

  async getSalesChart(
    companyId: string,
    period: "day" | "week" | "month" = "week",
  ): Promise<SalesChartDto> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException("Empresa não encontrada");
    }

    const now = new Date();
    let startDate = new Date();
    let groupByFormat: string;

    // Definir período e formato de agrupamento
    if (period === "day") {
      startDate.setHours(0, 0, 0, 0);
      groupByFormat = "hour";
    } else if (period === "week") {
      startDate.setDate(now.getDate() - 7);
      groupByFormat = "day";
    } else {
      startDate.setDate(now.getDate() - 30);
      groupByFormat = "day";
    }

    // Buscar pedidos pagos no período
    const orders = await this.prisma.order.findMany({
      where: {
        companyId,
        status: "PAID",
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
      select: {
        totalCents: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Agrupar dados por data
    const dataMap = new Map<string, { revenue: number; orders: number }>();

    orders.forEach((order) => {
      let key: string;
      if (period === "day") {
        // Agrupar por hora
        key = order.createdAt.toISOString().substring(0, 13) + ":00:00.000Z";
      } else {
        // Agrupar por dia
        key = order.createdAt.toISOString().substring(0, 10);
      }

      if (!dataMap.has(key)) {
        dataMap.set(key, { revenue: 0, orders: 0 });
      }

      const current = dataMap.get(key)!;
      current.revenue += order.totalCents;
      current.orders += 1;
    });

    // Converter para array
    const data: SalesDataPoint[] = Array.from(dataMap.entries()).map(
      ([date, values]) => ({
        date,
        revenue: values.revenue,
        orders: values.orders,
      }),
    );

    // Calcular totais
    const totalRevenue = data.reduce((sum, point) => sum + point.revenue, 0);
    const totalOrders = data.reduce((sum, point) => sum + point.orders, 0);
    const averageOrderValue =
      totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    return {
      period,
      data,
      totalRevenue,
      totalOrders,
      averageOrderValue,
    };
  }

  async getTopProducts(
    companyId: string,
    limit = 10,
  ): Promise<TopProductsDto> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException("Empresa não encontrada");
    }

    // Últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Buscar itens de pedidos pagos
    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          companyId,
          status: "PAID",
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      },
      select: {
        productId: true,
        quantity: true,
        totalPriceCents: true,
        productSnapshot: true,
      },
    });

    // Agrupar por produto
    const productsMap = new Map<
      string,
      { name: string; quantity: number; revenue: number; imageUrl?: string }
    >();

    orderItems.forEach((item) => {
      if (!item.productId) return;

      if (!productsMap.has(item.productId)) {
        const snapshot = item.productSnapshot as any;
        productsMap.set(item.productId, {
          name: snapshot?.name || "Produto Desconhecido",
          quantity: 0,
          revenue: 0,
          imageUrl: snapshot?.images?.[0]?.imageUrl,
        });
      }

      const current = productsMap.get(item.productId)!;
      current.quantity += item.quantity;
      current.revenue += item.totalPriceCents;
    });

    // Converter para array e ordenar por receita
    const products: TopProductDto[] = Array.from(productsMap.entries())
      .map(([productId, data]) => {
        const product: TopProductDto = {
          productId,
          productName: data.name,
          quantitySold: data.quantity,
          revenue: data.revenue,
        };
        if (data.imageUrl) {
          product.imageUrl = data.imageUrl;
        }
        return product;
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    return {
      products,
      period: "last_30_days",
    };
  }

  async getOrders(
    companyId: string,
    query: OrdersQueryDto,
  ): Promise<OrdersListDto> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException("Empresa não encontrada");
    }

    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    const offset = query.offset ? parseInt(query.offset, 10) : 0;

    // Construir filtros
    const where: any = { companyId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    // Buscar pedidos com paginação
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          customer: {
            select: {
              displayName: true,
              email: true,
            },
          },
          items: {
            select: {
              quantity: true,
              unitPriceCents: true,
              totalPriceCents: true,
              productSnapshot: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      }),
      this.prisma.order.count({ where }),
    ]);

    // Mapear para DTO
    const mappedOrders: DashboardOrderDto[] = orders.map((order) => ({
      id: order.id,
      status: order.status,
      customerName: order.customer?.displayName || order.customer?.email || "Anônimo",
      totalCents: order.totalCents,
      items: order.items.map((item) => {
        const snapshot = item.productSnapshot as any;
        return {
          productName: snapshot?.name || "Produto",
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          totalPriceCents: item.totalPriceCents,
        };
      }),
      createdAt: order.createdAt,
    }));

    return {
      orders: mappedOrders,
      total,
      limit,
      offset,
    };
  }
}
