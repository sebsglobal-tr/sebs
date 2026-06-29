const { isFreeModule, getCategoryFromSlug } = require('../lib/module-catalog');
const { userCanAccessModule } = require('../lib/module-entitlement');

function registerModuleAccessApiRoutes(app, { pool, resolveUserFromRequest, fullAccessEmail }) {
    app.get('/api/modules/access/:slug', async (req, res) => {
        try {
            const slug = String(req.params.slug || '')
                .toLowerCase()
                .replace(/\.html$/i, '');

            if (!slug) {
                return res.status(400).json({ success: false, message: 'Modül slug gerekli.' });
            }

            if (isFreeModule(slug)) {
                return res.json({
                    success: true,
                    data: { allowed: true, reason: 'free', slug }
                });
            }

            const user = await resolveUserFromRequest(req);
            const access = await userCanAccessModule(pool, user, slug, fullAccessEmail);

            const category = access.category || getCategoryFromSlug(slug);
            const level = access.level || 'beginner';

            return res.json({
                success: true,
                data: {
                    allowed: Boolean(access.allowed),
                    reason: access.reason || (access.allowed ? 'ok' : 'purchase'),
                    slug,
                    category,
                    level,
                    pricingUrl: `/fiyatlandirma?category=${encodeURIComponent(category)}&level=${encodeURIComponent(level)}&module=${encodeURIComponent(slug)}`,
                    loginUrl: `/login.html?redirect=${encodeURIComponent(`/modules/${slug}.html`)}`
                }
            });
        } catch (error) {
            console.error('Module access check:', error);
            return res.status(500).json({
                success: false,
                message: 'Erişim kontrolü yapılamadı.'
            });
        }
    });
}

module.exports = { registerModuleAccessApiRoutes };
