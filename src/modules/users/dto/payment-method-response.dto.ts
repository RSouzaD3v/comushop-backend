import { CardType } from "@prisma/client";

export class PaymentMethodResponseDto {
  id!: string;
  cardType!: CardType;
  holderName!: string;
  cardLastFour!: string;
  cardBrand!: string;
  expiryMonth!: number;
  expiryYear!: number;
  isDefault!: boolean;
  createdAt!: Date;
}
