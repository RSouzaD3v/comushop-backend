import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";

// 1. Carrega o .env manualmente
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não está definido no .env");
}

// Prisma 7: a URL sai do schema; use Driver Adapter (pg).
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("123456", 12);

  console.log("--- 🚀 Iniciando Seed ---");

  console.log("Limpando dados existentes...");

  try {
    // Ordem de limpeza para evitar erros de Foreign Key
    await prisma.auditLog.deleteMany();
    await prisma.paymentTransaction.deleteMany();
    await prisma.refund.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.authSession.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.productVariation.deleteMany();
    await prisma.authUser.deleteMany();
    await prisma.product.deleteMany();
    await prisma.company.deleteMany();
    await prisma.user.deleteMany();
  } catch (err) {
    console.log("Aviso: Algumas tabelas podem estar vazias ou não migradas.");
  }

  const users = [
    {
      email: "cliente@teste.com",
      name: "Cliente Teste",
      displayName: "Cliente ComuShop",
      role: "CUSTOMER",
    },
    {
      email: "vendedor@teste.com",
      name: "Vendedor Teste",
      displayName: "Vendedor Oficial",
      role: "SELLER",
    },
    {
      email: "admin@teste.com",
      name: "Admin Teste",
      displayName: "Administrador do Sistema",
      role: "ADMIN",
    },
  ];

  console.log("Semeando usuários e perfis...");

  for (const userData of users) {
    // 1. Perfil Global
    const userProfile = await prisma.user.create({
      data: {
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role as any,
      },
    });

    // 2. Conta de Autenticação
    await prisma.authUser.create({
      data: {
        email: userData.email,
        name: userData.name,
        passwordHash: passwordHash,
        userId: userProfile.id,
      },
    });

    // 3. Loja para o vendedor
    if (userData.email === "vendedor@teste.com") {
      await prisma.company.create({
        data: {
          name: "Minha Loja de Teste",
          slug: "minha-loja-teste",
          ownerUserId: userProfile.id,
        },
      });
      console.log("✅ Loja de teste criada para o vendedor.");
    }
  }

  console.log("--- ✨ Seed Finalizada com Sucesso! ---");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
