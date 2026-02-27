import { IsString, IsOptional, IsInt, IsBoolean, IsEnum, IsUrl, IsDateString, Min } from 'class-validator';
import { LinkType } from '@prisma/client';

export class CreateBannerDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsString()
  imageUrl!: string;

  @IsOptional()
  @IsString()
  linkUrl?: string;

  @IsEnum(LinkType)
  linkType?: LinkType = LinkType.NONE;

  @IsOptional()
  @IsString()
  linkTargetId?: string;

  @IsInt()
  @Min(0)
  position!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
