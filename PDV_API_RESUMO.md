# Resumo da API PDV (Ponto de Venda)

## Autenticação

Todos os endpoints exigem autenticação JWT no header:

```
Authorization: Bearer <token>
```

## Endpoints Principais

### 1. Vendas

#### POST /pdv/sale

Cria uma nova venda.

**Request Body:**

```json
{
  "items": [{ "productId": "string", "quantity": 2, "price": 1990 }],
  "totalAmount": 3980,
  "cashRegisterId": 1
}
```

**Response:**

```json
{
  "id": 1,
  "userId": "...",
  "totalAmount": 3980,
  "status": "PENDING",
  "cashRegisterId": 1,
  "items": [ ... ]
}
```

#### GET /pdv/sale

Lista vendas com filtros (ex: ?status=COMPLETED).

**Response:**

```json
[
  { "id": 1, "totalAmount": 3980, ... }
]
```

### 2. Pagamentos

#### POST /pdv/payment

Registra um pagamento para uma venda (dinheiro, cartão, pix, etc).

**Request Body:**

```json
{
  "saleId": 1,
  "method": "DINHEIRO",
  "amount": 3980,
  "status": "RECEBIDO"
}
```

**Response:**

```json
{
  "id": "...",
  "saleId": 1,
  "method": "DINHEIRO",
  "amount": 3980,
  "status": "RECEBIDO",
  "createdAt": "2026-02-27T23:59:00.000Z"
}
```

> O status da venda é atualizado automaticamente para COMPLETED se o valor total for atingido.

### 3. Caixa

#### POST /pdv/cash-register/open

Abre um novo caixa para o operador.

**Request Body:**

```json
{
  "initialValue": 10000
}
```

**Response:**

```json
{
  "id": 1,
  "openedById": "...",
  "status": "OPEN",
  "openedAt": "2026-02-27T09:00:00.000Z"
}
```

#### POST /pdv/cash-register/close

Fecha o caixa, gera relatório de vendas e pagamentos.

**Request Body:**

```json
{
  "finalValue": 15000
}
```

**Response:**

```json
{
  "caixa": { "id": 1, "status": "CLOSED", ... },
  "relatorio": {
    "totalVendas": 5,
    "totalRecebido": 15000,
    "valorEsperado": 15000,
    "valorInformado": 15000,
    "diferenca": 0,
    "vendas": [ ... ]
  }
}
```

#### GET /pdv/cash-register

Lista caixas abertos/fechados.

**Response:**

```json
[
  { "id": 1, "status": "OPEN", ... }
]
```

### 4. Produtos

#### GET /pdv/product/barcode/:barcode

Busca produto pelo código de barras.

**Response:**

```json
{
  "id": "...",
  "name": "Produto Exemplo",
  "barcode": "123456789",
  "variations": [ ... ],
  "images": [ ... ]
}
```

## Modelos Importantes

### Sale

```json
{
  "id": 1,
  "userId": "...",
  "totalAmount": 3980,
  "status": "PENDING",
  "cashRegisterId": 1,
  "items": [ ... ],
  "pdvPayments": [ ... ]
}
```

### PdvPayment

```json
{
  "id": "...",
  "saleId": 1,
  "method": "DINHEIRO",
  "amount": 3980,
  "status": "RECEBIDO",
  "createdAt": "..."
}
```

### CashRegister

```json
{
  "id": 1,
  "openedById": "...",
  "status": "OPEN",
  "openedAt": "...",
  "closedAt": null,
  "sales": [ ... ]
}
```

## Fluxo Básico

1. Operador faz login e abre o caixa.
2. Realiza vendas (`POST /pdv/sale`).
3. Registra pagamentos recebidos (`POST /pdv/payment`).
4. Fecha o caixa (`POST /pdv/cash-register/close`) e obtém relatório.

## Observações

- Todos os endpoints exigem autenticação JWT.
- Permissões: apenas vendedor/admin pode registrar vendas e pagamentos.
- O status da venda é atualizado automaticamente conforme os pagamentos.
- O endpoint de conciliação pode ser implementado conforme necessidade do front.

---

_Para dúvidas ou exemplos adicionais, consulte o backend ou solicite exemplos específicos de payloads._
