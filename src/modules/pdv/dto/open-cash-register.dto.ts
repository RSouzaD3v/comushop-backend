import { IsInt, IsString } from "class-validator";

export class OpenCashRegisterDto {
  @IsString()
  openedById!: string;

  @IsInt()
  initialValue!: number;
}
