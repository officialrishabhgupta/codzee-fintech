import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getAppInfo() {
    return {
      name: 'Codzee Fintech API',
      version: '1.0.0',
      description: 'Fintech payment processing and settlement API',
    };
  }
}