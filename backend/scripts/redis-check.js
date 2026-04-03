const { execSync } = require('child_process');
const os = require('os');

/**
 * Intelligent Redis Startup Script
 * - Detects Windows (WSL) or Linux/macOS
 * - Ensures Redis is running before starting the Node.js process
 * - Error-resilient for AWS/Production deployment
 */

const isWindows = os.platform() === 'win32';

async function checkRedis() {
    console.log(`[REDIS-CHECK] Checking Redis status on ${os.platform()}...`);

    if (isWindows) {
        // WINDOWS (WSL) MODE
        try {
            // Check if redis is running in WSL
            execSync('wsl pgrep redis-server', { stdio: 'ignore' });
            console.log('✅ Redis is already running in WSL.');
        } catch (error) {
            console.log('🔄 Redis not found in WSL. Attempting manual start...');
            try {
                // Try manual background start in WSL
                // Note: If this fails, make sure WSL is installed and redis-server is in /usr/bin/redis-server
                execSync('wsl sudo redis-server /etc/redis/redis.conf --daemonize yes', { stdio: 'inherit' });
                console.log('✅ Redis started in WSL (Background).');
            } catch (wslError) {
                console.warn('⚠️  Could not start Redis in WSL automatically. Make sure WSL is running and "sudo service redis-server start" works manually.');
            }
        }
    } else {
        // LINUX / AWS MODE
        try {
            // Standard Linux check
            execSync('pgrep redis-server', { stdio: 'ignore' });
            console.log('✅ Redis is running (Linux/Production).');
        } catch (error) {
            console.warn('⚠️  Redis is NOT running on this Linux server. Please run "sudo service redis-server start".');
        }
    }
}

// Global process start
checkRedis().catch(err => {
    console.error('❌ Redis Check Failed:', err.message);
});
