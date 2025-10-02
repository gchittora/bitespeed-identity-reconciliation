# Bitespeed Identity Reconciliation

A Node.js web service for identity reconciliation that helps link different contact information (email and phone number) to the same customer across multiple purchases.

## 🚀 Live Deployment

**API Endpoint:** https://bitespeed-identity-reconciliation-3-w6ok.onrender.com

### Quick Test:
```bash
# Health Check
curl https://bitespeed-identity-reconciliation-3-w6ok.onrender.com/health

# Identify Contact
curl -X POST https://bitespeed-identity-reconciliation-3-w6ok.onrender.com/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "phoneNumber": "1234567890"}'
```

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
- PostgreSQL database
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Create a .env file with the following:
DATABASE_URL="postgresql://username:password@hostname:5432/database_name"
NODE_ENV="development"
PORT=3000
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

## Technical Stack

- **Backend Framework:** Node.js with Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Deployment:** Render.com
- **Architecture:** Layered (Controllers → Services → Repositories)

## Key Features Implemented

✅ **Identity Linking:** Automatically links contacts based on common email or phone number  
✅ **Primary-Secondary Relationships:** Maintains oldest contact as primary, others as secondary  
✅ **Contact Consolidation:** Converts multiple primary contacts to a single primary with multiple secondaries  
✅ **Comprehensive Validation:** Email format and required field validation  
✅ **Error Handling:** Proper HTTP status codes and error messages  
✅ **Type Safety:** Full TypeScript implementation with strict mode  
✅ **Structured Logging:** Request/response and error logging throughout  
✅ **Clean Architecture:** Separation of concerns with clear layer boundaries  

## Database Schema

```sql
CREATE TABLE "Contact" (
    "id" SERIAL PRIMARY KEY,
    "phoneNumber" TEXT,
    "email" TEXT,
    "linkedId" INTEGER,
    "linkPrecedence" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3)
);
```

## Example Usage

### Scenario 1: Create New Contact
```bash
curl -X POST https://bitespeed-identity-reconciliation-3-w6ok.onrender.com/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "lorraine@hillvalley.edu", "phoneNumber": "123456"}'
```

**Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": []
  }
}
```

### Scenario 2: Link Contact with New Email
```bash
curl -X POST https://bitespeed-identity-reconciliation-3-w6ok.onrender.com/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "mcfly@hillvalley.edu", "phoneNumber": "123456"}'
```

**Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [2]
  }
}
```

### Scenario 3: Primary-to-Secondary Conversion
When two separate primary contacts are linked (e.g., same person using different email/phone for different orders), the older primary remains primary and the newer converts to secondary.

## License

MIT

## Author

Garvit Chittora

## Repository

https://github.com/gchittora/bitespeed-identity-reconciliation
