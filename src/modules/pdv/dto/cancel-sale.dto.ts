import { IsInt, IsString, IsOptional } from "class-validator";

export class CancelSaleDto {
  @IsInt()
  saleId!: number;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  cancelledByUserId?: string;
}
