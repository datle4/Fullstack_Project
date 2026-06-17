# LAPORA - Fullstack Laptop E-commerce Platform

LAPORA is a fullstack laptop e-commerce project built with Next.js, Prisma, PostgreSQL and Docker.  
The project focuses on real e-commerce workflows: product listing, authentication, shopping cart, checkout, order history, COD payment and MoMo sandbox payment.

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: Next.js Route Handlers, Prisma ORM
- Database: PostgreSQL
- Authentication: Custom session-based authentication with HttpOnly cookies
- Payment: COD and MoMo sandbox integration
- DevOps: Docker, Docker Compose, GitHub Actions CI
- Cloud plan: AWS EC2/ECS, RDS PostgreSQL, S3, CloudFront, CloudWatch

## Main Features

- User registration and login
- Secure session management with hashed session tokens
- Product listing with search, filtering, sorting and pagination
- Product detail page
- Shopping cart with quantity controls and stock validation
- Checkout with COD and MoMo payment options
- MoMo sandbox payment creation, callback/IPN handling and payment result page
- Order history and order detail pages
- Dockerized production build
- GitHub Actions CI with TypeScript, lint, build and Docker image validation
- Health check endpoint for deployment monitoring

## Architecture Overview

```text
User Browser
    |
    v
Next.js App
    |
    |-- Server Components / Pages
    |-- Route Handlers / API
    |
    v
Prisma ORM
    |
    v
PostgreSQL Database

External integrations:
- MoMo Sandbox Payment Gateway
- Future AWS S3/CloudFront for product images

## Database Design

The database is designed around a typical e-commerce workflow: users browse products, add items to cart, checkout, create orders and complete payment.

### Main Tables

| Table | Purpose |
| --- | --- |
| `users` | Stores user accounts, login information and user roles. |
| `sessions` | Stores hashed session tokens for authentication. |
| `products` | Stores laptop product data such as name, brand, price, stock and specifications. |
| `cart_items` | Stores products that users add to their shopping cart. |
| `orders` | Stores checkout information and order status. |
| `order_items` | Stores product snapshots inside each order. |
| `payments` | Stores payment records for COD and MoMo transactions. |