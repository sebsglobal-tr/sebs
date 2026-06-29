
const path = require('path');
const fs = require('fs');

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

const currentLogLevel = isProduction ? LEVELS.INFO : LEVELS.DEBUG;

function formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const levelStr = level.toUpperCase().padEnd(5);
    const formattedArgs = args.length > 0 ? ' ' + JSON.stringify(args) : '';
    return `[${timestamp}] [${levelStr}] ${message}${formattedArgs}`;
}

function writeToFile(level, message, ...args) {
    if (!isProduction) return;
    
    try {
        const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
        const logMessage = formatMessage(level, message, ...args) + '\n';
        fs.appendFileSync(logFile, logMessage, { encoding: 'utf8' });
    } catch (error) {
        console.error('[LOGGER ERROR]', error.message);
    }
}

const logger = {
    error: function(message, ...args) {
        if (currentLogLevel >= LEVELS.ERROR) {
            const formatted = formatMessage('error', message, ...args);
            console.error(formatted);
            writeToFile('error', message, ...args);
        }
    },
    
    warn: function(message, ...args) {
        if (currentLogLevel >= LEVELS.WARN) {
            const formatted = formatMessage('warn', message, ...args);
            console.warn(formatted);
            writeToFile('warn', message, ...args);
        }
    },
    
    info: function(message, ...args) {
        if (currentLogLevel >= LEVELS.INFO) {
            const formatted = formatMessage('info', message, ...args);
            console.log(formatted);
            writeToFile('info', message, ...args);
        }
    },
    
    debug: function(message, ...args) {
        if (currentLogLevel >= LEVELS.DEBUG && isDevelopment) {
            const formatted = formatMessage('debug', message, ...args);
            console.debug(formatted);
        }
    },
    
    db: {
        query: function(sql, params) {
            if (isDevelopment) {
                logger.debug('DB Query:', sql, params ? `Params: ${JSON.stringify(params)}` : '');
            }
        },
        error: function(error, sql, params) {
            logger.error('DB Error:', error.message, sql ? `SQL: ${sql}` : '');
        }
    },
    
    http: {
        request: function(method, path, ip) {
            logger.info(`HTTP ${method} ${path}`, ip ? `from ${ip}` : '');
        },
        error: function(statusCode, message, path) {
            logger.warn(`HTTP ${statusCode} ${path}`, message);
        }
    }
};

module.exports = logger;

