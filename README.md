# Scalable REST API with Auth, RBAC, and Task CRUD

Production-ready Next.js 16 application implementing a versioned REST API with JWT authentication, role-based access, Postgres persistence, Redis caching, Swagger/Postman documentation, and a clean frontend test workbench.

## Tech Stack

- **Framework**: Next.js 16 (App Router + Route Handlers)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT access + refresh token rotation
- **Authorization**: Role-based (`USER`, `ADMIN`)
- **Validation**: Zod
- **Caching**: Redis (optional but implemented)
- **Logging**: Pino structured logs
- **Docs**: OpenAPI (Swagger UI) + Postman JSON endpoint
- **Deployment**: Docker + docker-compose

## Project Structure

```text
src/
  app/
    api/v1/...                 # Versioned REST API routes
    docs/page.tsx              # Swagger UI page
    dashboard/page.tsx         # Protected dashboard demo
    page.tsx                   # Main frontend workbench
  lib/
    api-client.ts              # Frontend API client + token refresh logic
    env.ts                     # Environment validation
  server/
    docs/                      # OpenAPI + Postman builders
    http/                      # Response, handler wrapper, auth helpers
    lib/                       # Prisma, JWT, Redis, logger, errors
    schemas/                   # Zod input validation
    services/                  # Business logic layer
  proxy.ts                     # Route protection for dashboard
prisma/
  schema.prisma
  seed.ts
```

## Quick Start (Local)

1. Install dependencies

```bash
npm install
```

2. Copy environment template

```bash
cp .env.example .env
```

3. Start PostgreSQL + Redis (Docker)

```bash
docker compose up -d db redis
```

4. Generate Prisma client and run migrations

```bash
npm run db:generate
npm run db:migrate
```

5. (Optional) Seed demo users

```bash
npm run db:seed
```

6. Start app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo Credentials (after seed)

- Admin: `admin@example.com` / `Admin@1234`
- User: `user@example.com` / `Admin@1234`

## API Versioning

- All routes are under `/api/v1/*`
- Version discovery endpoint: `GET /api/v1/version`

## Main API Endpoints

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Tasks (protected)

- `GET /api/v1/tasks`
- `POST /api/v1/tasks`
- `PUT /api/v1/tasks/:id`
- `DELETE /api/v1/tasks/:id`

### Admin

- `GET /api/v1/admin/users` (admin only)

### System

- `GET /api/v1/health`

## Authentication and Security

- Password hashing via bcrypt (`12` rounds)
- Short-lived access token (JWT)
- Refresh token rotation with server-side hashed refresh token storage
- HttpOnly refresh token cookie (not readable by JS)
- Access token sent in `Authorization: Bearer <token>`
- Input validation using Zod for body/query/params
- Input sanitization for free-text fields
- Structured, consistent error responses with HTTP status codes

## Frontend Test UI

The root page (`/`) provides a professional test workbench to:

- Register and login
- Validate protected auth flow (`/api/v1/auth/me`)
- Create/list/update/delete tasks
- Show success/error API messages

Protected demo page:

- `/dashboard` uses Proxy-based gatekeeping and auth checks

## API Documentation

- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/api/v1/docs/openapi`
- Postman JSON: `http://localhost:3000/api/v1/docs/postman`

## Docker Deployment

Build and run everything:

```bash
docker compose up --build
```

Then run migration inside app container if needed:

```bash
docker compose exec app npx prisma migrate deploy
```

## Scalability Note

This project is structured for scale by separating transport (`app/api`), validation (`schemas`), business logic (`services`), and infrastructure (`server/lib`).

Near-term scaling options:

1. Split auth/task services into independent deployable services (microservices).
2. Add API gateway + centralized auth for multi-service environments.
3. Use Redis more aggressively (session lookup, rate limits, hot query caching).
4. Add message queue for async workloads (notifications, audit events).
5. Horizontal scale with load balancer + stateless API nodes.

## Quality Checks

```bash
npm run lint
npm run build
```

Both pass in this implementation.
