import { PrismaClient } from "@prisma/client";

// Single Prisma client instance for the whole app.
// This avoids opening too many database connections.
export const prisma = new PrismaClient();
