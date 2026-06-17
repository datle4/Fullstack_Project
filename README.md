# LAPORA - Fullstack Laptop E-commerce

LAPORA is a fullstack laptop e-commerce project built with Next.js, Prisma,
PostgreSQL and Docker.

The project focuses on core e-commerce workflows: product browsing,
authentication, shopping cart, checkout, order tracking, COD payment, MoMo
sandbox payment, and a basic admin dashboard.

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: Next.js App Router, Route Handlers, Server Actions
- Database: PostgreSQL
- ORM: Prisma
- Authentication: Custom session-based authentication with HttpOnly cookies
- Payment: COD and MoMo sandbox
- DevOps: Docker, Docker Compose, GitHub Actions CI

## Features

- User registration and login
- Session-based authentication with hashed session tokens
- Product listing with search, filter, sort and pagination
- Product detail page
- Shopping cart with quantity controls and stock validation
- Checkout with COD and MoMo sandbox payment
- Order history and order detail pages
- Admin dashboard protected by role-based authorization
- Admin order status management
- Admin product stock and visibility management
- Dockerized production build
- GitHub Actions CI for typecheck, lint, build and Docker image validation
- Health check endpoint for deployment readiness

## Architecture Overview

```text
Browser
  |
  v
Next.js Application
  |
  |-- Server Components / Pages
  |-- Route Handlers
  |-- Server Actions
  |
  v
Prisma ORM
  |
  v
PostgreSQL

External integration:
- MoMo Sandbox Payment Gateway
```

## Authentication Overview

This project uses a stateful session model instead of long-lived stateless JWTs.

```text
Login
  -> create random session token
  -> store token hash in database
  -> send raw token to browser as HttpOnly cookie

Request
  -> read cookie
  -> hash token
  -> find matching session in database

Logout
  -> delete current session from database
  -> delete browser cookie
```

This allows the server to revoke a session immediately when the user logs out.

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

### 3. Configure environment variables

Create a `.env` file in the project root.

```env
DATABASE_URL=""
APP_URL="http://localhost:3000"
SESSION_COOKIE_NAME=""

MOMO_PARTNER_CODE="MOMO"
MOMO_ACCESS_KEY="your_access_key"
MOMO_SECRET_KEY="your_secret_key"
MOMO_ENDPOINT="https://test-payment.momo.vn/v2/gateway/api/create"
```

### 4. Run database migrations

```bash
npx prisma migrate dev
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Import product data

```bash
npm run import:products
```

### 7. Start the development server

```bash
npm run dev
```

Open the application at:

```text
http://localhost:3000
```

## Docker Local Test

Build the production image:

```bash
docker build -t lapora-app .
```

Run the container:

```bash
docker run -d --name lapora_next --env-file .env.docker -p 3000:3000 lapora-app
```

Check app health:

```bash
curl -i http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "database": "connected"
}
```

During development, use `npm run dev` for hot reload. Docker is mainly used to
test the production-like image before deployment.

## CI

GitHub Actions is configured to run on push and pull request.

The pipeline currently checks:

- Dependency installation with `npm ci`
- Prisma Client generation
- TypeScript type checking
- ESLint
- Next.js production build
- Docker image build validation

Cloud deployment documentation and architecture diagrams will be added after
the application is deployed to AWS.

## Useful Commands

```bash
npm run dev
npm run build
npm run lint
npx tsc --noEmit
npx prisma studio
docker compose up -d
docker compose down
```

## Project Status

Current status:

- Fullstack core features completed
- Product import flow completed
- Authentication and authorization completed
- Cart, checkout and order flow completed
- MoMo sandbox integration completed
- Admin dashboard and management pages completed
- Docker and CI pipeline completed

Next planned work:

- Improve README screenshots
- Deploy to AWS
- Add cloud architecture diagram
- Document the final CI/CD deployment flow
