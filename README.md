# Merchant Transaction System - Backend

Backend for merchant transaction management system built with NestJS, PostgreSQL, Redis and RabbitMQ.

**Quick note**: I'm including the `.env` file in git for demo purposes. Obviously, don't do this in production! 

## What's This About?

Built a secure system where merchants can register, login and manage their transactions. It's got some nice features like:

- JWT authentication (the usual suspects - login, register, secure passwords)
- Transaction management with pagination
- Redis caching to speed things up
- RabbitMQ for handling transaction processing in the background
- Rate limiting so nobody can spam the API
- Background workers that automatically update transaction statuses
- Swagger docs for easy API testing

## Tech Stack

**Backend:**
- NestJS + TypeScript
- PostgreSQL with TypeORM
- Redis for caching
- RabbitMQ for message queuing

**Infrastructure:**
- Docker & Docker Compose
- Winston for logging
- Swagger/OpenAPI docs

## How It Works

Pretty straightforward architecture:

Infrastructure stuff:
- Database (PostgreSQL + TypeORM)
- Cache (Redis)
- Message Queue (RabbitMQ)
- Rate Limiting (Redis-backed)
- Logging (Winston)

Application stuff:
- Auth Module → handles registration, login, JWT
- Merchants Module → manages merchant data
- Transactions Module
  ├── Service (business logic)
  ├── Repository (database stuff)
  ├── Controller (HTTP endpoints)
  └── Worker (background jobs)

Common utilities:
- DTOs for validation
- Guards for auth
- Filters for errors
- Interceptors for responses

## Before You Start

You'll need:
- Docker (20.10+)
- Docker Compose (2.0+)
- Node.js (20.x)
- npm or yarn

## Quick Start

### The Docker Way (Recommended for Infrastructure)

I set up the architecture to run everything in Docker (Redis, PostgreSQL, RabbitMQ and the backend) but ran into some time constraints with the backend container setup. For now only Redis, PostgreSQL, RabbitMQ are
working in Docker and backend is working locally.  So here's what actually works:

1. **Clone this thing**
  
   git clone <repository-url>
   cd merchant-transaction-system-backend
  

2. **Fire up the infrastructure**
   
   This starts PostgreSQL, Redis and RabbitMQ in Docker and backend locally:
  
    docker compose build --no-cache
    npm run dev:local
  
   That's it! The backend will connect to the Dockerized services and everything should work.

3. **Check if it's alive**
   - API: http://localhost:3001
   - Swagger Docs: http://localhost:3001/swagger
   - RabbitMQ UI: http://localhost:15672 (login: `merchant` / `merchant_rabbitmq`)

### Running Without Docker

If you want to run everything locally:

1. Install dependencies
  
   npm install

2. Make sure you have PostgreSQL, Redis and RabbitMQ running locally

3. Run migrations
  
   npm run migration:run
  
4. Start the server
  
   npm run start:dev


## API Docs & Testing

### Swagger UI

Head to http://localhost:3001/swagger for the interactive API docs. You can test everything right from there.

### Main Endpoints

**Auth (no token needed):**
- `POST /api/auth/register` - Create a merchant account
- `POST /api/auth/login` - Get your JWT token

**Transactions (need auth token):**
- `POST /api/transactions` - Create a transaction
- `GET /api/transactions?page=1&limit=10` - List your transactions

### Quick Examples

**Register:**
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Merchant",
    "email": "merchant@example.com",
    "password": "SecurePassword123!"
  }'

**Login:**
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "merchant@example.com",
    "password": "SecurePassword123!"
  }'

**Create Transaction:**
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": 100.50,
    "currency": "USD"
  }'

**Get Transactions:**
curl -X GET "http://localhost:3001/api/transactions?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

## Project Structure

src/
├── common/                          # Shared utilities and components
│   ├── filters/                     # Exception filters
│   │   └── http-exception.filter.ts # Global error handling
│   ├── interceptors/                # Response interceptors
│   │   └── response.interceptor.ts  # Standardize API responses
│   └── utils/                       # Utility functions
│       └── env.util.ts             # Environment variable helpers
│
├── database/                        # Database configuration
│   ├── migrations/                  # TypeORM migrations
│   ├── seeds/                      # Database seeders
│   ├── database.config.ts          # Database connection config
│   └── database.module.ts          # Database module
│
├── infrastructure/                  # Infrastructure layer
│   ├── cache/                      # Redis caching
│   │   ├── cache.module.ts
│   │   └── redis.config.ts
│   ├── logging/                    # Winston logging
│   │   ├── logger.config.ts
│   │   ├── logger.module.ts
│   │   └── logger.service.ts
│   ├── rabbitmq/                   # RabbitMQ integration
│   │   ├── rabbitmq.config.ts
│   │   ├── rabbitmq.module.ts
│   │   └── rabbitmq.service.ts
│   └── rate-limiter/               # Rate limiting
│       ├── decorators/
│       ├── rate-limiter.config.ts
│       ├── rate-limiter.module.ts
│       └── redis-throttler-storage.service.ts
│
├── modules/                         # Application modules
│   ├── auth/                       # Authentication module
│   │   ├── dto/                    # Data transfer objects
│   │   │   ├── request/
│   │   │   │   ├── login.request.dto.ts
│   │   │   │   └── register.request.dto.ts
│   │   │   └── response/
│   │   │       ├── login.response.dto.ts
│   │   │       └── register.response.dto.ts
│   │   ├── guards/                 # Auth guards
│   │   │   └── jwt-auth.guard.ts
│   │   ├── strategies/             # Passport strategies
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.repository.ts
│   │   └── auth.service.ts
│   │
│   ├── merchants/                  # Merchants module
│   │   ├── entities/
│   │   │   └── merchant.entity.ts
│   │   ├── merchant.service.ts
│   │   └── merchants.module.ts
│   │
│   └── transactions/               # Transactions module
│       ├── dto/
│       │   ├── request/
│       │   │   ├── createTransaction.request.dto.ts
│       │   │   └── getTransactions.request.dto.ts
│       │   └── response/
│       │       ├── createTransaction.response.dto.ts
│       │       ├── getTransactions.response.dto.ts
│       │       └── paginationMeta.response.dto.ts
│       ├── entities/
│       │   └── transaction.entity.ts
│       ├── events/
│       │   └── transactionCreated.event.ts
│       ├── workers/
│       │   └── transactions.worker.ts
│       ├── transactions.controller.ts
│       ├── transactions.module.ts
│       ├── transactions.repository.ts
│       └── transactions.service.ts
│
├── app.controller.ts                # Root controller
├── app.module.ts                    # Root module
├── app.service.ts                   # Root service
└── main.ts                          # Application entry point

## What I Assumed & Trade-offs

### Assumptions

1. **Currencies** - Each transaction has one currency, no conversion logic. Assuming valid ISO 4217 codes.

2. **Transaction Flow** - They start as PENDING, background worker processes them (waits 5 seconds), then randomly succeeds or fails. In production you'd have real payment processing here.

3. **Data Access** - Merchants only see their own transactions. No admin roles or cross-merchant viewing.

4. **Pagination** - Defaults to 10 items per page, starts at page 1. Didn't enforce a max page size (should probably do that).

5. **Caching** - Only caching the first page with 10 items. Cache clears when you create a new transaction. TTL is 30 seconds.

6. **Rate Limits** - Different limits for different endpoints:
   - Auth stuff: 5 requests/minute (to prevent brute force)
   - Transactions: 30 requests/minute
   - Blocks last 60 seconds

### Trade-offs I Made

1. **Simple Cache Invalidation**
   - Currently just clearing page 1 with limit 10
   - Other cached pages might be stale
   - Better solution: pattern-based invalidation or cache tags
   - Went simple to ship faster

2. **RabbitMQ Setup**
   - Using durable queues for reliability
   - Adds complexity vs Redis pub/sub
   - But messages won't get lost if service restarts

3. **Single Worker**
   - Just one worker processing messages sequentially
   - Keeps it simple but limits throughput
   - Production would need multiple workers with proper acknowledgment

4. **No Token Revocation**
   - Would need Redis blacklist for proper logout

5. **DB Migrations**
   - Auto-sync in development (fast and easy)
   - Would never do this in production
   - Need proper migration management there

6. **Generic Errors**
   - Returning generic messages for security
   - Detailed logs but vague user messages
   - Makes debugging slightly harder but more secure

7. **No Tests**
   - Skipped due to time constraints
   - Would definitely need unit, integration and e2e tests for production

## If This Was Going to Production

Here's what I'd add/change:

### Security
- Token blacklist for logout
- 2FA for sensitive operations
- Per-user rate limiting
- OAuth2/OIDC integration
- Encrypt sensitive data at rest
- Proper secrets management (Vault, AWS Secrets Manager)
- Regular security audits

### Performance
- Database indexes on common queries
- Connection pooling
- Read replicas for reads
- Multi-level caching (in-memory + Redis)
- CDN for static assets
- Response compression
- Optimized Docker images

### Scalability
- Make it stateless (no in-memory sessions)
- Redis cluster for sessions
- Load balancers with health checks
- Auto-scaling based on metrics
- Database sharding by merchant_id
- Consider CQRS for read/write separation
- Maybe split into microservices

### Monitoring
- APM tool (DataDog, New Relic)
- Distributed tracing
- Structured logging with correlation IDs
- Custom business metrics
- Alerts for error rates, performance issues
- ELK stack or Splunk for logs

### Reliability
- Multi-AZ deployment
- Database failover
- Redis Sentinel/Cluster
- Circuit breakers
- Retry logic with backoff
- Regular disaster recovery drills
- Automated backups with tested restoration

### DevOps
- Proper CI/CD pipeline
- Automated testing gates
- Security scanning (SAST/DAST)
- Blue-green deployments
- Feature flags
- Kubernetes deployment
- Infrastructure as code

### Testing
- Unit tests (>80% coverage)
- Integration tests
- E2E tests
- Load testing
- Security testing
- Dependency auditing

### Additional Features
- Analytics dashboard
- Fraud detection
- Email/SMS notifications
- Webhooks for integrations
- API versioning
- Better documentation

### Cost Optimization
- Auto-scaling to match demand
- Spot instances where possible
- Right-sized database instances
- Efficient caching
- Monitor and eliminate waste

## Notes
This is a working prototype that demonstrates the core functionality. Its not production-ready as-is but shows the architecture and approach. The "Production Improvements" section above outlines what would need to happen before this handles real money and real users at scale.