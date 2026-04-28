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
        ['sh', '-lc', 'redis-server --daemonize yes'],
        ['sh', '-lc', 'service redis-server start'],
        ['sh', '-lc', '/etc/init.d/redis-server start']
    ];

    for (const args of candidates) {
        try {
            run('wsl', args);
            return true;
        } catch (error) {
            // Try next startup command.
        }
    }

    return false;
};

const tryStartViaNativeRedis = () => {
    try {
        run('redis-server', ['--daemonize', 'yes']);
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
    console.error(`[REDIS] ${error.message}`);
    process.exit(1);
});
