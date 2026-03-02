import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SaleRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Métodos de acesso ao banco para vendas serão implementados aqui
}
