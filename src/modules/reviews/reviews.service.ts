import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { ReviewRepository } from "./repositories";
import { CreateReviewDto, ReviewResponseDto } from "./dto";

@Injectable()
export class ReviewsService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async createReview(
    productId: string,
    userId: string,
    body: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    // Check if user already has a review for this product
    const existingReview = await this.reviewRepository.findUserReviewForProduct(
      userId,
      productId,
    );

    if (existingReview) {
      throw new BadRequestException(
        "User already has a review for this product",
      );
    }

    const review = await this.reviewRepository.createReview({
      productId,
      userId,
      rating: body.rating,
      title: body.title || null,
      comment: body.comment || null,
    });

    return this.mapToResponseDto(review);
  }

  async getProductReviews(
    productId: string,
    params: {
      page?: number;
      limit?: number;
      rating?: number;
    } = {},
  ) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 10));
    const skip = (page - 1) * limit;

    const queryParams: any = {
      skip,
      take: limit,
    };

    if (params.rating !== undefined) {
      queryParams.rating = params.rating;
    }

    const [reviews, total] = await Promise.all([
      this.reviewRepository.findReviewsByProductId(productId, queryParams),
      this.reviewRepository.findReviewsByProductIdCount(productId),
    ]);

    const stats = await this.reviewRepository.getProductRatingStats(productId);

    return {
      reviews: reviews.map((r: any) => this.mapToResponseDto(r)),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      stats: {
        averageRating: stats._avg.rating ?? 0,
        totalReviews: stats._count,
      },
    };
  }

  async getUserReviewForProduct(
    userId: string,
    productId: string,
  ): Promise<ReviewResponseDto | null> {
    const review = await this.reviewRepository.findUserReviewForProduct(
      userId,
      productId,
    );
    return review ? this.mapToResponseDto(review) : null;
  }

  async updateReview(
    reviewId: string,
    userId: string,
    body: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findReviewById(reviewId);

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    if (review.userId !== userId) {
      throw new BadRequestException("User can only update their own reviews");
    }

    const updated = await this.reviewRepository.updateReview(reviewId, {
      rating: body.rating,
      title: body.title || null,
      comment: body.comment || null,
    });

    return this.mapToResponseDto(updated);
  }

  async markReviewHelpful(reviewId: string, helpful: boolean): Promise<void> {
    const review = await this.reviewRepository.findReviewById(reviewId);

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    await this.reviewRepository.markReviewHelpful(reviewId, helpful);
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await this.reviewRepository.findReviewById(reviewId);

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    if (review.userId !== userId) {
      throw new BadRequestException("User can only delete their own reviews");
    }

    await this.reviewRepository.deleteReview(reviewId);
  }

  async getProductAverageRating(productId: string): Promise<number> {
    const stats = await this.reviewRepository.getProductRatingStats(productId);
    return stats._avg.rating ?? 0;
  }

  async getProductReviewCount(productId: string): Promise<number> {
    return await this.reviewRepository.findReviewsByProductIdCount(productId);
  }

  private mapToResponseDto(review: any): ReviewResponseDto {
    return {
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      helpfulCount: review.helpfulCount,
      unhelpfulCount: review.unhelpfulCount,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      user: review.user || undefined,
    };
  }
}
