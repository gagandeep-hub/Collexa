const prisma = require('../lib/prisma');

// ─── PostgreSQL Connection Check ──────────────────────────────────────────────
// Mongoose ki tarah koi alag "connect" step nahi hota Prisma mein.
// Prisma lazy connection use karta hai — pehli query pe connect hota hai.
// Yeh function sirf ek test query chalata hai to confirm DB is reachable.

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('✅ PostgreSQL Connected Successfully (via Prisma)');
    } catch (error) {
        console.error('❌ PostgreSQL Connection Error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
