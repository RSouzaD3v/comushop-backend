import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";

@Injectable()
export class SellerOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("User not authenticated");
    }

    if (user.role !== "ADMIN" && user.role !== "SELLER") {
      throw new ForbiddenException(
        "Only sellers or admins can access this resource",
      );
    }

    return true;
  }
}
