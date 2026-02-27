export class SalesDataPoint {
  date!: string; // ISO date
  revenue!: number; // em centavos
  orders!: number;
}

export class SalesChartDto {
  period!: "day" | "week" | "month";
  data!: SalesDataPoint[];
  totalRevenue!: number; // em centavos
  totalOrders!: number;
  averageOrderValue!: number; // em centavos
}
