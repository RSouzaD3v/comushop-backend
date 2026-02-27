import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Patch,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UsersService } from "./users.service";
import { CreateAddressDto } from "./dto/create-address.dto";
import { CreatePaymentMethodDto } from "./dto/create-payment-method.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UpdateProfileDto } from "./dto/update-profile.dto";

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

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

  @Get("payment-methods")
  async getPaymentMethods(@CurrentUser("userId") userId: string) {
    return this.usersService.listPaymentMethods(userId);
  }

  @Post("payment-methods")
  async addPaymentMethod(
    @CurrentUser("userId") userId: string,
    @Body() dto: CreatePaymentMethodDto,
  ) {
    return this.usersService.createPaymentMethod(userId, dto);
  }

  @Delete("payment-methods/:id")
  async removePaymentMethod(
    @CurrentUser("userId") userId: string,
    @Param("id") id: string,
  ) {
    return this.usersService.deletePaymentMethod(userId, id);
  }

  @Patch("payment-methods/:id/default")
  async setDefaultPaymentMethod(
    @CurrentUser("userId") userId: string,
    @Param("id") id: string,
  ) {
    return this.usersService.setDefaultPaymentMethod(userId, id);
  }

  @Patch("profile")
  async updateProfile(
    @CurrentUser("userId") userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get("profile")
  async getProfile(@CurrentUser("userId") userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Post("profile/avatar")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
          return cb(new Error("Apenas imagens sao permitidas."), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @CurrentUser("userId") userId: string,
    @UploadedFile() file: UploadedFile,
  ) {
    return await this.usersService.uploadAvatar(userId, file);
  }

  @Delete("profile/avatar")
  async deleteAvatar(@CurrentUser("userId") userId: string) {
    return await this.usersService.deleteAvatar(userId);
  }
}
