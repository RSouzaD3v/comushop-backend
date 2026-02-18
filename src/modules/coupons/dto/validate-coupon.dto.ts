import { IsString, IsNotEmpty, IsNumber, Min } from "class-validator";
import { Transform } from "class-transformer";

export class ValidateCouponDto {
  @IsString()
  @IsNotEmpty({ message: "O código do cupom é obrigatório." })
  code!: string;

  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: "O subtotal deve ser um número válido." })
  @Min(0)
  subtotalCents!: number;
}
