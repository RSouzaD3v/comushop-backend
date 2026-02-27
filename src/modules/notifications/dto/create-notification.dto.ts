import { IsString, IsNotEmpty, IsEnum, IsOptional } from "class-validator";
import { NotificationType } from "@prisma/client";

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsEnum(NotificationType)
  @IsNotEmpty()
  type!: NotificationType;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsOptional()
  data?: any;
}
