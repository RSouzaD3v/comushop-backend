import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import {
  CreateReviewDto,
  MarkReviewHelpfulDto,
  ListReviewsQueryDto,
} from "./dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("products/:productId/reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createReview(
    @Param("productId") productId: string,
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: any,
  ) {
    return await this.reviewsService.createReview(
      productId,
      user.userId,
      createReviewDto,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getReviews(
    @Param("productId") productId: string,
    @Query() query: ListReviewsQueryDto,
  ) {
    const params: any = {};
    if (query.page !== undefined) {
      params.page = query.page;
    }
    if (query.limit !== undefined) {
      params.limit = query.limit;
    }
    if (query.rating !== undefined) {
      params.rating = query.rating;
    }

    return await this.reviewsService.getProductReviews(productId, params);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUserReview(
    @Param("productId") productId: string,
    @CurrentUser() user: any,
  ) {
    return await this.reviewsService.getUserReviewForProduct(
      user.userId,
      productId,
    );
  }

  @Get(":reviewId")
  @HttpCode(HttpStatus.OK)
  async getReview(@Param("reviewId") reviewId: string) {
    // We could add a getReviewById method to the service here
    return null;
  }

  @Put(":reviewId")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateReview(
    @Param("reviewId") reviewId: string,
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: any,
  ) {
    return await this.reviewsService.updateReview(
      reviewId,
      user.userId,
      createReviewDto,
    );
  }

  @Post(":reviewId/helpful")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async markReviewHelpful(
    @Param("reviewId") reviewId: string,
    @Body() markHelpfulDto: MarkReviewHelpfulDto,
  ) {
    await this.reviewsService.markReviewHelpful(
      reviewId,
      markHelpfulDto.helpful,
    );
  }

  @Delete(":reviewId")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReview(
    @Param("reviewId") reviewId: string,
    @CurrentUser() user: any,
  ) {
    await this.reviewsService.deleteReview(reviewId, user.userId);
  }

  @Get("stats/summary")
  @HttpCode(HttpStatus.OK)
  async getReviewStats(@Param("productId") productId: string) {
    const [averageRating, reviewCount] = await Promise.all([
      this.reviewsService.getProductAverageRating(productId),
      this.reviewsService.getProductReviewCount(productId),
    ]);

    return {
      productId,
      averageRating,
      reviewCount,
    };
  }
}
