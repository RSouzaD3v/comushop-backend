import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  Max,
  Length,
} from "class-validator";
import { CardType } from "@prisma/client";

export class CreatePaymentMethodDto {
  @IsEnum(CardType)
  @IsNotEmpty()
  cardType!: CardType;

  @IsString()
  @IsNotEmpty()
  holderName!: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  cardLastFour!: string;

  @IsString()
  @IsNotEmpty()
  cardBrand!: string;

  @IsInt()
  @Min(1)
  @Max(12)
  expiryMonth!: number;

  @IsInt()
  @Min(new Date().getFullYear())
  expiryYear!: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
