import { IsNumber, IsString, IsOptional, Min, IsEnum } from 'class-validator';

export enum PaymentGateway {
  CASHFREE = 'cashfree',
  PAYGATEWAY = 'paygateway',
  STRIPE = 'stripe',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export class CreatePaymentDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsEnum(PaymentGateway)
  gateway: PaymentGateway;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class PaymentResponseDto {
  id: string;
  amount: number;
  currency: string;
  gateway: string;
  orderId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsString()
  @IsOptional()
  gatewayTransactionId?: string;
}
