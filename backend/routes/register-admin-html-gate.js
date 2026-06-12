const path = require('path');
const fs = require('fs');
const { isAdminUser } = require('../lib/is-admin-user');

function registerAdminHtmlGate(app, { frontendDir, resolveUserFromRequest, fullAccessEmail }) {
    const adminFile = path.join(frontendDir, 'admin.html');
    if (!fs.existsSync(adminFile)) return;

    async function serveAdminOrDeny(req, res) {
        const user = await resolveUserFromRequest(req);
        if (!user) {
            const redirect = encodeURIComponent(req.originalUrl || '/admin');
            return res.redirect(302, `/login.html?redirect=${redirect}`);
        }
        if (!isAdminUser(user, fullAccessEmail)) {
            return res.redirect(302, '/dashboard.html');
        }
        res.setHeader('Cache-Control', 'private, no-store, no-cache');
        return res.sendFile(adminFile);
    }

    app.get(['/admin.html', '/admin', '/yonetim'], serveAdminOrDeny);
}

module.exports = { registerAdminHtmlGate };
