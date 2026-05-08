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

## Health check endpoint

- `GET /health`

Expected response:

```json
{
  "status": "ok",
  "message": "Goshop backend is running"
}
```
