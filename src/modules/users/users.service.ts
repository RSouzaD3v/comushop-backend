import { Injectable, NotFoundException } from "@nestjs/common";

import { CreateAddressDto } from "./dto/create-address.dto";
import { CreatePaymentMethodDto } from "./dto/create-payment-method.dto";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { S3Service } from "../storage/s3.service";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  private mapPaymentMethodResponse(method: any) {
    return {
      id: method.id,
      cardType: method.cardType,
      holderName: method.cardholderName,
      cardLastFour: method.cardLastFour,
      cardBrand: method.cardBrand,
      expiryMonth: method.expiryMonth,
      expiryYear: method.expiryYear,
      isDefault: method.isDefault,
      createdAt: method.createdAt,
    };
  }

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

  async listPaymentMethods(userId: string) {
    const methods = await this.prisma.userPaymentMethod.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return methods.map((m) => this.mapPaymentMethodResponse(m));
  }

  async createPaymentMethod(userId: string, dto: CreatePaymentMethodDto) {
    if (dto.isDefault) {
      await this.prisma.userPaymentMethod.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const method = await this.prisma.userPaymentMethod.create({
      data: {
        cardType: dto.cardType,
        cardholderName: dto.holderName,
        cardLastFour: dto.cardLastFour,
        cardBrand: dto.cardBrand,
        expiryMonth: dto.expiryMonth,
        expiryYear: dto.expiryYear,
        userId,
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
      },
    });

    return this.mapPaymentMethodResponse(method);
  }

  async deletePaymentMethod(userId: string, paymentMethodId: string) {
    const paymentMethod = await this.prisma.userPaymentMethod.findFirst({
      where: { id: paymentMethodId, userId },
    });

    if (!paymentMethod)
      throw new NotFoundException("Método de pagamento não encontrado");

    return this.prisma.userPaymentMethod.delete({
      where: { id: paymentMethodId },
    });
  }

  async setDefaultPaymentMethod(userId: string, paymentMethodId: string) {
    const paymentMethod = await this.prisma.userPaymentMethod.findFirst({
      where: { id: paymentMethodId, userId },
    });

    if (!paymentMethod)
      throw new NotFoundException("Método de pagamento não encontrado");

    await this.prisma.userPaymentMethod.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    const updated = await this.prisma.userPaymentMethod.update({
      where: { id: paymentMethodId },
      data: { isDefault: true },
    });

    return this.mapPaymentMethodResponse(updated);
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
        paymentMethods: true,
      },
    });

    if (!user) {
      throw new NotFoundException("Usuário não encontrado.");
    }

    return {
      ...user,
      paymentMethods: user.paymentMethods.map((m) =>
        this.mapPaymentMethodResponse(m),
      ),
    };
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
