
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const path = require('path');

if (cluster.isMaster) {
    console.log(`🚀 Master process ${process.pid} is running`);
    console.log(`📊 Starting ${numCPUs} worker processes...`);
    console.log(`💡 This will provide ~${numCPUs}x capacity increase\n`);

    for (let i = 0; i < numCPUs; i++) {
        const worker = cluster.fork();
        console.log(`✅ Worker ${worker.process.pid} started`);
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`⚠️  Worker ${worker.process.pid} died (code: ${code}, signal: ${signal})`);
        console.log(`🔄 Starting a new worker...`);
        const newWorker = cluster.fork();
        console.log(`✅ New worker ${newWorker.process.pid} started`);
    });

    cluster.on('online', (worker) => {
        console.log(`✅ Worker ${worker.process.pid} is online`);
    });

    process.on('SIGTERM', () => {
        console.log('🛑 Master received SIGTERM, shutting down workers...');
        for (const id in cluster.workers) {
            cluster.workers[id].kill();
        }
    });

} else {
    require('./server.js');
}

