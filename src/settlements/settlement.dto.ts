import { IsString, IsNumber, IsOptional, Min, IsDateString, IsEnum } from 'class-validator';

export enum SettlementStatus {
  PENDING = 'pending',
  INITIATED = 'initiated',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class CreateSettlementDto {
  @IsString()
  batchId: string;

  @IsNumber()
  @Min(1)
  totalAmount: number;

  @IsString()
  bankAccount: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class SettlementResponseDto {
  id: string;
  batchId: string;
  totalAmount: number;
  currency: string;
  status: string;
  bankAccount: string;
  bankReference?: string;
  transactionCount: number;
  createdAt: Date;
  completedAt?: Date;
}

export class CompleteSettlementDto {
  @IsString()
  bankReference: string;
}

export class ReconReportDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
