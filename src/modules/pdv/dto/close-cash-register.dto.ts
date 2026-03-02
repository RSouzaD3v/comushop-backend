import { IsInt, IsString, IsOptional } from "class-validator";

export class CloseCashRegisterDto {
  @IsInt()
  cashRegisterId!: number;

  @IsInt()
  finalValue!: number;

  @IsOptional()
  @IsString()
  closedAt?: string;
}
