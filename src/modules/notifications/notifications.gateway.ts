import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
@WebSocketGateway({
  cors: {
    origin: "*", // Configure this properly in production
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      console.log("🔵 Cliente tentando conectar:", client.id);

      // Extract token from handshake auth or query
      let token =
        client.handshake.auth.token || client.handshake.query.token;

      console.log("🔑 Auth token:", client.handshake.auth?.token);
      console.log("🔑 Query token:", client.handshake.query?.token);

      // Query params can come as array, get first element
      if (Array.isArray(token)) {
        token = token[0];
      }

      if (!token || typeof token !== "string") {
        console.log("❌ Token não fornecido ou inválido");
        client.disconnect();
        return;
      }

      // Verify JWT token
      const secret = process.env.JWT_ACCESS_SECRET;
      if (!secret) {
        console.log("❌ JWT_ACCESS_SECRET não configurado");
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, { secret });
      console.log("✅ JWT válido, payload:", payload);

      // JWT contains 'sub' which is the authUserId
      const authUserId = payload.sub;

      if (!authUserId) {
        console.log("❌ authUserId (sub) não encontrado no payload");
        client.disconnect();
        return;
      }

      // Get the actual User.id from AuthUser
      const authUser = await this.prisma.authUser.findUnique({
        where: { id: authUserId },
        select: { userId: true },
      });

      if (!authUser || !authUser.userId) {
        console.log("❌ AuthUser não encontrado ou sem userId vinculado");
        client.disconnect();
        return;
      }

      const userId = authUser.userId;

      // Store socket connection
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Store userId in socket data for disconnect
      client.data.userId = userId;

      console.log(`✅ User ${userId} connected via socket ${client.id}`);
    } catch (error) {
      console.error("❌ WebSocket authentication failed:", error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
      console.log(`User ${userId} disconnected socket ${client.id}`);
    }
  }

  // Helper method to emit notification to a specific user
  emitToUser(userId: string, event: string, data: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
    }
  }

  // Send notification to user
  sendNotificationToUser(userId: string, notification: any) {
    this.emitToUser(userId, "notification", notification);
  }
}
