export class StoreReviewsResponseDto {
  storeId!: string;
  storeName!: string;
  totalReviews!: number;
  averageRating!: number;
  reviews!: Array<{
    id: string;
    productId: string;
    productName: string;
    rating: number;
    title?: string;
    comment?: string;
    userName?: string;
    userAvatar?: string;
    createdAt: Date;
  }>;
}
