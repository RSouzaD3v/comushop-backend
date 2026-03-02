import {
  IsInt,
  IsArray,
  ValidateNested,
  IsOptional,
  IsString,
} from "class-validator";
import { Type } from "class-transformer";

class SaleItemDto {
  @IsString()
  productId!: string;

  @IsInt()
  quantity!: number;

  @IsInt()
  price!: number; // em centavos
}

export class CreateSaleDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items!: SaleItemDto[];

  @IsInt()
  totalAmount!: number;

  @IsString()
  status!: string;

  @IsOptional()
  @IsInt()
  cashRegisterId?: number;
}
