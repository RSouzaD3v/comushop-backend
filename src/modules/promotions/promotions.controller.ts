import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { PromotionsService } from "./promotions.service";
import { CreateFlashSaleDto, UpdateFlashSaleDto } from "./dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { Public } from "../auth/decorators/public.decorator";

@Controller("promotions")
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  // Admin endpoints - criar flash sales
  @Post("flash-sales")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async createFlashSale(@Body() dto: CreateFlashSaleDto) {
    return await this.promotionsService.createFlashSale(dto);
  }

  // Admin endpoints - listar todas
  @Get("flash-sales/all")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async getAllFlashSales(@Query("isActive") isActive?: string) {
    const isActiveBoolean =
      isActive === undefined ? undefined : isActive === "true";
    return await this.promotionsService.getAllFlashSales(isActiveBoolean);
  }

  // Public endpoint - listar flash sales ativas
  @Public()
  @Get("flash-sales/active")
  @HttpCode(HttpStatus.OK)
  async getActiveFlashSales() {
    return await this.promotionsService.getActiveFlashSales();
  }

  // Public endpoint - buscar por ID
  @Public()
  @Get("flash-sales/:id")
  @HttpCode(HttpStatus.OK)
  async getFlashSale(@Param("id") id: string) {
    return await this.promotionsService.getFlashSaleById(id);
  }

  // Admin endpoints - atualizar
  @Put("flash-sales/:id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async updateFlashSale(
    @Param("id") id: string,
    @Body() dto: UpdateFlashSaleDto,
  ) {
    return await this.promotionsService.updateFlashSale(id, dto);
  }

  // Admin endpoints - deletar
  @Delete("flash-sales/:id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFlashSale(@Param("id") id: string) {
    await this.promotionsService.deleteFlashSale(id);
  }
}
