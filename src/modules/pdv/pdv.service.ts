import { RegisterPaymentDto } from "./dto/register-payment.dto";
import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSaleDto } from "./dto/create-sale.dto";
import { OpenCashRegisterDto } from "./dto/open-cash-register.dto";
import { CloseCashRegisterDto } from "./dto/close-cash-register.dto";

@Injectable()
export class PdvService {
  async registerPayment(dto: RegisterPaymentDto, user: any) {
    // 1. Verifica se a venda existe
    const sale = await this.prisma.sale.findUnique({
      where: { id: dto.saleId },
      include: { pdvPayments: true },
    });
    if (!sale) {
      throw new BadRequestException("Venda não encontrada");
    }

    // 2. Cria o pagamento
    const payment = await this.prisma.pdvPayment.create({
      data: {
        saleId: dto.saleId,
        method: dto.method,
        amount: dto.amount,
        status: dto.status || "RECEBIDO",
      },
    });

    // 3. (Opcional) Atualiza status da venda se necessário
    // Exemplo: se soma dos pagamentos >= totalAmount, marca como COMPLETED
    const totalPago =
      sale.pdvPayments.reduce((sum, p) => sum + p.amount, 0) + dto.amount;
    if (totalPago >= sale.totalAmount && sale.status !== "COMPLETED") {
      await this.prisma.sale.update({
        where: { id: sale.id },
        data: { status: "COMPLETED" },
      });
    }

    return payment;
  }
  constructor(private readonly prisma: PrismaService) {}

  async createSale(dto: CreateSaleDto, user: any) {
    // Proteção: exige caixa aberto e impede vendas duplicadas
    const sale = await this.prisma.$transaction(async () => {
      // 0. Exigir caixa aberto para o operador (se cashRegisterId não for passado, buscar o aberto)
      let cashRegisterId = dto.cashRegisterId;
      if (!cashRegisterId) {
        const caixaAberto = await this.prisma.cashRegister.findFirst({
          where: {
            openedById: user?.userId,
            status: "OPEN",
          },
        });
        if (!caixaAberto) {
          throw new BadRequestException(
            "Nenhum caixa aberto para este operador. Abra um caixa antes de registrar vendas.",
          );
        }
        cashRegisterId = caixaAberto.id;
      } else {
        const caixa = await this.prisma.cashRegister.findUnique({
          where: { id: cashRegisterId },
        });
        if (!caixa || caixa.status !== "OPEN") {
          throw new BadRequestException("O caixa informado não está aberto.");
        }
      }

      // 1. Buscar todas as variações envolvidas
      const variationIds = dto.items.map((item) => item.productId);
      const variations = await this.prisma.productVariation.findMany({
        where: { id: { in: variationIds } },
      });

      // 2. Validar estoque suficiente
      for (const item of dto.items) {
        const variation = variations.find((v) => v.id === item.productId);
        if (!variation) {
          throw new BadRequestException(
            `Variação não encontrada: ${item.productId}`,
          );
        }
        if (variation.stockOnHand < item.quantity) {
          throw new BadRequestException(
            `Estoque insuficiente para SKU ${variation.sku || variation.id}`,
          );
        }
      }

      // 3. Proteção contra vendas duplicadas (idempotência simples por hash dos itens e valor)
      const vendaExistente = await this.prisma.sale.findFirst({
        where: {
          userId: dto.userId ?? user?.userId ?? null,
          totalAmount: dto.totalAmount,
          status: "COMPLETED",
          cashRegisterId: cashRegisterId,
          createdAt: {
            gte: new Date(Date.now() - 1000 * 60 * 2), // 2 minutos
          },
        },
        orderBy: { createdAt: "desc" },
      });
      if (vendaExistente) {
        throw new BadRequestException(
          "Venda já registrada recentemente. Evite vendas duplicadas.",
        );
      }

      // 4. Baixar estoque das variações
      for (const item of dto.items) {
        await this.prisma.productVariation.update({
          where: { id: item.productId },
          data: { stockOnHand: { decrement: item.quantity } },
        });
      }

      // 5. Criar venda e itens
      const createdSale = await this.prisma.sale.create({
        data: {
          userId: dto.userId ?? user?.userId ?? null,
          totalAmount: dto.totalAmount,
          status: dto.status as any,
          cashRegisterId: cashRegisterId,
          items: {
            create: dto.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      });

      // 6. Log de auditoria
      await this.prisma.auditLog.create({
        data: {
          actorUserId: user?.userId ?? null,
          action: "PDV_CREATE_SALE",
          entityType: "Sale",
          entityId: String(createdSale.id),
          metadata: { sale: createdSale, user: user },
        },
      });
      return createdSale;
    });
    return sale;
  }

  async listSales(query: any) {
    // Filtros: data inicial/final, userId, status
    const { startDate, endDate, userId, status, cashRegisterId } = query;
    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (cashRegisterId) where.cashRegisterId = Number(cashRegisterId);
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    const sales = await this.prisma.sale.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return sales;
  }

  async getReport(query: any) {
    // Filtros: data inicial/final, produto, caixa
    const { startDate, endDate, productId, cashRegisterId } = query;
    const saleWhere: any = {};
    if (cashRegisterId) saleWhere.cashRegisterId = Number(cashRegisterId);
    if (startDate || endDate) {
      saleWhere.createdAt = {};
      if (startDate) saleWhere.createdAt.gte = new Date(startDate);
      if (endDate) saleWhere.createdAt.lte = new Date(endDate);
    }

    // Busca vendas e itens
    const sales = await this.prisma.sale.findMany({
      where: saleWhere,
      include: { items: true },
    });

    // Filtra por produto se necessário
    let filteredSales = sales;
    if (productId) {
      filteredSales = sales.filter((sale: any) =>
        sale.items.some((item: any) => item.productId === productId),
      );
    }

    // Agregações
    const totalVendas = filteredSales.length;
    const totalItens = filteredSales.reduce(
      (sum: number, sale: any) =>
        sum + sale.items.reduce((s: number, i: any) => s + i.quantity, 0),
      0,
    );
    const totalReceita = filteredSales.reduce(
      (sum: number, sale: any) => sum + sale.totalAmount,
      0,
    );

    return {
      totalVendas,
      totalItens,
      totalReceita,
      periodo: { startDate, endDate },
      filtroProduto: productId ?? null,
      filtroCaixa: cashRegisterId ?? null,
    };
  }

  async openCashRegister(dto: OpenCashRegisterDto, user: any) {
    // Valida que o usuário tem um User vinculado
    if (!user?.userId) {
      throw new BadRequestException(
        "Usuário não possui perfil vinculado. Entre em contato com o administrador."
      );
    }

    // Cria registro de caixa aberto e loga auditoria
    const cashRegister = await this.prisma.cashRegister.create({
      data: {
        openedAt: new Date(),
        openedById: user.userId,
        initialValue: dto.initialValue,
        status: "OPEN",
      },
    });
    await this.prisma.auditLog.create({
      data: {
        actorUserId: user?.userId ?? null,
        action: "PDV_OPEN_CASH_REGISTER",
        entityType: "CashRegister",
        entityId: String(cashRegister.id),
        metadata: { cashRegister, user },
      },
    });
    return cashRegister;
  }

  async closeCashRegister(dto: CloseCashRegisterDto, user: any) {
    // Valida que o usuário tem um User vinculado
    if (!user?.userId) {
      throw new BadRequestException(
        "Usuário não possui perfil vinculado. Entre em contato com o administrador."
      );
    }

    // 1. Buscar caixa e vendas do período
    const cashRegister = await this.prisma.cashRegister.findUnique({
      where: { id: dto.cashRegisterId },
    });
    if (!cashRegister) throw new BadRequestException("Caixa não encontrado");
    if (cashRegister.status === "CLOSED")
      throw new BadRequestException("Caixa já está fechado");

    // Busca vendas do caixa
    const sales = await this.prisma.sale.findMany({
      where: { cashRegisterId: dto.cashRegisterId, status: "COMPLETED" },
      include: { items: true },
    });
    const totalVendas = sales.length;
    const totalRecebido = sales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0,
    );

    // Conferência
    const valorEsperado = cashRegister.initialValue + totalRecebido;
    const diferenca = (dto.finalValue ?? 0) - valorEsperado;

    // 2. Fechar caixa
    const closedAt = dto.closedAt ? new Date(dto.closedAt) : new Date();
    const updatedCashRegister = await this.prisma.cashRegister.update({
      where: { id: dto.cashRegisterId },
      data: {
        closedAt,
        closedById: user.userId,
        finalValue: dto.finalValue,
        status: "CLOSED",
      },
    });

    // 3. Log auditoria
    await this.prisma.auditLog.create({
      data: {
        actorUserId: user?.userId ?? null,
        action: "PDV_CLOSE_CASH_REGISTER",
        entityType: "CashRegister",
        entityId: String(updatedCashRegister.id),
        metadata: {
          cashRegister: updatedCashRegister,
          user,
          relatorio: {
            totalVendas,
            totalRecebido,
            valorEsperado,
            valorInformado: dto.finalValue,
            diferenca,
            vendas: sales,
          },
        },
      },
    });

    // 4. Retornar relatório detalhado
    return {
      caixa: updatedCashRegister,
      relatorio: {
        totalVendas,
        totalRecebido,
        valorEsperado,
        valorInformado: dto.finalValue,
        diferenca,
        vendas: sales,
      },
    };
  }

  async listCashRegisters(query: any) {
    // Filtros: status, openedById, período
    const { status, openedById, startDate, endDate } = query;
    const where: any = {};
    if (status) where.status = status;
    if (openedById) where.openedById = openedById;
    if (startDate || endDate) {
      where.openedAt = {};
      if (startDate) where.openedAt.gte = new Date(startDate);
      if (endDate) where.openedAt.lte = new Date(endDate);
    }
    const cashRegisters = await this.prisma.cashRegister.findMany({
      where,
      orderBy: { openedAt: "desc" },
    });
    return cashRegisters;
  }

  async getProductByBarcode(barcode: string) {
    const product = await this.prisma.product.findUnique({
      where: { barcode },
      include: { images: true, variations: true },
    });
    if (!product) {
      return { error: "Produto não encontrado", barcode };
    }
    return product;
  }
}
