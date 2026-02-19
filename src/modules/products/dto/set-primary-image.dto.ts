import { IsNotEmpty, IsString } from "class-validator";

export class SetPrimaryImageDto {
  @IsString()
  @IsNotEmpty()
  imageId!: string;
}
