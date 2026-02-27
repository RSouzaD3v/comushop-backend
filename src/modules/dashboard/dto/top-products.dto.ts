export class TopProductDto {
  productId!: string;
  productName!: string;
  quantitySold!: number;
  revenue!: number; // em centavos
  imageUrl?: string;
}

export class TopProductsDto {
  products!: TopProductDto[];
  period!: string;
}
