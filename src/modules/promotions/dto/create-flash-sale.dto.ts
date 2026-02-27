import {
  IsString,
  IsInt,
  IsDateString,
  Min,
  Max,
  IsOptional,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateFlashSaleDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99)
  discountPercent!: number;

  @IsString()
  productId!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
