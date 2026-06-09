const cron = require('node-cron');
const prisma = require('../lib/prisma');

/**
 * Cleanup Job: Deletes messages older than MESSAGE_RETENTION_DAYS (default: 30 days).
 * Runs every day at 2:00 AM.
 *
 * Strategy:
 * - Delete messages from CLOSED conversations that are older than 7 days
 * - Delete messages from ANY conversation that are older than 30 days
 */
const MESSAGE_RETENTION_DAYS = parseInt(process.env.MESSAGE_RETENTION_DAYS) || 30;
const CLOSED_RETENTION_DAYS = parseInt(process.env.CLOSED_CHAT_RETENTION_DAYS) || 7;

const runCleanup = async () => {
    try {
        const now = new Date();

        // ── Delete old messages from closed conversations (7 days) ──────────
        const closedCutoff = new Date(now);
        closedCutoff.setDate(closedCutoff.getDate() - CLOSED_RETENTION_DAYS);

        const closedConversations = await prisma.conversation.findMany({
            where: { isClosed: true },
            select: { id: true }
        });
        const closedIds = closedConversations.map(c => c.id);

        let deletedFromClosed = 0;
        if (closedIds.length > 0) {
            const result = await prisma.message.deleteMany({
                where: {
                    conversationId: { in: closedIds },
                    createdAt: { lt: closedCutoff }
                }
            });
            deletedFromClosed = result.count;
        }

        // ── Delete old messages from any conversation (30 days) ─────────────
        const generalCutoff = new Date(now);
        generalCutoff.setDate(generalCutoff.getDate() - MESSAGE_RETENTION_DAYS);

        const { count: deletedGeneral } = await prisma.message.deleteMany({
            where: {
                createdAt: { lt: generalCutoff }
            }
        });

        console.log(
            `🧹 Cleanup complete: ` +
            `${deletedFromClosed} msgs from closed chats (>${CLOSED_RETENTION_DAYS}d), ` +
            `${deletedGeneral} old msgs (>${MESSAGE_RETENTION_DAYS}d)`
        );

    } catch (error) {
        console.error('❌ Message cleanup job failed:', error);
    }
};

/**
 * Starts the cron job for automatic message cleanup.
 * Schedule: Every day at 2:00 AM server time.
 */
const startCleanupJob = () => {
    console.log(`🗓️  Message cleanup job scheduled (runs daily at 2:00 AM)`);
    console.log(`   - Closed chats: messages deleted after ${CLOSED_RETENTION_DAYS} days`);
    console.log(`   - All chats:    messages deleted after ${MESSAGE_RETENTION_DAYS} days`);

    cron.schedule('0 2 * * *', runCleanup, {
        scheduled: true,
        timezone: 'Asia/Kolkata'
    });
};

module.exports = { startCleanupJob, runCleanup };
