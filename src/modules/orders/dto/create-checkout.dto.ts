import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class CheckoutItemDto {
  @IsString()
  variationId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateCheckoutDto {
  @IsOptional()
  @IsString()
  customerUserId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];
}
