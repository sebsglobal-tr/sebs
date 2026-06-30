const { Pool } = require('pg');
let pool = null;
function getPaymentPool() {
  if (pool) return pool;
  const url = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!url) throw new Error('DATABASE_URL required for payment pool');
  pool = new Pool({
    connectionString: url,
    ssl: url.includes('supabase') || url.includes('pooler')
      ? { rejectUnauthorized: false }
      : false,
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000
  });
  pool.on('error', err => console.error('Payment pool error:', err));
  return pool;
}
module.exports = { getPaymentPool };
