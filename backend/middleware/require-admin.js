const { isAdminUser } = require('../lib/is-admin-user');

const FULL_ACCESS_EMAIL = process.env.SUPER_ADMIN_EMAIL || process.env.FULL_ACCESS_EMAIL || '';

/**
 * authenticateToken sonrası kullanın. req.user.role === 'admin' veya süper admin e-posta.
 */
function requireAdmin(req, res, next) {
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ success: false, message: 'Giriş gerekli.' });
    }
    if (!isAdminUser(req.user, FULL_ACCESS_EMAIL)) {
        return res.status(403).json({ success: false, message: 'Bu işlem için yönetici yetkisi gerekli.' });
    }
    next();
}

module.exports = { requireAdmin };
