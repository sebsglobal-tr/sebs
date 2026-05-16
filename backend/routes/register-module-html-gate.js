const path = require('path');
const fs = require('fs');
const { isFreeModule } = require('../lib/module-catalog');
const { userCanAccessModule } = require('../lib/module-entitlement');

function shouldEnforceModuleHtmlGate(req) {
    if (process.env.MODULE_HTML_GATE === '0') return false;
    if (process.env.MODULE_HTML_GATE === '1') return true;
    const host = String(req.hostname || '').toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) {
        return false;
    }
    return process.env.NODE_ENV === 'production';
}

function registerModuleHtmlGate(app, { frontendDir, pool, resolveUserFromRequest, fullAccessEmail, logger }) {
    const modulesDir = path.join(frontendDir, 'modules');

    app.get('/modules/:moduleHtml', async (req, res, next) => {
        const fileName = req.params.moduleHtml;
        if (!fileName || !/^[a-zA-Z0-9._-]+\.html$/.test(fileName)) {
            return next();
        }

        const filePath = path.join(modulesDir, fileName);
        if (!fs.existsSync(filePath)) {
            return next();
        }

        if (!shouldEnforceModuleHtmlGate(req)) {
            return res.sendFile(filePath);
        }

        const slug = fileName.replace(/\.html$/i, '').toLowerCase();
        if (isFreeModule(slug)) {
            return res.sendFile(filePath);
        }

        const user = await resolveUserFromRequest(req);
        const access = await userCanAccessModule(pool, user, slug, fullAccessEmail);

        if (access.allowed) {
            return res.sendFile(filePath);
        }

        if (access.reason === 'login') {
            const redirect = encodeURIComponent(`/modules/${fileName}`);
            return res.redirect(302, `/login.html?redirect=${redirect}`);
        }

        const cat = access.category || 'cybersecurity';
        const lvl = access.level || 'beginner';
        return res.redirect(302, `/pricing.html?category=${encodeURIComponent(cat)}&level=${encodeURIComponent(lvl)}&module=${encodeURIComponent(slug)}`);
    });
}

module.exports = { registerModuleHtmlGate, shouldEnforceModuleHtmlGate };
