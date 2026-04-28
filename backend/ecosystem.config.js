const apiInstances = Number.parseInt(process.env.API_INSTANCE_COUNT || '2', 10);
const workerInstances = Number.parseInt(process.env.WORKER_INSTANCE_COUNT || '1', 10);
const schedulerInstances = 1;

module.exports = {
    apps: [
        {
            name: 'leadgen-api',
            script: './src/server.js',
            instances: apiInstances,
            exec_mode: 'cluster',
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                RUNTIME_ROLE: 'api',
                API_INSTANCE_COUNT: String(apiInstances),
                WORKER_INSTANCE_COUNT: String(workerInstances),
                SCHEDULER_INSTANCE_COUNT: String(schedulerInstances)
            }
        },
        {
            name: 'leadgen-worker',
            script: './src/worker-entry.js',
            instances: workerInstances,
            exec_mode: 'cluster',
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                RUNTIME_ROLE: 'worker',
                API_INSTANCE_COUNT: String(apiInstances),
                WORKER_INSTANCE_COUNT: String(workerInstances),
                SCHEDULER_INSTANCE_COUNT: String(schedulerInstances)
            }
        },
        {
            name: 'leadgen-scheduler',
            script: './src/scheduler-entry.js',
            instances: schedulerInstances,
            exec_mode: 'fork',
            max_memory_restart: '500M',
            env: {
                NODE_ENV: 'production',
                RUNTIME_ROLE: 'scheduler',
                API_INSTANCE_COUNT: String(apiInstances),
                WORKER_INSTANCE_COUNT: String(workerInstances),
                SCHEDULER_INSTANCE_COUNT: String(schedulerInstances)
            }
        }
    ]
};
