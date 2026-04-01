/**
 * Cluster Mode Server
 * Runs multiple instances of the server (one per CPU core)
 * Provides 4-8x capacity increase
 */

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const path = require('path');

if (cluster.isMaster) {
    console.log(`🚀 Master process ${process.pid} is running`);
    console.log(`📊 Starting ${numCPUs} worker processes...`);
    console.log(`💡 This will provide ~${numCPUs}x capacity increase\n`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        const worker = cluster.fork();
        console.log(`✅ Worker ${worker.process.pid} started`);
    }

    // Handle worker exit
    cluster.on('exit', (worker, code, signal) => {
        console.log(`⚠️  Worker ${worker.process.pid} died (code: ${code}, signal: ${signal})`);
        console.log(`🔄 Starting a new worker...`);
        const newWorker = cluster.fork();
        console.log(`✅ New worker ${newWorker.process.pid} started`);
    });

    // Handle worker online
    cluster.on('online', (worker) => {
        console.log(`✅ Worker ${worker.process.pid} is online`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('🛑 Master received SIGTERM, shutting down workers...');
        for (const id in cluster.workers) {
            cluster.workers[id].kill();
        }
    });

} else {
    // Worker process - run the actual server
    require('./server.js');
}

