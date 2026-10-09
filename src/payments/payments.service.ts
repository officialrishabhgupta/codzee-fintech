import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Payment } from './payment.entity';
import { CreatePaymentDto, PaymentResponseDto, UpdatePaymentStatusDto, PaymentStatus } from './payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  // Payment status transitions that are allowed
  private readonly validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
    [PaymentStatus.PENDING]: [PaymentStatus.PROCESSING],
    [PaymentStatus.PROCESSING]: [PaymentStatus.SUCCESS, PaymentStatus.FAILED],
    [PaymentStatus.SUCCESS]: [PaymentStatus.REFUNDED],
    [PaymentStatus.FAILED]: [PaymentStatus.PENDING],
    [PaymentStatus.REFUNDED]: [],
  };

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async createPayment(userId: string, dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const orderId = `ORD-${uuidv4().slice(0, 8).toUpperCase()}`;

    const payment = this.paymentRepository.create({
      ...dto,
      orderId,
      userId,
      status: PaymentStatus.PENDING,
      currency: 'INR',
    });

    await this.paymentRepository.save(payment);
    this.logger.log(`Payment created: ${orderId} for user: ${userId}`);

    return this.toResponseDto(payment);
  }

  async getPayment(id: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return this.toResponseDto(payment);
  }

  async getUserPayments(userId: string, page = 1, limit = 10): Promise<{ data: PaymentResponseDto[]; total: number }> {
    const [payments, total] = await this.paymentRepository.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: payments.map(p => this.toResponseDto(p)),
      total,
    };
  }

  async processPayment(id: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Validate state transition
    if (!this.isValidTransition(payment.status as PaymentStatus, PaymentStatus.PROCESSING)) {
      throw new BadRequestException(
        `Cannot transition from ${payment.status} to PROCESSING. Valid states: ${this.validTransitions[payment.status as PaymentStatus].join(', ')}`
      );
    }

    payment.status = PaymentStatus.PROCESSING;
    await this.paymentRepository.save(payment);

    // Simulate gateway processing
    setTimeout(async () => {
      payment.status = PaymentStatus.SUCCESS;
      payment.gatewayTransactionId = `GW-${uuidv4().slice(0, 12)}`;
      payment.gatewayResponse = {
        success: true,
        timestamp: new Date().toISOString(),
      };
      await this.paymentRepository.save(payment);
    }, 1000);

    this.logger.log(`Payment processing started: ${id}`);
    return this.toResponseDto(payment);
  }

  async updatePaymentStatus(id: string, dto: UpdatePaymentStatusDto): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Validate state transition
    if (!this.isValidTransition(payment.status as PaymentStatus, dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${payment.status} to ${dto.status}. Valid transitions: ${this.validTransitions[payment.status as PaymentStatus].join(', ')}`
      );
    }

    payment.status = dto.status;
    if (dto.gatewayTransactionId) {
      payment.gatewayTransactionId = dto.gatewayTransactionId;
    }

    await this.paymentRepository.save(payment);
    this.logger.log(`Payment status updated: ${id} -> ${dto.status}`);

    return this.toResponseDto(payment);
  }

  /**
   * Validate if a state transition is allowed
   * @param currentStatus Current payment status
   * @param targetStatus Target payment status
   * @returns true if transition is valid, false otherwise
   */
  private isValidTransition(currentStatus: PaymentStatus, targetStatus: PaymentStatus): boolean {
    return this.validTransitions[currentStatus]?.includes(targetStatus) ?? false;
  }

  private toResponseDto(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id,
      amount: Number(payment.amount),
      currency: payment.currency,
      gateway: payment.gateway,
      orderId: payment.orderId,
      status: payment.status,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
