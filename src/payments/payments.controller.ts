import { Controller, Post, Get, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, PaymentResponseDto, UpdatePaymentStatusDto } from './payment.dto';

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  async createPayment(@Request() req, @Body() dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    return this.paymentsService.createPayment(req.user.userId, dto);
  }

  @Get()
  async getPayments(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.paymentsService.getUserPayments(req.user.userId, Number(page), Number(limit));
  }

  @Get(':id')
  async getPayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentsService.getPayment(id);
  }

  @Post(':id/process')
  async processPayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentsService.processPayment(id);
  }

  @Post(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentStatusDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.updatePaymentStatus(id, dto);
  }
}
