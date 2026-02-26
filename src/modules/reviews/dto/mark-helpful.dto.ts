import { IsBoolean } from "class-validator";

export class MarkReviewHelpfulDto {
  @IsBoolean()
  helpful!: boolean;
}
