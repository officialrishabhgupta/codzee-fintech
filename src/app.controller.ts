import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getAppInfo() {
    return {
      name: 'Codzee Fintech API',
      version: '1.0.0',
      description: 'Payment processing and settlement API',
      endpoints: {
        auth: '/auth',
        payments: '/payments',
        settlements: '/settlements',
        health: '/health',
      },
    };
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'codzee-fintech-api',
    };
  }
}