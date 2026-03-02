import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CashRegisterRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Métodos de acesso ao banco para caixa serão implementados aqui
}
