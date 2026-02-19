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
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.company.deleteMany();
    await prisma.userAddress.deleteMany();
    await prisma.authUser.deleteMany();
    await prisma.user.deleteMany();
  } catch (err) {
    console.log("Aviso: Algumas tabelas podem estar vazias ou não migradas.");
  }

  console.log("Semeando usuários, endereços e produtos...");

  // 1. Criar Cliente com Endereços Reais
  const clienteProfile = await prisma.user.create({
    data: {
      email: "cliente@teste.com",
      displayName: "Paulo André (Cliente)",
      role: "CUSTOMER",
      addresses: {
        create: [
          {
            description: "Minha Casa",
            zipCode: "74000100",
            street: "Avenida T-63",
            number: "123",
            neighborhood: "Setor Bueno",
            city: "Goiânia",
            state: "GO",
            isDefault: true,
          },
          {
            description: "Trabalho",
            zipCode: "01310100",
            street: "Avenida Paulista",
            number: "1000",
            neighborhood: "Bela Vista",
            city: "São Paulo",
            state: "SP",
            isDefault: false,
          },
        ],
      },
    },
  });

  // 2. Criar Vendedor e Loja
  const vendedorProfile = await prisma.user.create({
    data: {
      email: "vendedor@teste.com",
      displayName: "Vendedor Oficial",
      role: "SELLER",
    },
  });

  const loja = await prisma.company.create({
    data: {
      name: "Minha Loja de Teste",
      slug: "minha-loja-de-teste",
      ownerUserId: vendedorProfile.id,
    },
  });

  // 3. Criar Categorias
  const categoriasData = [
    { name: "Roupas", slug: "roupas" },
    { name: "Eletrônicos", slug: "eletronicos" },
    { name: "Casa", slug: "casa" },
    { name: "Beleza", slug: "beleza" },
    { name: "Esportes", slug: "esportes" },
    { name: "Outros", slug: "outros" },
  ];

  const categorias = await Promise.all(
    categoriasData.map((cat) =>
      prisma.category.create({
        data: cat,
      }),
    ),
  );

  // 4. Criar Produtos de Exemplo para a Loja
  const categoriasNames = [
    "Roupas",
    "Eletrônicos",
    "Casa",
    "Beleza",
    "Esportes",
    "Outros",
  ];
  for (let i = 1; i <= 6; i++) {
    await prisma.product.create({
      data: {
        companyId: loja.id,
        name: `Produto Exemplo ${i}`,
        description: `Descrição do produto ${i} para testes de vitrine.`,
        categoryId: categorias[i % categorias.length]!.id,
        status: "ACTIVE",
        variations: {
          create: [
            {
              sku: `SKU-${i}`,
              priceCents: 1990 * i,
              stockOnHand: 100,
              title: "Padrão",
            },
          ],
        },
      },
    });
  }

  // 5. Criar Admin
  const adminProfile = await prisma.user.create({
    data: {
      email: "admin@teste.com",
      displayName: "Administrador do Sistema",
      role: "ADMIN",
    },
  });

  // 6. Semeando as contas de Autenticação (AuthUser)
  await prisma.authUser.createMany({
    data: [
      {
        email: "cliente@teste.com",
        name: "Cliente Teste",
        passwordHash: passwordHash,
        userId: clienteProfile.id,
      },
      {
        email: "vendedor@teste.com",
        name: "Vendedor Teste",
        passwordHash: passwordHash,
        userId: vendedorProfile.id,
      },
      {
        email: "admin@teste.com",
        name: "Admin Teste",
        passwordHash: passwordHash,
        userId: adminProfile.id,
      },
    ],
  });

  await prisma.coupon.upsert({
    where: { code: "COMUSHOP10" },
    update: {},
    create: {
      code: "COMUSHOP10",
      discountType: "PERCENTAGE",
      value: 10,
      minPurchaseCents: 5000,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "BEMVINDO20" },
    update: {},
    create: {
      code: "BEMVINDO20",
      discountType: "FIXED",
      value: 2000,
      minPurchaseCents: 10000,
      isActive: true,
    },
  });

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
