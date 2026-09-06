import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not defined");
  }

  const pool = new Pool({
    connectionString,
    max: 5, // stay well under Supabase/PostgreSQL connection limit
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  // Prevent unexpected idle client disconnections from crashing the serverless container
  pool.on("error", (err) => {
    console.warn("Unexpected error on idle PostgreSQL client:", err?.message || err);
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? createClient();

// In serverless environments (Vercel), always reuse the singleton client on warm container invocations
globalForPrisma.prisma = prisma;
