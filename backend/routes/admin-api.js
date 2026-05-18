const { requireAdmin } = require('../middleware/require-admin');
const { logAdminAction } = require('../lib/admin-audit');
const { getPackagePrices, savePackagePrices, DEFAULT_PRICES } = require('../lib/pricing-store');
const { grantPackagePurchase } = require('../lib/grant-purchase');
const { normalizeLevel } = require('../lib/package-prices');

const ROLES = ['user', 'admin', 'instructor'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const CATEGORIES = ['cybersecurity', 'cloud', 'data-science'];

function registerAdminApiRoutes(app, { pool, authenticateToken }) {
    const admin = [authenticateToken, requireAdmin];

    app.get('/api/admin/me', admin, (req, res) => {
        res.json({
            success: true,
            data: {
                userId: req.user.userId,
                email: req.user.email,
                role: req.user.role
            }
        });
    });

    app.get('/api/admin/stats', admin, async (req, res) => {
        try {
            const [users, purchases, orders, revenue] = await Promise.all([
                pool.query(`SELECT COUNT(*)::int AS c FROM users`),
                pool.query(
                    `SELECT COUNT(*)::int AS c FROM purchases WHERE is_active = TRUE`
                ).catch(() => ({ rows: [{ c: 0 }] })),
                pool.query(
                    `SELECT COUNT(*)::int AS c FROM payment_orders WHERE status = 'paid'`
                ).catch(() => ({ rows: [{ c: 0 }] })),
                pool.query(
                    `SELECT COALESCE(SUM(price), 0)::float AS s FROM purchases WHERE is_active = TRUE`
                ).catch(() => ({ rows: [{ s: 0 }] }))
            ]);

            const roleBreakdown = await pool.query(
                `SELECT role, COUNT(*)::int AS c FROM users GROUP BY role ORDER BY c DESC`
            );

            res.json({
                success: true,
                data: {
                    totalUsers: users.rows[0]?.c || 0,
                    activePurchases: purchases.rows[0]?.c || 0,
                    paidOrders: orders.rows[0]?.c || 0,
                    revenueTry: revenue.rows[0]?.s || 0,
                    roles: roleBreakdown.rows
                }
            });
        } catch (e) {
            console.error('admin stats:', e);
            res.status(500).json({ success: false, message: 'İstatistikler alınamadı.' });
        }
    });

    app.get('/api/admin/users', admin, async (req, res) => {
        try {
            const q = String(req.query.q || '').trim();
            const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
            const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

            let sql = `SELECT id, email, first_name, last_name, role, access_level, is_active, is_verified, created_at, last_login
                       FROM users`;
            const params = [];
            if (q) {
                params.push(`%${q}%`);
                sql += ` WHERE email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1`;
            }
            sql += ` ORDER BY created_at DESC NULLS LAST LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
            params.push(limit, offset);

            const rows = await pool.query(sql, params);
            let countSql = 'SELECT COUNT(*)::int AS c FROM users';
            const countParams = [];
            if (q) {
                countParams.push(`%${q}%`);
                countSql += ' WHERE email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1';
            }
            const total = await pool.query(countSql, countParams);

            res.json({
                success: true,
                data: {
                    users: rows.rows,
                    total: total.rows[0]?.c || 0,
                    limit,
                    offset
                }
            });
        } catch (e) {
            console.error('admin users:', e);
            res.status(500).json({ success: false, message: 'Kullanıcı listesi alınamadı.' });
        }
    });

    app.get('/api/admin/users/:id', admin, async (req, res) => {
        try {
            const { id } = req.params;
            const user = await pool.query(
                `SELECT id, email, first_name, last_name, role, access_level, is_active, is_verified, created_at, last_login
                 FROM users WHERE id = $1`,
                [id]
            );
            if (!user.rows.length) {
                return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
            }

            let purchases = [];
            try {
                const pr = await pool.query(
                    `SELECT id, category, level, price, payment_status, purchased_at, expires_at, is_active
                     FROM purchases WHERE user_id = $1 ORDER BY purchased_at DESC`,
                    [String(id)]
                );
                purchases = pr.rows;
            } catch {
                /* */
            }

            res.json({
                success: true,
                data: { user: user.rows[0], purchases }
            });
        } catch (e) {
            res.status(500).json({ success: false, message: e.message });
        }
    });

    app.patch('/api/admin/users/:id', admin, async (req, res) => {
        try {
            const { id } = req.params;
            const { role, access_level, is_active, is_verified } = req.body;

            if (role != null && !ROLES.includes(role)) {
                return res.status(400).json({ success: false, message: 'Geçersiz rol.' });
            }
            if (access_level != null && !LEVELS.includes(access_level)) {
                return res.status(400).json({ success: false, message: 'Geçersiz erişim seviyesi.' });
            }

            const sets = [];
            const vals = [];
            let i = 1;
            if (role != null) {
                sets.push(`role = $${i++}`);
                vals.push(role);
            }
            if (access_level != null) {
                sets.push(`access_level = $${i++}`);
                vals.push(access_level);
            }
            if (is_active != null) {
                sets.push(`is_active = $${i++}`);
                vals.push(!!is_active);
            }
            if (is_verified != null) {
                sets.push(`is_verified = $${i++}`);
                vals.push(!!is_verified);
            }
            if (!sets.length) {
                return res.status(400).json({ success: false, message: 'Güncellenecek alan yok.' });
            }
            sets.push(`updated_at = NOW()`);
            vals.push(id);

            const r = await pool.query(
                `UPDATE users SET ${sets.join(', ')} WHERE id = $${i} RETURNING id, email, role, access_level, is_active, is_verified`,
                vals
            );
            if (!r.rows.length) {
                return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
            }

            await logAdminAction(pool, {
                adminId: req.user.userId,
                userId: id,
                action: 'user.update',
                resource: 'users',
                resourceId: id,
                details: req.body,
                req
            });

            res.json({ success: true, data: r.rows[0] });
        } catch (e) {
            console.error('admin patch user:', e);
            res.status(500).json({ success: false, message: e.message });
        }
    });

    app.post('/api/admin/users/:id/grant-package', admin, async (req, res) => {
        try {
            const { id } = req.params;
            const { category, level, price } = req.body;
            if (!category || !level) {
                return res.status(400).json({ success: false, message: 'category ve level gerekli.' });
            }
            if (!CATEGORIES.includes(category)) {
                return res.status(400).json({ success: false, message: 'Geçersiz kategori.' });
            }
            const backendLevel = normalizeLevel(level);
            if (!LEVELS.includes(backendLevel)) {
                return res.status(400).json({ success: false, message: 'Geçersiz seviye.' });
            }

            const prices = await getPackagePrices(pool);
            const expected = prices[category]?.[backendLevel];
            const priceNum = price != null ? Number(price) : expected != null ? expected : 0;

            await grantPackagePurchase(pool, id, category, backendLevel, priceNum);

            await logAdminAction(pool, {
                adminId: req.user.userId,
                userId: id,
                action: 'purchase.grant',
                resource: 'purchases',
                details: { category, level: backendLevel, price: priceNum },
                req
            });

            res.json({ success: true, message: 'Paket tanımlandı.' });
        } catch (e) {
            console.error('admin grant:', e);
            res.status(500).json({ success: false, message: e.message });
        }
    });

    app.post('/api/admin/users/:id/revoke-package', admin, async (req, res) => {
        try {
            const { id } = req.params;
            const { category, level } = req.body;
            const backendLevel = normalizeLevel(level);

            await pool.query(
                `UPDATE purchases SET is_active = FALSE, updated_at = NOW()
                 WHERE user_id = $1 AND category = $2 AND level = $3`,
                [String(id), category, backendLevel]
            );
            try {
                await pool.query(
                    `UPDATE user_package_purchases SET is_active = FALSE, updated_at = NOW()
                     WHERE user_id = $1 AND category = $2 AND level = $3`,
                    [String(id), category, backendLevel]
                );
            } catch {
                /* */
            }

            await logAdminAction(pool, {
                adminId: req.user.userId,
                userId: id,
                action: 'purchase.revoke',
                resource: 'purchases',
                details: { category, level: backendLevel },
                req
            });

            res.json({ success: true, message: 'Paket erişimi kaldırıldı.' });
        } catch (e) {
            res.status(500).json({ success: false, message: e.message });
        }
    });

    app.get('/api/admin/pricing', admin, async (req, res) => {
        try {
            const prices = await getPackagePrices(pool);
            res.json({
                success: true,
                data: { prices, defaults: DEFAULT_PRICES }
            });
        } catch (e) {
            res.status(500).json({ success: false, message: e.message });
        }
    });

    app.put('/api/admin/pricing', admin, async (req, res) => {
        try {
            const { prices } = req.body;
            if (!prices || typeof prices !== 'object') {
                return res.status(400).json({ success: false, message: 'prices nesnesi gerekli.' });
            }
            for (const cat of CATEGORIES) {
                if (!prices[cat]) {
                    return res.status(400).json({ success: false, message: `Eksik kategori: ${cat}` });
                }
                for (const lvl of LEVELS) {
                    const p = Number(prices[cat][lvl]);
                    if (Number.isNaN(p) || p < 0 || p > 999999) {
                        return res.status(400).json({
                            success: false,
                            message: `Geçersiz fiyat: ${cat} / ${lvl}`
                        });
                    }
                    prices[cat][lvl] = p;
                }
            }
            const saved = await savePackagePrices(pool, prices, req.user.userId);
            await logAdminAction(pool, {
                adminId: req.user.userId,
                action: 'pricing.update',
                resource: 'site_settings',
                resourceId: 'package_prices',
                details: prices,
                req
            });
            res.json({ success: true, data: { prices: saved } });
        } catch (e) {
            console.error('admin pricing:', e);
            res.status(500).json({ success: false, message: e.message });
        }
    });

    app.get('/api/admin/purchases', admin, async (req, res) => {
        try {
            const limit = Math.min(parseInt(req.query.limit, 10) || 40, 100);
            const r = await pool.query(
                `SELECT p.*, u.email, u.first_name, u.last_name
                 FROM purchases p
                 LEFT JOIN users u ON u.id::text = p.user_id
                 ORDER BY p.purchased_at DESC NULLS LAST
                 LIMIT $1`,
                [limit]
            ).catch(() => ({ rows: [] }));
            res.json({ success: true, data: r.rows });
        } catch (e) {
            res.status(500).json({ success: false, message: e.message });
        }
    });

    app.get('/api/admin/payment-orders', admin, async (req, res) => {
        try {
            const limit = Math.min(parseInt(req.query.limit, 10) || 40, 100);
            const r = await pool.query(
                `SELECT po.*, u.email
                 FROM payment_orders po
                 LEFT JOIN users u ON u.id::text = po.user_id::text
                 ORDER BY po.created_at DESC
                 LIMIT $1`,
                [limit]
            ).catch(() => ({ rows: [] }));
            res.json({ success: true, data: r.rows });
        } catch (e) {
            res.status(500).json({ success: false, message: e.message });
        }
    });
}

module.exports = { registerAdminApiRoutes };
