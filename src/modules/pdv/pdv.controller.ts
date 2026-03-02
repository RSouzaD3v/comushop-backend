import { RegisterPaymentDto } from "./dto/register-payment.dto";
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { PdvService } from "./pdv.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SellerOrAdminGuard } from "../auth/guards/seller-or-admin.guard";
import { CreateSaleDto } from "./dto/create-sale.dto";
import { OpenCashRegisterDto } from "./dto/open-cash-register.dto";
import { CloseCashRegisterDto } from "./dto/close-cash-register.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@UseGuards(JwtAuthGuard)
@Controller("pdv")
export class PdvController {
  @UseGuards(SellerOrAdminGuard)
  @Post("payment")
  async registerPayment(
    @Body() dto: RegisterPaymentDto,
    @CurrentUser() user: any,
  ) {
    return this.pdvService.registerPayment(dto, user);
  }
  constructor(private readonly pdvService: PdvService) {}

  @UseGuards(SellerOrAdminGuard)
  @Post("sale")
  createSale(@Body() dto: CreateSaleDto, @CurrentUser() user: any) {
    return this.pdvService.createSale(dto, user);
  }

  @Get("sale")
  listSales(@Query() query: any) {
    return this.pdvService.listSales(query);
  }

  @Get("report")
  getReport(@Query() query: any) {
    return this.pdvService.getReport(query);
  }

  @UseGuards(SellerOrAdminGuard)
  @Post("cash-register/open")
  openCashRegister(@Body() dto: OpenCashRegisterDto, @CurrentUser() user: any) {
    return this.pdvService.openCashRegister(dto, user);
  }

  @UseGuards(SellerOrAdminGuard)
  @Post("cash-register/close")
  closeCashRegister(
    @Body() dto: CloseCashRegisterDto,
    @CurrentUser() user: any,
  ) {
    return this.pdvService.closeCashRegister(dto, user);
  }

  @Get("cash-register")
  listCashRegisters(@Query() query: any) {
    return this.pdvService.listCashRegisters(query);
  }

  @Get("/product/barcode/:barcode")
  getProductByBarcode(@Param("barcode") barcode: string) {
    return this.pdvService.getProductByBarcode(barcode);
  }
}
