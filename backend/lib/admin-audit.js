/** @param {import('pg').Pool} pool */
async function logAdminAction(pool, { adminId, userId, action, resource, resourceId, details, req }) {
    try {
        await pool.query(
            `INSERT INTO security_logs (id, admin_id, user_id, action, resource, resource_id, ip_address, user_agent, success, details, created_at)
             VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, true, $8, NOW())`,
            [
                adminId || null,
                userId || null,
                action,
                resource || null,
                resourceId || null,
                req?.ip || req?.headers?.['x-forwarded-for'] || null,
                req?.get?.('user-agent') || null,
                typeof details === 'string' ? details : JSON.stringify(details || {})
            ]
        );
    } catch (err) {
        if (err.code === '42P01') return;
        console.warn('admin audit log:', err.message);
    }
}

module.exports = { logAdminAction };
