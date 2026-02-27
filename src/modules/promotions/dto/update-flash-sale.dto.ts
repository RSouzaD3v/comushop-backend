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

export class UpdateFlashSaleDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99)
  discountPercent?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
