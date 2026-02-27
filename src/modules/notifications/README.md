# Sistema de Notificações - ComuShop Backend

## Visão Geral

Sistema completo de notificações com suporte a WebSocket para atualizações em tempo real.

## Modelo de Dados

### NotificationType (Enum)

- `ORDER` - Notificações relacionadas a pedidos
- `PAYMENT` - Notificações de pagamento
- `PRODUCT` - Notificações sobre produtos
- `REVIEW` - Notificações de avaliações
- `PROMOTION` - Notificações de promoções
- `SYSTEM` - Notificações do sistema

### Notification (Model)

```typescript
{
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: any (JSON opcional para contexto adicional)
  isRead: boolean
  createdAt: Date
}
```

## API REST Endpoints

### 1. Listar Notificações

```
GET /notifications?limit=50
Authorization: Bearer {token}

Response:
[
  {
    "id": "notif_123",
    "type": "ORDER",
    "title": "Pedido Confirmado",
    "message": "Seu pedido #1234 foi confirmado",
    "data": { "orderId": "order_123" },
    "isRead": false,
    "createdAt": "2026-02-27T10:00:00Z"
  }
]
```

### 2. Contador de Não Lidas

```
GET /notifications/unread-count
Authorization: Bearer {token}

Response:
{
  "count": 5
}
```

### 3. Marcar como Lida

```
PATCH /notifications/:id/read
Authorization: Bearer {token}

Response: {notification}
```

### 4. Marcar Todas como Lidas

```
PATCH /notifications/read-all
Authorization: Bearer {token}

Response: { count: 5 }
```

### 5. Deletar Notificação

```
DELETE /notifications/:id
Authorization: Bearer {token}

Response: { message: "Deleted" }
```

## WebSocket (Real-time)

### Conexão (Frontend)

```typescript
import { io } from "socket.io-client";

const token = localStorage.getItem("token"); // JWT token

const socket = io("http://localhost:3000", {
  auth: {
    token: token,
  },
});

// Ou via query string
const socket = io("http://localhost:3000", {
  query: {
    token: token,
  },
});

// Ouvir notificações
socket.on("notification", (notification) => {
  console.log("Nova notificação:", notification);
  // Atualizar UI
  showNotificationToast(notification);
  updateNotificationBadge();
});

// Verificar conexão
socket.on("connect", () => {
  console.log("Conectado ao WebSocket");
});

socket.on("disconnect", () => {
  console.log("Desconectado do WebSocket");
});
```

### Enviar Notificação (Backend - uso interno)

Para enviar notificação de outro serviço (ex: OrdersService):

```typescript
import { NotificationsService } from "../notifications/notifications.service";
import { NotificationsGateway } from "../notifications/notifications.gateway";

@Injectable()
export class OrdersService {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async createOrder(userId: string, data: any) {
    // ... criar pedido

    // Criar e enviar notificação
    const notification = await this.notificationsService.createNotification({
      userId,
      type: "ORDER",
      title: "Novo Pedido",
      message: "Seu pedido foi criado com sucesso!",
      data: { orderId: order.id },
    });

    // Enviar via WebSocket em tempo real
    this.notificationsGateway.sendNotificationToUser(userId, notification);

    return order;
  }
}
```

## Configuração

### Variáveis de Ambiente

```env
JWT_SECRET=your-secret-key
```

### CORS

Configure o CORS do WebSocket Gateway em produção:

```typescript
// src/modules/notifications/notifications.gateway.ts
@WebSocketGateway({
  cors: {
    origin: 'https://seu-frontend.com',
    credentials: true,
  },
})
```

## Casos de Uso

### 1. Notificação de Pedido

```typescript
{
  type: 'ORDER',
  title: 'Pedido Confirmado',
  message: 'Seu pedido #1234 foi confirmado e está sendo preparado',
  data: { orderId: 'order_123', status: 'confirmed' }
}
```

### 2. Notificação de Pagamento

```typescript
{
  type: 'PAYMENT',
  title: 'Pagamento Aprovado',
  message: 'Pagamento de R$ 150,00 aprovado',
  data: { paymentId: 'pay_456', amount: 150 }
}
```

### 3. Notificação de Promoção

```typescript
{
  type: 'PROMOTION',
  title: 'Flash Sale Ativo!',
  message: 'Produto X com 50% de desconto por tempo limitado',
  data: { flashSaleId: 'flash_789', productId: 'prod_123' }
}
```

## Segurança

- ✅ Autenticação JWT obrigatória via WebSocket
- ✅ Isolamento de notificações por usuário
- ✅ Validação de token antes de aceitar conexão
- ✅ Desconexão automática em caso de falha de autenticação

## Testing

```bash
# Testar endpoints REST
curl -H "Authorization: Bearer {token}" \
  http://localhost:3000/notifications

# Testar WebSocket (via socket.io-client)
npm install socket.io-client
node test-socket.js
```
