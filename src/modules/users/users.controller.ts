import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Patch,
  Param,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateAddressDto } from "./dto/create-address.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("addresses")
  async getAddresses(@CurrentUser("userId") userId: string) {
    return this.usersService.listAddresses(userId);
  }

  @Post("addresses")
  async addAddress(@CurrentUser() user: any, @Body() dto: CreateAddressDto) {
    return this.usersService.createAddress(user.userId, dto);
  }

  @Delete("addresses/:id")
  async removeAddress(@CurrentUser() user: any, @Param("id") id: string) {
    return this.usersService.deleteAddress(user.userId, id);
  }

  @Patch("addresses/:id")
  async updateAddress(
    @CurrentUser("userId") userId: string,
    @Param("id") id: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.usersService.updateAddress(userId, id, dto);
  }
}
