import { IsOptional, IsEnum, IsDateString } from "class-validator";
import { OrderStatus } from "@prisma/client";

export class OrdersQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  limit?: string;

  @IsOptional()
  offset?: string;
}
