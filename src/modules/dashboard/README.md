# Dashboard de Vendedor/Admin - ComuShop Backend

## Visão Geral
Sistema completo de analytics e dashboard para vendedores monitorarem suas vendas, produtos e pedidos em tempo real.

## Segurança
- ✅ Todos os endpoints requerem autenticação JWT
- ✅ Apenas o dono da empresa pode acessar o dashboard dela
- ✅ Validação automática de `ownerUserId` antes de qualquer operação

## Endpoints

### 1. KPIs do Dashboard
```
GET /dashboard/:companyId/kpis
Authorization: Bearer {token}

Response:
{
  "todayOrders": 13,
  "todayRevenue": 456700,        // em centavos (R$ 4.567,00)
  "pendingOrders": 3,
  "activeProducts": 45,
  "totalCustomers": 128,
  "averageOrderValue": 35000     // em centavos (R$ 350,00)
}
```

**Métricas:**
- `todayOrders`: Total de pedidos criados hoje (00:00 - 23:59)
- `todayRevenue`: Receita de hoje (apenas pedidos PAID)
- `pendingOrders`: Pedidos aguardando pagamento (status PENDING_PAYMENT)
- `activeProducts`: Produtos com status ACTIVE
- `totalCustomers`: Clientes únicos que já compraram
- `averageOrderValue`: Valor médio dos últimos 30 dias (apenas PAID)

---

### 2. Gráfico de Vendas
```
GET /dashboard/:companyId/sales?period=week
Authorization: Bearer {token}

Query Params:
- period: "day" | "week" | "month" (default: "week")

Response:
{
  "period": "week",
  "data": [
    {
      "date": "2026-02-20",
      "revenue": 125000,  // R$ 1.250,00
      "orders": 5
    },
    {
      "date": "2026-02-21",
      "revenue": 89000,   // R$ 890,00
      "orders": 3
    }
    // ... outros dias
  ],
  "totalRevenue": 856700,     // R$ 8.567,00
  "totalOrders": 42,
  "averageOrderValue": 20397  // R$ 203,97
}
```

**Períodos:**
- `day`: Últimas 24h agrupadas por hora
- `week`: Últimos 7 dias agrupados por dia
- `month`: Últimos 30 dias agrupados por dia

**Nota:** Apenas pedidos com status `PAID` são incluídos.

---

### 3. Produtos Mais Vendidos
```
GET /dashboard/:companyId/top-products?limit=10
Authorization: Bearer {token}

Query Params:
- limit: número de produtos (default: 10)

Response:
{
  "products": [
    {
      "productId": "prod_123",
      "productName": "Camiseta Básica",
      "quantitySold": 45,
      "revenue": 225000,  // R$ 2.250,00
      "imageUrl": "https://s3.amazonaws.com/..."
    },
    {
      "productId": "prod_456",
      "productName": "Calça Jeans",
      "quantitySold": 32,
      "revenue": 192000,  // R$ 1.920,00
      "imageUrl": "https://s3.amazonaws.com/..."
    }
    // ... outros produtos
  ],
  "period": "last_30_days"
}
```

**Cálculo:**
- Baseado nos últimos 30 dias
- Apenas pedidos PAID
- Ordenado por receita (revenue) decrescente
- `imageUrl` é opcional (pode não existir)

---

### 4. Histórico de Pedidos
```
GET /dashboard/:companyId/orders?status=PAID&limit=20&offset=0
Authorization: Bearer {token}

Query Params:
- status: OrderStatus opcional (PENDING_PAYMENT | PAID | CANCELLED | REFUNDED)
- startDate: ISO date (ex: 2026-02-01)
- endDate: ISO date (ex: 2026-02-28)
- limit: número de results (default: 20)
- offset: paginação (default: 0)

Response:
{
  "orders": [
    {
      "id": "order_123",
      "status": "PAID",
      "customerName": "João Silva",
      "totalCents": 15000,  // R$ 150,00
      "items": [
        {
          "productName": "Camiseta Básica",
          "quantity": 2,
          "unitPriceCents": 5000,    // R$ 50,00
          "totalPriceCents": 10000   // R$ 100,00
        },
        {
          "productName": "Calça Jeans",
          "quantity": 1,
          "unitPriceCents": 5000,
          "totalPriceCents": 5000
        }
      ],
      "createdAt": "2026-02-27T10:30:00Z"
    }
    // ... outros pedidos
  ],
  "total": 156,      // total de pedidos que atendem aos filtros
  "limit": 20,
  "offset": 0
}
```

**Filtros:**
- `status`: Filtrar por status específico
- `startDate` + `endDate`: Filtrar por intervalo de datas
- Sem filtros: retorna todos os pedidos da empresa

**Ordenação:** Pedidos mais recentes primeiro (createdAt DESC)

---

## Exemplos de Uso

### Frontend - Buscar KPIs
```typescript
const response = await fetch(`/api/dashboard/${companyId}/kpis`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const kpis = await response.json();
console.log(`Pedidos hoje: ${kpis.todayOrders}`);
console.log(`Receita hoje: R$ ${(kpis.todayRevenue / 100).toFixed(2)}`);
```

### Frontend - Gráfico de Vendas
```typescript
const response = await fetch(
  `/api/dashboard/${companyId}/sales?period=week`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);

const salesData = await response.json();

// Usar com Chart.js, Recharts, etc
const chartData = salesData.data.map(point => ({
  date: new Date(point.date).toLocaleDateString('pt-BR'),
  value: point.revenue / 100  // converter centavos para reais
}));
```

### Frontend - Produtos Mais Vendidos
```typescript
const response = await fetch(
  `/api/dashboard/${companyId}/top-products?limit=5`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);

const { products } = await response.json();

products.forEach(product => {
  console.log(`${product.productName}: ${product.quantitySold} unidades`);
});
```

### Frontend - Pedidos com Filtros
```typescript
const params = new URLSearchParams({
  status: 'PAID',
  startDate: '2026-02-01',
  endDate: '2026-02-28',
  limit: '20',
  offset: '0'
});

const response = await fetch(
  `/api/dashboard/${companyId}/orders?${params}`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);

const { orders, total } = await response.json();
console.log(`${orders.length} de ${total} pedidos`);
```

---

## Conversão de Valores

Todos os valores monetários são retornados em **centavos** para evitar problemas de precisão com decimais.

**Para exibir em reais:**
```typescript
// Backend retorna: 456700
const valueInCents = 456700;
const valueInReais = valueInCents / 100;
console.log(`R$ ${valueInReais.toFixed(2)}`); // R$ 4567.00

// Com formatação brasileira
const formatted = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
}).format(valueInReais);
console.log(formatted); // R$ 4.567,00
```

---

## Status de Pedidos

```typescript
enum OrderStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",  // Aguardando pagamento
  PAID = "PAID",                        // Pagamento confirmado
  CANCELLED = "CANCELLED",              // Cancelado
  REFUNDED = "REFUNDED"                 // Reembolsado
}
```

---

## Erros Comuns

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Você não tem permissão para acessar este dashboard"
}
```
**Causa:** Usuário tentando acessar dashboard de empresa que não é dele.

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Empresa não encontrada"
}
```
**Causa:** `companyId` inválido ou empresa não existe.

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**Causa:** Token JWT ausente, inválido ou expirado.

---

## Performance

### Índices do Banco de Dados
O Prisma Schema já inclui índices otimizados:
- `Order.companyId` - Para queries por empresa
- `Order.status` - Para filtros por status
- `Order.customerUserId` - Para joins com customer
- `Product.companyId` e `Product.status` - Para contagem de produtos ativos

### Cache (Recomendado)
Para dashboards com muitos acessos, considere implementar cache:

```typescript
// Exemplo com Redis (não implementado)
const cacheKey = `dashboard:kpis:${companyId}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const kpis = await dashboardService.getKPIs(companyId);
await redis.setex(cacheKey, 300, JSON.stringify(kpis)); // 5 min TTL
return kpis;
```

---

## Roadmap Futuro

- [ ] Comparação de períodos (ex: "semana passada vs esta semana")
- [ ] Métricas de conversão (visitas → vendas)
- [ ] Exportar relatórios (PDF/Excel)
- [ ] Alertas configuráveis (baixo estoque, queda de vendas, etc)
- [ ] Dashboard de Admin global (todas as lojas)
- [ ] Análise de comportamento de clientes
- [ ] Previsão de vendas com ML

---

## Testing

```bash
# Obter companyId do usuário logado
curl -H "Authorization: Bearer {token}" \
  http://localhost:3000/companies/my-companies

# Testar KPIs
curl -H "Authorization: Bearer {token}" \
  http://localhost:3000/dashboard/{companyId}/kpis

# Testar vendas semanais
curl -H "Authorization: Bearer {token}" \
  http://localhost:3000/dashboard/{companyId}/sales?period=week

# Testar top produtos
curl -H "Authorization: Bearer {token}" \
  http://localhost:3000/dashboard/{companyId}/top-products?limit=5

# Testar pedidos
curl -H "Authorization: Bearer {token}" \
  "http://localhost:3000/dashboard/{companyId}/orders?status=PAID&limit=10"
```
