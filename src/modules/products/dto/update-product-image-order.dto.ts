import { Type } from "class-transformer";
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from "class-validator";

export class ProductImageOrderItemDto {
  @IsString()
  @IsNotEmpty()
  imageId!: string;

  @IsInt()
  order!: number;
}

export class UpdateProductImageOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageOrderItemDto)
  items!: ProductImageOrderItemDto[];
}
