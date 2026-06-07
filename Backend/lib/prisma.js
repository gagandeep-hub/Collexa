const { PrismaClient } = require('@prisma/client');

// ─── Prisma Singleton ─────────────────────────────────────────────────────────
// Prisma 6 — url schema.prisma mein hai, so koi extra config nahi chahiye.
// Node.js module cache ensure karta hai ke poori app mein sirf ek hi
// PrismaClient instance bane (connection pool share ho).

const prisma = new PrismaClient();

module.exports = prisma;
