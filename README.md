# Codzee Fintech Evaluation Project

A production-ready fintech payment processing API built with NestJS and TypeORM, following enterprise patterns similar to large-scale fintech applications.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Payment Processing**: Multi-gateway support (Cashfree, PayGateway) with webhook handling
- **Settlement Management**: Batch settlement processing and bank reconciliation
- **RESTful API**: Complete REST API with validation and error handling

## Tech Stack

- **Framework**: NestJS + TypeScript
- **Database**: MySQL 8.0 with TypeORM
- **Authentication**: JWT + Passport
- **Testing**: Jest with unit and e2e tests
- **Code Quality**: ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- MySQL 8.0
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your database and JWT secrets in .env

# Run migrations (if any)
npm run migration:run

# Start development server
npm run start:dev
```

### Testing

```bash
# Unit tests
npm test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/profile` - Get user profile (requires auth)

### Payments
- `POST /payments` - Create new payment
- `GET /payments` - List user payments
- `GET /payments/:id` - Get payment details
- `POST /payments/:id/process` - Process payment
- `POST /payments/:id/webhook` - Handle payment webhook

### Settlements
- `POST /settlements` - Initiate settlement
- `GET /settlements` - List settlements
- `GET /settlements/:id` - Get settlement details
- `GET /settlements/stats` - Get settlement statistics
- `POST /settlements/:id/complete` - Complete settlement

## Project Structure

```
src/
├── common/               # Shared utilities, entities, enums, interfaces
├── constants/            # Global constants
├── database/             # Database configuration
├── modules/
│   ├── auth/            # Authentication module
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── strategies/
│   │   └── guards/
│   ├── payment/         # Payment processing module
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/
│   │   └── dto/
│   ├── settlement/      # Settlement and reconciliation
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/
│   │   └── dto/
│   ├── gateways/        # Payment gateway integrations
│   │   └── services/
│   └── user/            # User management
│       ├── services/
│       ├── entities/
│       └── dto/
├── app.module.ts        # Root application module
├── app.controller.ts    # Root controller
├── app.service.ts       # Root service
└── main.ts              # Application entry point
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 3306 |
| DB_USER | Database user | root |
| DB_PASSWORD | Database password | password |
| DB_NAME | Database name | codzee_fintech |
| JWT_SECRET | JWT signing secret | - |
| JWT_EXPIRATION | JWT token expiration | 3600s |
| CASHFREE_API_KEY | Cashfree API key | - |
| CASHFREE_API_SECRET | Cashfree API secret | - |
| PAYGATEWAY_API_KEY | PayGateway API key | - |
| NODE_ENV | Environment | development |
| PORT | Server port | 3000 |

## License

UNLICENSED