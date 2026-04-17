const { broadcastWorker, maintenanceWorker } = require('./src/workers/notificationWorker');

console.log('👷 Standalone Worker started. Monitoring Redis for jobs...');

broadcastWorker.on('active', (job) => {
    console.log(`[WORKER] Job ${job.id} is now active.`);
});

broadcastWorker.on('completed', (job) => {
    // console.log(`[WORKER] Job ${job.id} completed.`);
});

broadcastWorker.on('failed', (job, err) => {
    console.error(`[WORKER] Job ${job.id} failed: ${err.message}`);
});
