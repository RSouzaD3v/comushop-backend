export class ReviewResponseDto {
  id!: string;
  productId!: string;
  userId!: string;
  rating!: number;
  title?: string;
  comment?: string;
  helpfulCount!: number;
  unhelpfulCount!: number;
  createdAt!: Date;
  updatedAt!: Date;

  // User info
  user?: {
    id: string;
    displayName?: string;
    avatarUrl?: string;
  };
}
