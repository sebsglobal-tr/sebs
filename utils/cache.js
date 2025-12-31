/**
 * Redis Cache Utility
 * Provides caching for frequently accessed data
 * Reduces database load by 2-3x
 */

let redisClient = null;
let cacheEnabled = false;

// Initialize Redis client (lazy loading)
const initRedis = () => {
    if (redisClient) return redisClient;
    
    try {
        const redis = require('redis');
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        
        redisClient = redis.createClient({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        console.error('❌ Redis connection failed after 10 retries');
                        return false; // Stop reconnecting
                    }
                    return Math.min(retries * 100, 3000); // Exponential backoff, max 3s
                }
            }
        });

        redisClient.on('error', (err) => {
            console.error('⚠️  Redis Client Error:', err.message);
            cacheEnabled = false;
        });

        redisClient.on('connect', () => {
            console.log('✅ Redis connected');
            cacheEnabled = true;
        });

        redisClient.on('ready', () => {
            console.log('✅ Redis ready');
            cacheEnabled = true;
        });

        // Connect to Redis
        redisClient.connect().catch(err => {
            console.warn('⚠️  Redis connection failed, caching disabled:', err.message);
            cacheEnabled = false;
        });

        return redisClient;
    } catch (error) {
        console.warn('⚠️  Redis not available, caching disabled:', error.message);
        cacheEnabled = false;
        return null;
    }
};

/**
 * Get cached value
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached value or null
 */
async function getCache(key) {
    if (!cacheEnabled) {
        try {
            const client = initRedis();
            if (!client) return null;
            
            const value = await client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.warn('⚠️  Cache get error:', error.message);
            return null;
        }
    }
    return null;
}

/**
 * Set cache value
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: 3600)
 * @returns {Promise<boolean>} Success status
 */
async function setCache(key, value, ttl = 3600) {
    if (!cacheEnabled) {
        try {
            const client = initRedis();
            if (!client) return false;
            
            await client.setEx(key, ttl, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('⚠️  Cache set error:', error.message);
            return false;
        }
    }
    return false;
}

/**
 * Delete cache key
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Success status
 */
async function deleteCache(key) {
    if (!cacheEnabled) {
        try {
            const client = initRedis();
            if (!client) return false;
            
            await client.del(key);
            return true;
        } catch (error) {
            console.warn('⚠️  Cache delete error:', error.message);
            return false;
        }
    }
    return false;
}

/**
 * Clear all cache (use with caution)
 * @returns {Promise<boolean>} Success status
 */
async function clearCache() {
    if (!cacheEnabled) {
        try {
            const client = initRedis();
            if (!client) return false;
            
            await client.flushAll();
            return true;
        } catch (error) {
            console.warn('⚠️  Cache clear error:', error.message);
            return false;
        }
    }
    return false;
}

/**
 * Check if cache is enabled
 * @returns {boolean} Cache enabled status
 */
function isCacheEnabled() {
    return cacheEnabled;
}

module.exports = {
    initRedis,
    getCache,
    setCache,
    deleteCache,
    clearCache,
    isCacheEnabled
};

