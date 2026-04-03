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

// Global Logger
app.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(`[LOG] ${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
    }
    next();
});

// Graceful Shutdown & Process Handlers
process.on('uncaughtException', (err) => {
    console.error('[PROCESS] Uncaught Exception:', err);
    process.exit(1); 
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[PROCESS] Unhandled Rejection at:', promise, 'reason:', reason);
});

// Security & Optimization Middlewares
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];
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

app.use(helmet()); // Set security headers
app.use(compression()); // Gzip compression for faster response delivery

// Parsing Middlewares
app.use(express.json({ limit: '10kb' })); // Body limit to prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Sanitization Middlewares (Must be after body parser)
app.use(hpp());    // Prevent HTTP Parameter Pollution

// Distributed Rate Limiter (Redis-backed for 1M+ scaling)
const { RedisStore } = require('rate-limit-redis');
const { redisConnection } = require('./config/redis');

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5000, // Increased for high-scale app
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

 
// Logging (Morgan)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined')); // Detailed logging for production
}

// Swagger API Documentation
swaggerSetup(app);

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

// Static assets (if any)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const { scheduleJobs } = require('./queues/cronQueue');
const server = app.listen(PORT, () => {
    console.log(`[SERVER] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[SERVER] Health: http://localhost:${PORT}/api/health`);
    
    // Initializing Automated Maintenance Protocol
    scheduleJobs();
});

// Handle graceful shutdowns
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

module.exports = app;