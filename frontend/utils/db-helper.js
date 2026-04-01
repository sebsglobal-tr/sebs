/**
 * Database Helper Utilities
 * Provides connection retry, error handling, and query wrappers
 */

// Lazy load pool to avoid circular dependency
let pool = null;
const getPool = () => {
    if (!pool) {
        try {
            const serverModule = require('../server');
            pool = serverModule.getPool?.() || serverModule.pool || null;
        } catch (error) {
            console.error('Failed to get pool:', error);
        }
    }
    return pool;
};

/**
 * Execute a query with automatic retry on connection errors
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @returns {Promise} Query result
 */
async function queryWithRetry(text, params = [], maxRetries = 3) {
    const poolInstance = getPool();
    if (!poolInstance) {
        throw new Error('Database pool not initialized');
    }

    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await poolInstance.query(text, params);
            return result;
        } catch (error) {
            lastError = error;
            
            // Check if it's a connection error that should be retried
            const isConnectionError = 
                error.code === 'ECONNREFUSED' ||
                error.code === 'ETIMEDOUT' ||
                error.code === 'ENOTFOUND' ||
                error.message.includes('connection') ||
                error.message.includes('timeout') ||
                error.message.includes('ECONNRESET');
            
            if (isConnectionError && attempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
                console.warn(`⚠️  Database query failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`, error.message);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            
            // If not a connection error or max retries reached, throw
            throw error;
        }
    }
    
    throw lastError;
}

/**
 * Get a client from the pool with automatic retry
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise} Database client
 */
async function getClient(maxRetries = 3) {
    const poolInstance = getPool();
    if (!poolInstance) {
        throw new Error('Database pool not initialized');
    }

    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const client = await poolInstance.connect();
            return client;
        } catch (error) {
            lastError = error;
            
            const isConnectionError = 
                error.code === 'ECONNREFUSED' ||
                error.code === 'ETIMEDOUT' ||
                error.message.includes('connection');
            
            if (isConnectionError && attempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                console.warn(`⚠️  Failed to get database client (attempt ${attempt}/${maxRetries}), retrying...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            
            throw error;
        }
    }
    
    throw lastError;
}

/**
 * Check database connection health
 * @returns {Promise<boolean>} True if connection is healthy
 */
async function checkHealth() {
    try {
        await queryWithRetry('SELECT 1', [], 1);
        return true;
    } catch (error) {
        console.error('❌ Database health check failed:', error.message);
        return false;
    }
}

module.exports = {
    queryWithRetry,
    getClient,
    checkHealth
};

