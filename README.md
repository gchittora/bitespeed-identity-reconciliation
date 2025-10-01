# Bitespeed Identity Reconciliation

A Node.js web service for identity reconciliation that helps link different contact information (email and phone number) to the same customer across multiple purchases.

## Task Overview

This service solves the problem of identifying and tracking a customer's identity across multiple purchases when they use different email addresses and phone numbers. The service intelligently links contacts and maintains a primary-secondary relationship between them.

## Features

- **Identity Reconciliation**: Automatically links contacts based on email and phone number
- **TypeScript**: Full type safety and better developer experience
- **Prisma ORM**: Type-safe database operations
- **Structured Architecture**: Clean separation of concerns with layers
- **Error Handling**: Comprehensive error handling and validation
- **Logging**: Structured logging for better debugging
- **Health Checks**: Built-in health check endpoint

## Project Structure

```
src/
├── app.ts                      # Application entry point
├── config/
│   └── config.ts              # Configuration management
├── controllers/
│   └── contact.controller.ts   # HTTP request handlers
├── services/
│   └── contact.service.ts     # Business logic
├── repositories/
│   └── contact.repository.ts  # Data access layer
├── middleware/
│   └── error.middleware.ts    # Error handling middleware
├── validators/
│   └── contact.validator.ts   # Input validation
├── utils/
│   └── logger.ts             # Logging utilities
└── types/
    └── contact.types.ts       # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL database
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL and other configuration
```

3. Run database migrations:
```bash
npx prisma migrate dev
```

4. Generate Prisma client:
```bash
npx prisma generate
```

### Running the Application

#### Development
```bash
npm run dev
```

#### Production
```bash
npm run build
npm run start:prod
```

## API Endpoints

### POST /identify

Identifies and reconciles contact information.

**Request Body:**
```json
{
  "email": "user@example.com",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["user@example.com"],
    "phoneNumbers": ["+1234567890"],
    "secondaryContactIds": []
  }
}
```

**Note:** The response key is intentionally `primaryContatctId` (with typo) as per task requirements.

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

## Architecture

The application follows a layered architecture pattern:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Repositories**: Handle data access
- **Validators**: Validate input data
- **Middleware**: Handle cross-cutting concerns like error handling
- **Types**: TypeScript type definitions

## Error Handling

The application includes comprehensive error handling:

- Input validation errors (400)
- Database errors (400)
- Internal server errors (500)
- Structured error responses with appropriate HTTP status codes

## Logging

Structured logging is implemented throughout the application:

- Request/response logging
- Error logging with stack traces
- Business logic logging for debugging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
