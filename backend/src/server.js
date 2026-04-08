const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const hpp = require('hpp');
require('dotenv').config();

const path = require('path');
const { errorHandler } = require('./middlewares/errorMiddleware');
const swaggerSetup = require('./config/swagger');

const app = express();

// Graceful Shutdown & Process Handlers
process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err.message);
    process.exit(1); 
});

process.on('unhandledRejection', (reason) => {
    console.error('[FATAL] Unhandled Rejection:', reason);
});

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : [
        'http://localhost:3000', 
        'http://localhost:5173', 
        'http://localhost:5174',
        'https://lead-generation-hp33p72jp-aaanandjoshiii-1651s-projects.vercel.app',
        'https://lead-generation-ivory-two.vercel.app'
      ];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

// Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(hpp());

// Rate Limiters
const { RedisStore } = require('rate-limit-redis');
const { redisConnection } = require('./config/redis');

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5000,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => redisConnection.call(...args),
    }),
    message: { success: false, message: 'Too many requests. Please try again later.' },
    skip: (req) => req.path === '/api/health',
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' },
});

const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Contact limit exceeded. Please try again after an hour.' },
});

// HTTP Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Swagger API Documentation
swaggerSetup(app);

// Server Status
app.get('/', (req, res) => {
    res.send('✅ Lead-Generation API is running!');
});

// Health Check
app.get('/api/health', (req, res) => {
    const { getPoolStatus } = require('./config/db');
    res.status(200).json({
        status: 'UP',
        timestamp: new Date(),
        db_pool: getPoolStatus(),
        uptime: process.uptime()
    });
});

// Routes
app.use('/api/', generalLimiter);
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/vendor', require('./routes/vendorRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

// Public contact form
const { submitMessage } = require('./controllers/contactController');
app.post('/api/contact', contactLimiter, submitMessage);

// Static assets
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const { scheduleJobs } = require('./queues/cronQueue');
const http = require('http');
const server = http.createServer(app);

// Initialize Socket.io
require('./utils/socket').init(server);

server.listen(PORT, () => {
    console.log(`[SERVER] Port ${PORT} | Mode: ${process.env.NODE_ENV || 'development'}`);
    scheduleJobs();
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    server.close(() => {
        process.exit(0);
    });
});

module.exports = app;