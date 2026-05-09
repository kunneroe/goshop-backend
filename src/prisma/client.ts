import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env";

const pool = new Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// Single Prisma client instance for the whole app.
// This avoids opening too many database connections.
export const prisma = new PrismaClient({ adapter });
