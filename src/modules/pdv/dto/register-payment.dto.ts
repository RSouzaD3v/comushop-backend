import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { PaymentMethod } from "@prisma/client";

export class RegisterPaymentDto {
  @IsInt()
  @IsNotEmpty()
  saleId!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsInt()
  @IsNotEmpty()
  amount!: number; // em centavos

  @IsString()
  @IsOptional()
  status?: string; // RECEBIDO, PENDENTE, etc
}
