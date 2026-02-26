export class StoreResponseDto {
  id!: string;
  name!: string;
  slug!: string;
  logoUrl?: string;
  description?: string;
  ownerUserId?: string;
  followerCount?: number;
  isFollowing?: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  owner?: {
    id: string;
    displayName?: string;
    avatarUrl?: string;
  };
}
