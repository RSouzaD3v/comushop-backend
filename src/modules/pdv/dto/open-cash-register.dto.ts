import { IsInt } from "class-validator";

export class OpenCashRegisterDto {
  @IsInt()
  initialValue!: number;
}
