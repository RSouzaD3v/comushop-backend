import { IsString, Matches, MinLength } from "class-validator";

export class CreateCompanyDto {
  @IsString()
  @MinLength(2)
  name!: string;

  // simple slug validation: lowercase letters, numbers, hyphens
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;
}

