export class FlashSaleResponseDto {
  id!: string;
  title!: string;
  description?: string;
  startDate!: Date;
  endDate!: Date;
  discountPercent!: number;
  isActive!: boolean;
  productId!: string;
  createdAt!: Date;
  updatedAt!: Date;

  product?: {
    id: string;
    name: string;
    description?: string;
    images?: Array<{
      url: string;
      isPrimary: boolean;
    }>;
    variations?: Array<{
      id: string;
      title?: string;
      priceCents: number;
      stockOnHand: number;
    }>;
    company?: {
      id: string;
      name: string;
      slug: string;
    };
  };
}
