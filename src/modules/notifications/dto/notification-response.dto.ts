import { NotificationType } from "@prisma/client";

export class NotificationResponseDto {
  id!: string;
  type!: NotificationType;
  title!: string;
  message!: string;
  data?: any;
  isRead!: boolean;
  createdAt!: Date;
}
