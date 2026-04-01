// PM2 Ecosystem Configuration
// Process manager for production deployment

module.exports = {
    apps: [
        {
            name: 'sebs-global',
            script: './server.js',
            instances: 'max', // Use all CPU cores (cluster mode)
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'development',
                PORT: 8006
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 8006
            },
            // Logging
            error_file: './logs/pm2-error.log',
            out_file: './logs/pm2-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            
            // Performance
            max_memory_restart: '1G', // Restart if memory exceeds 1GB
            min_uptime: '10s', // Minimum uptime to consider app stable
            max_restarts: 10, // Max restarts in 1 minute
            restart_delay: 4000, // Delay between restarts
            
            // Monitoring
            watch: false, // Don't watch for file changes in production
            ignore_watch: ['node_modules', 'logs', 'tmp'],
            
            // Advanced
            kill_timeout: 5000, // Time to wait before force kill
            wait_ready: true, // Wait for app to be ready
            listen_timeout: 10000, // Time to wait for app to start listening
            shutdown_with_message: true,
            
            // Health check
            health_check_grace_period: 3000,
            health_check_fatal_exceptions: true
        }
    ]
};
