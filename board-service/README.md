# Board Service (Go/Gin)

Kanban board API service for weAlist project management platform. This is a migration from Python FastAPI to Go Gin framework.

## Overview

**Board Service** is a microservice that provides Kanban board functionality for the weAlist project management platform. It combines features from Jira, Slack, and Notion to deliver a comprehensive project management experience.

## Tech Stack

- **Framework**: [Gin](https://github.com/gin-gonic/gin) - High-performance HTTP web framework
- **ORM**: [GORM v2](https://gorm.io) - Go ORM library with PostgreSQL driver
- **Database**: PostgreSQL 16
- **Cache**: Redis 7 (DB 1)
- **Migration**: [golang-migrate](https://github.com/golang-migrate/migrate)
- **Logging**: [uber-go/zap](https://github.com/uber-go/zap) - Structured JSON logging
- **Validation**: [go-playground/validator](https://github.com/go-playground/validator)
- **JWT**: [golang-jwt/jwt](https://github.com/golang-jwt/jwt) - HS512 algorithm

## Architecture

- **Microservices**: Integrates with User Service (Spring Boot, port 8080)
- **Authentication**: JWT token validation (shared secret with User Service)
- **Database**: PostgreSQL with UUID primary keys, no foreign keys (sharding-ready)
- **Soft Deletes**: All entities use `is_deleted` flag instead of hard deletes
- **Audit Fields**: `created_by`, `updated_by`, `created_at`, `updated_at` on all entities

## Project Structure

```
board-service/
├── cmd/
│   └── api/              # Application entry point
├── internal/
│   ├── config/           # Configuration management (Viper)
│   ├── database/         # PostgreSQL connection (GORM)
│   ├── cache/            # Redis client
│   ├── middleware/       # HTTP middlewares (auth, logger, recovery, cors, request_id)
│   ├── handler/          # HTTP request handlers
│   ├── service/          # Business logic
│   ├── repository/       # Data access layer
│   ├── domain/           # Domain models (entities)
│   ├── dto/              # Data transfer objects
│   ├── apperrors/        # Custom error types
│   └── client/           # External service clients (User Service)
├── pkg/
│   ├── logger/           # Zap logger initialization
│   └── jwt/              # JWT validation utilities
├── migrations/           # Database migration files
├── scripts/              # Utility scripts
├── docker/               # Dockerfile and .dockerignore
├── Makefile              # Build and development commands
├── go.mod                # Go module dependencies
└── README.md             # This file
```

## Prerequisites

- Go 1.23 or higher
- PostgreSQL 16
- Redis 7
- Docker and Docker Compose (for containerized deployment)

## Getting Started

### 1. Install Dependencies

```bash
go mod download
go mod tidy
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Key environment variables:
- `ENV`: Environment mode (`dev` or `prod`)
- `USE_AUTO_MIGRATE`: Enable GORM AutoMigrate (`true` for dev, `false` for prod)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `SECRET_KEY`: JWT secret (must match User Service)
- `USER_SERVICE_URL`: User Service base URL

### 3. Database Setup

#### Development (AutoMigrate)

For rapid development, use GORM AutoMigrate:

```bash
# Set USE_AUTO_MIGRATE=true in .env
echo "USE_AUTO_MIGRATE=true" >> .env

# Run server (AutoMigrate runs automatically)
go run cmd/api/main.go

# Or use the init script
./scripts/db/init_dev.sh
```

#### Production (Manual Migrations)

For production, use manual SQL migrations:

```bash
# Apply all pending migrations
./scripts/db/apply_migrations.sh prod

# Rollback specific migration
./scripts/db/rollback.sh prod 20250106120000

# Dump current schema
./scripts/db/dump_schema.sh prod
```

### 4. Run the Application

**Local development:**
```bash
go run cmd/api/main.go
```

**Build and run binary:**
```bash
go build -ldflags="-s -w" -o board-api cmd/api/main.go
./board-api
```

**Docker:**
```bash
docker build -f docker/Dockerfile -t board-service:latest .
docker run -p 8000:8000 --env-file .env board-service:latest
```

### 5. Access Swagger UI

Swagger is available in development mode only:

```bash
# Visit http://localhost:8000/swagger/index.html
open http://localhost:8000/swagger/index.html

# Regenerate Swagger docs (if needed)
swag init -g cmd/api/main.go -o docs
```

## Available Commands

### Development Commands

```bash
# Run service
go run cmd/api/main.go

# Build binary
go build -ldflags="-s -w" -o board-api cmd/api/main.go

# Run tests
go test -v -race -cover ./...

# Run tests with coverage
go test -v -race -coverprofile=coverage.out -covermode=atomic ./...
go tool cover -html=coverage.out -o coverage.html

# Format code
go fmt ./...

# Run linter (requires golangci-lint)
golangci-lint run
golangci-lint run --fix

# Tidy dependencies
go mod download
go mod tidy
```

### Database Commands

```bash
# Initialize development database
./scripts/db/init_dev.sh

# Apply migrations (production)
./scripts/db/apply_migrations.sh prod

# Rollback migration
./scripts/db/rollback.sh prod 20250106120000

# Dump schema
./scripts/db/dump_schema.sh dev
```

### Swagger Commands

```bash
# Generate Swagger documentation
swag init -g cmd/api/main.go -o docs

# View Swagger UI (dev mode only)
open http://localhost:8000/swagger/index.html
```

### Docker Commands

```bash
# Build image
docker build -f docker/Dockerfile -t board-service:latest .

# Run container
docker run -p 8000:8000 --env-file .env board-service:latest
```

## API Endpoints

### Health Check (No Authentication)

```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-03T10:00:00Z",
  "services": {
    "database": "up",
    "redis": "up"
  }
}
```

### API Routes (Authentication Required)

All `/api/*` endpoints require JWT authentication via `Authorization: Bearer <token>` header.

**Coming in future phases:**
- Workspaces API
- Projects API
- Tickets API
- Tasks API
- Comments API
- Attachments API

## Authentication

This service validates JWT tokens issued by the User Service. The tokens use HS512 algorithm and must include:

```json
{
  "sub": "user_id",
  "exp": 1234567890
}
```

Token validation errors:
- `401 MISSING_TOKEN`: No Authorization header
- `401 INVALID_TOKEN`: Malformed or invalid token
- `401 TOKEN_EXPIRED`: Token has expired

## Development

### Code Structure Guidelines

1. **No Foreign Keys**: Use application-level relationships, add comments like `comment='References users.id (no FK)'`
2. **UUID Primary Keys**: All entities use `uuid.UUID` type
3. **Error Handling**: All errors use `apperrors.AppError`
4. **Response Format**: Use `dto.Success()`, `dto.Error()`, `dto.Paginated()`
5. **Logging**: Use structured logging with zap

### Database Migration Strategy

**Development**: GORM AutoMigrate for rapid prototyping
**Production**: Manual SQL migrations for full control

See [`migrations/README.md`](migrations/README.md) for detailed migration workflow.

#### Creating a New Migration

1. Modify models in `internal/domain/`
2. Test with AutoMigrate: `ENV=dev USE_AUTO_MIGRATE=true go run cmd/api/main.go`
3. Dump schema: `./scripts/db/dump_schema.sh dev`
4. Create migration files:
   ```bash
   # migrations/20250110120000_add_attachments.up.sql
   CREATE TABLE IF NOT EXISTS attachments (...);
   INSERT INTO schema_versions (version, description) VALUES ('20250110120000', 'Add attachments table');
   ```
5. Create rollback: `migrations/20250110120000_add_attachments.down.sql`
6. Test: `./scripts/db/apply_migrations.sh dev`
7. Update `autoMigrateAll()` in `internal/database/postgres.go`

### Running Tests

```bash
# Run all tests
go test -v -race -cover ./...

# Run with coverage
go test -v -race -coverprofile=coverage.out -covermode=atomic ./...
go tool cover -html=coverage.out -o coverage.html

# Open coverage report
open coverage.html
```

## Docker Deployment

The service uses multi-stage Docker builds for optimized image size.

**Build:**
```bash
docker build -f docker/Dockerfile -t board-service:latest .
```

**Run:**
```bash
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_URL="redis://..." \
  -e SECRET_KEY="..." \
  board-service:latest
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ENV` | Environment (dev/prod) | `dev` |
| `SERVER_PORT` | HTTP server port | `8000` |
| `DATABASE_URL` | PostgreSQL connection URL | Required |
| `REDIS_URL` | Redis connection URL | Required |
| `SECRET_KEY` | JWT secret key (HS512) | Required |
| `USER_SERVICE_URL` | User Service base URL | Required |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:3000` |
| `LOG_LEVEL` | Logging level (debug/info/warn/error) | `info` |

## Logging

The service uses structured JSON logging in production and console logging in development.

**Log Levels:**
- `debug`: Detailed information for debugging
- `info`: General informational messages
- `warn`: Warning messages
- `error`: Error messages

**Log Fields:**
- `timestamp`: ISO 8601 timestamp
- `level`: Log level
- `msg`: Log message
- `request_id`: Unique request identifier
- `user_id`: Authenticated user ID (if available)
- `error`: Error details (if applicable)

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linter: `make test lint`
4. Build to verify: `make build`
5. Submit a pull request

## License

This project is part of the weAlist platform.
