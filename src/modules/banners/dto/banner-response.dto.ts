import { LinkType } from '@prisma/client';

export class BannerResponseDto {
  id!: string;
  title?: string;
  subtitle?: string;
  imageUrl!: string;
  linkUrl?: string;
  linkType!: LinkType;
  linkTargetId?: string;
  position!: number;
  isActive!: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt!: Date;
  updatedAt!: Date;
}
