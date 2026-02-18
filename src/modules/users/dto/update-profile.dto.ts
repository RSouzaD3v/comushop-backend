// src/modules/users/dto/update-profile.dto.ts
import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  displayName?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
