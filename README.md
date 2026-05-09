# Goshop Backend Skeleton

This is a clean backend starter for Goshop using:

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL

## Quick start

1. Install dependencies

```bash
npm install
```

2. Create your environment file

```bash
copy .env.example .env
```

3. Update `DATABASE_URL` in `.env` to your local PostgreSQL database.

4. Generate Prisma client

```bash
npm run prisma:generate
```

5. Start dev server

```bash
npm run dev
```

Server runs by default on:

- `http://localhost:4000`

## Available APIs

The backend includes the following modular APIs:
- **Auth API** (`/api/v1/auth`)
- **Supermarkets & Catalog API** (`/api/v1/supermarkets`, `/api/v1/categories`, `/api/v1/products`)
- **Saved Addresses API** (`/api/v1/addresses`)
- **Cart API** (`/api/v1/cart`)
- **Checkout & Orders API** (`/api/v1/checkout`, `/api/v1/orders`)
- **Payment Placeholder API** (`/api/v1/payments`)
- **Rider Tracking Placeholder API** (`/api/v1/orders/:orderId/tracking`, etc.)

## Health check endpoint

- `GET /health`

Expected response:

```json
{
  "status": "ok",
  "message": "Goshop backend is running"
}
```
