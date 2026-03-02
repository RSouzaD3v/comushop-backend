import { IsInt, IsString, IsOptional } from "class-validator";

export class CloseCashRegisterDto {
  @IsString()
  closedById!: string;

  @IsInt()
  cashRegisterId!: number;

  @IsInt()
  finalValue!: number;

  @IsOptional()
  @IsString()
  closedAt?: string;
}
