// PM2 Ecosystem Configuration for 1M+ Users Scaling
// To start: pm2 start ecosystem.config.js

module.exports = {
  apps : [
    {
      name: "leadgen-api",
      script: "./src/server.js",
      instances: "max",       // Use ALL available CPU cores
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      }
    },
    {
      name: "leadgen-worker",
      script: "./src/worker-entry.js",
      instances: "max",       // Use ALL available CPU cores for workers
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      }
    }
  ]
};
