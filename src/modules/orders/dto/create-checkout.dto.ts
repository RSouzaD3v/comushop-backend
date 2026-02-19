import { Type } from "class-transformer";
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

export class CheckoutItemDto {
  @IsString()
  @IsNotEmpty()
  variationId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateCheckoutDto {
  @IsString()
  @IsNotEmpty()
  addressId!: string;

  @IsOptional()
  @IsString()
  customerUserId?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];
}
