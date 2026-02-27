import { OrderStatus } from "@prisma/client";

export class OrderItemDto {
  productName!: string;
  quantity!: number;
  unitPriceCents!: number;
  totalPriceCents!: number;
}

export class DashboardOrderDto {
  id!: string;
  status!: OrderStatus;
  customerName?: string;
  totalCents!: number;
  items!: OrderItemDto[];
  createdAt!: Date;
}

export class OrdersListDto {
  orders!: DashboardOrderDto[];
  total!: number;
  limit!: number;
  offset!: number;
}
