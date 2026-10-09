import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Settlement } from './settlement.entity';
import { CreateSettlementDto, SettlementResponseDto, SettlementStatus, CompleteSettlementDto } from './settlement.dto';

@Injectable()
export class SettlementsService {
  private readonly logger = new Logger(SettlementsService.name);

  constructor(
    @InjectRepository(Settlement)
    private settlementRepository: Repository<Settlement>,
  ) {}

  async initiateSettlement(dto: CreateSettlementDto): Promise<SettlementResponseDto> {
    const existing = await this.settlementRepository.findOne({
      where: { batchId: dto.batchId },
    });

    if (existing) {
      throw new BadRequestException('Settlement with this batch ID already exists');
    }

    const settlement = this.settlementRepository.create({
      ...dto,
      status: SettlementStatus.INITIATED,
      currency: 'INR',
    });

    await this.settlementRepository.save(settlement);
    this.logger.log(`Settlement initiated: ${dto.batchId}`);

    return this.toResponseDto(settlement);
  }

  async getSettlement(id: string): Promise<SettlementResponseDto> {
    const settlement = await this.settlementRepository.findOne({ where: { id } });
    if (!settlement) {
      throw new NotFoundException('Settlement not found');
    }
    return this.toResponseDto(settlement);
  }

  async getSettlements(page = 1, limit = 10): Promise<{ data: SettlementResponseDto[]; total: number }> {
    const [settlements, total] = await this.settlementRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: settlements.map(s => this.toResponseDto(s)),
      total,
    };
  }

  async completeSettlement(id: string, dto: CompleteSettlementDto): Promise<SettlementResponseDto> {
    const settlement = await this.settlementRepository.findOne({ where: { id } });
    if (!settlement) {
      throw new NotFoundException('Settlement not found');
    }

    if (settlement.status !== SettlementStatus.INITIATED) {
      throw new BadRequestException('Settlement cannot be completed');
    }

    settlement.status = SettlementStatus.COMPLETED;
    settlement.bankReference = dto.bankReference;
    settlement.completedAt = new Date();

    await this.settlementRepository.save(settlement);
    this.logger.log(`Settlement completed: ${settlement.batchId}`);

    return this.toResponseDto(settlement);
  }

  async getSettlementStats(): Promise<{
    pending: number;
    initiated: number;
    completed: number;
    totalAmount: number;
  }> {
    const [pending, initiated, completed] = await Promise.all([
      this.settlementRepository.count({ where: { status: SettlementStatus.PENDING } }),
      this.settlementRepository.count({ where: { status: SettlementStatus.INITIATED } }),
      this.settlementRepository.count({ where: { status: SettlementStatus.COMPLETED } }),
    ]);

    const totalResult = await this.settlementRepository
      .createQueryBuilder('settlement')
      .select('SUM(settlement.totalAmount)', 'sum')
      .where('settlement.status = :status', { status: SettlementStatus.COMPLETED })
      .getRawOne();

    return {
      pending,
      initiated,
      completed,
      totalAmount: Number(totalResult?.sum) || 0,
    };
  }

  async generateReconReport(startDate: Date, endDate: Date) {
    const settlements = await this.settlementRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    const total = settlements.reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const completed = settlements.filter(s => s.status === SettlementStatus.COMPLETED).length;

    return {
      period: { startDate, endDate },
      totalSettlements: settlements.length,
      completedSettlements: completed,
      totalAmount: total,
      reconciliationStatus: 'completed',
    };
  }

  private toResponseDto(settlement: Settlement): SettlementResponseDto {
    return {
      id: settlement.id,
      batchId: settlement.batchId,
      totalAmount: Number(settlement.totalAmount),
      currency: settlement.currency,
      status: settlement.status,
      bankAccount: settlement.bankAccount,
      bankReference: settlement.bankReference,
      transactionCount: settlement.transactionCount,
      createdAt: settlement.createdAt,
      completedAt: settlement.completedAt,
    };
  }
}
