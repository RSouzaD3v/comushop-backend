import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class ValidateCouponDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsNumber()
  @IsNotEmpty()
  subtotalCents!: number;
}
