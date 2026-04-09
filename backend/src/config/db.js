const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = process.env.DATABASE_URL
    ? {
          connectionString: process.env.DATABASE_URL,
      }
    : {
          user: process.env.DB_USER || 'postgres',
          host: process.env.DB_HOST || 'localhost',
          database: process.env.DB_NAME || 'leadgen',
          password: process.env.DB_PASSWORD || 'postgres',
          port: process.env.DB_PORT || 5432,
      };

// ── Optimized Pool Configuration for 1M+ Users ──
Object.assign(poolConfig, {
    max: 100,                      // Increase max connections for higher throughput
    min: 10,                       // Maintain more warm connections ready
    idleTimeoutMillis: 30000,      // Close idle connections after 30 seconds
    connectionTimeoutMillis: 5000, // Slightly longer timeout for peak loads
    maxUses: 7500,                 // Periodically rotate connections to prevent memory leaks
    allowExitOnIdle: false,
});

const pool = new Pool(poolConfig);

// Log when a new connection is established
pool.on('connect', (client) => {
    console.log(`[DB Pool] New client connected. Total: ${pool.totalCount} | Idle: ${pool.idleCount} | Waiting: ${pool.waitingCount}`);
});

// Log and gracefully handle unexpected errors on idle clients
pool.on('error', (err, client) => {
    console.error('[DB Pool] Unexpected error on idle client:', err.message);
    // Do NOT exit process here — let the pool recover on its own
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,

    // Helper to check pool health (used in /api/health route)
    getPoolStatus: () => ({
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
    }),
};
