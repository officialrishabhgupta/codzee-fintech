import { Controller, Post, Get, Param, Body, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SettlementsService } from './settlements.service';
import { CreateSettlementDto, SettlementResponseDto, CompleteSettlementDto, ReconReportDto } from './settlement.dto';

@Controller('settlements')
@UseGuards(AuthGuard('jwt'))
export class SettlementsController {
  constructor(private settlementsService: SettlementsService) {}

  @Post()
  async initiateSettlement(@Body() dto: CreateSettlementDto): Promise<SettlementResponseDto> {
    return this.settlementsService.initiateSettlement(dto);
  }

  @Get()
  async getSettlements(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.settlementsService.getSettlements(Number(page), Number(limit));
  }

  @Get('stats')
  async getStats() {
    return this.settlementsService.getSettlementStats();
  }

  @Get(':id')
  async getSettlement(@Param('id') id: string): Promise<SettlementResponseDto> {
    return this.settlementsService.getSettlement(id);
  }

  @Post(':id/complete')
  async completeSettlement(
    @Param('id') id: string,
    @Body() dto: CompleteSettlementDto,
  ): Promise<SettlementResponseDto> {
    return this.settlementsService.completeSettlement(id, dto);
  }

  @Get('recon/report')
  async generateReconReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.settlementsService.generateReconReport(
      new Date(startDate),
      new Date(endDate),
    );
  }
}
