import { Injectable, NotFoundException } from "@nestjs/common";

import { CreateAddressDto } from "./dto/create-address.dto";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { S3Service } from "../storage/s3.service";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async listAddresses(userId: string) {
    return this.prisma.userAddress.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.userAddress.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.userAddress.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) throw new NotFoundException("Endereço não encontrado");

    return this.prisma.userAddress.delete({
      where: { id: addressId },
    });
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: CreateAddressDto,
  ) {
    const address = await this.prisma.userAddress.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) throw new NotFoundException("Endereço não encontrado");

    if (dto.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.userAddress.update({
      where: { id: addressId },
      data: dto,
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("Perfil de usuário não encontrado.");
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
      },
    });

    if (!user) {
      throw new NotFoundException("Usuário não encontrado.");
    }

    return user;
  }

  async uploadAvatar(
    userId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("Usuário não encontrado.");
    }

    // Delete old avatar if exists
    if (user.avatarUrl) {
      const oldKey = user.avatarUrl
        .split(`${process.env.AWS_REGION}`)
        .pop()
        ?.replace("amazonaws.com/", "");
      if (oldKey) {
        await this.s3Service.deleteObject(oldKey);
      }
    }

    const { key, url } = await this.s3Service.uploadUserAvatar(userId, file);

    return await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: url },
    });
  }

  async deleteAvatar(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("Usuário não encontrado.");
    }

    if (user.avatarUrl) {
      const oldKey = user.avatarUrl
        .split(`${process.env.AWS_REGION}`)
        .pop()
        ?.replace("amazonaws.com/", "");
      if (oldKey) {
        await this.s3Service.deleteObject(oldKey);
      }
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
    });
  }
}
