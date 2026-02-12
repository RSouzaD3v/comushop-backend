import { IsArray, IsInt, IsOptional, IsString, Min, MinLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateProductVariationDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  attributes?: any;

  @IsInt()
  @Min(0)
  priceCents!: number;

  @IsInt()
  @Min(0)
  stockOnHand!: number;
}

export class CreateProductDto {
  @IsString()
  companyId!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariationDto)
  variations?: CreateProductVariationDto[];
}

