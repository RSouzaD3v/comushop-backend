import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async listNotifications(
    @CurrentUser("userId") userId: string,
    @Query("limit") limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.notificationsService.listNotifications(userId, parsedLimit);
  }

  @Get("unread-count")
  async getUnreadCount(@CurrentUser("userId") userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch(":id/read")
  async markAsRead(
    @CurrentUser("userId") userId: string,
    @Param("id") id: string,
  ) {
    return this.notificationsService.markAsRead(userId, id);
  }

  @Patch("read-all")
  async markAllAsRead(@CurrentUser("userId") userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(":id")
  async deleteNotification(
    @CurrentUser("userId") userId: string,
    @Param("id") id: string,
  ) {
    return this.notificationsService.deleteNotification(userId, id);
  }
}
