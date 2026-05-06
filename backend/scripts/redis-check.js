const net = require('net');
const os = require('os');
const { execFileSync } = require('child_process');

const host = process.env.REDIS_HOST || '127.0.0.1';
const port = Number.parseInt(process.env.REDIS_PORT || '6379', 10);
const startupTimeoutMs = Number.parseInt(process.env.REDIS_STARTUP_TIMEOUT_MS || '15000', 10);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const canConnect = () => new Promise((resolve) => {
    const socket = new net.Socket();

    const finish = (status) => {
        socket.destroy();
        resolve(status);
    };

    socket.setTimeout(1000);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
    socket.connect(port, host);
});

const waitForRedis = async () => {
    const startedAt = Date.now();

    while (Date.now() - startedAt < startupTimeoutMs) {
        if (await canConnect()) {
            return true;
        }

        await sleep(500);
    }

    return false;
};

const run = (command, args) => {
    execFileSync(command, args, {
        stdio: 'ignore',
        windowsHide: true
    });
};

const tryStartViaWsl = () => {
    const candidates = [
        ['redis-server', '--daemonize', 'yes'],
        ['sh', '-lc', 'redis-server --daemonize yes'],
        ['sudo', 'service', 'redis-server', 'start'],
        ['service', 'redis-server', 'start'],
        ['sh', '-lc', 'service redis-server start']
    ];

    let errors = [];
    for (const args of candidates) {
        try {
            require('child_process').execFileSync('wsl', args, {
                stdio: 'pipe', // Capture output to check stderr
                windowsHide: true
            });
            return true; // Success!
        } catch (error) {
            const stderr = error.stderr ? error.stderr.toString().trim() : '';
            errors.push(`[${args.join(' ')}] failed: ${stderr || error.message}`);
        }
    }
    
    // Log why WSL failed to start Redis, ignoring ENOENT (WSL not installed)
    if (!errors[0].includes('ENOENT')) {
        console.warn('[REDIS WARNING] Tried starting via WSL but failed. Errors:');
        errors.forEach(err => console.warn(`  -> ${err}`));
    }

    return false;
};

const tryStartViaNativeRedis = () => {
    try {
        // Native Windows Redis does not support --daemonize
        // First check if redis-server is available
        require('child_process').execFileSync('redis-server', ['--version'], { stdio: 'ignore', windowsHide: true });
        
        // Spawn it detached so it runs in background
        const child = require('child_process').spawn('redis-server', [], {
            detached: true,
            stdio: 'ignore',
            windowsHide: true
        });
        child.unref();
        
        return true;
    } catch (error) {
        return false;
    }
};

const ensureRedis = async () => {
    if (await canConnect()) {
        console.log(`[REDIS] Already running on ${host}:${port}`);
        return;
    }

    console.log(`[REDIS] Not running on ${host}:${port}. Attempting startup...`);

    let started = false;

    if (os.platform() === 'win32') {
        started = tryStartViaWsl() || tryStartViaNativeRedis();
    } else {
        started = tryStartViaNativeRedis();
    }

    if (!started) {
        throw new Error(
            'Redis auto-start failed. Install redis-server locally or make sure WSL Redis is available.'
        );
    }

    const ready = await waitForRedis();
    if (!ready) {
        throw new Error(`Redis startup command ran, but ${host}:${port} did not become reachable within ${startupTimeoutMs}ms.`);
    }

    console.log(`[REDIS] Ready on ${host}:${port}`);
};

ensureRedis().catch((error) => {
    console.warn(`[REDIS WARNING] ${error.message}`);
    console.warn('[REDIS WARNING] Dev server will proceed without Redis, but some realtime features/queues may be disabled.');
    process.exit(0);
});
