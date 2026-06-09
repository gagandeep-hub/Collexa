const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/db');
const initChatSocket = require('./socket/chatSocket');
const { startCleanupJob } = require('./utils/cleanupMessages');

const app = express();
const httpServer = http.createServer(app);

// ─── CORS Origins ─────────────────────────────────────────────────────────────
const allowedOrigins = [
    'http://localhost:5173',               // local dev
    'http://frontend:5173',                // Docker internal network
    'https://collexa-frontend.onrender.com' // production
];

// ─── Express Middleware ────────────────────────────────────────────────────────
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (if any local uploads still used alongside Cloudinary)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Socket.io ────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

initChatSocket(io);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Collexa API',
        status: 'Server is running'
    });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/chat', require('./routes/chat.routes'));

// ─── Error Handling Middleware ────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);

    // Handle Multer errors
    if (err.name === 'MulterError') {
        return res.status(400).json({
            success: false,
            message: err.message === 'File too large'
                ? 'File is too large. Please upload images smaller than 10MB.'
                : err.message
        });
    }

    // Handle Prisma known request errors
    if (err.code === 'P2002') {
        return res.status(409).json({
            success: false,
            message: 'A record with this value already exists.'
        });
    }

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📍 http://localhost:${PORT}`);
        console.log(`🔌 Socket.io ready`);
    });

    // Start the daily message cleanup cron job
    startCleanupJob();
});
