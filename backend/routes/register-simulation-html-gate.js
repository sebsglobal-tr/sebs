const path = require('path');
const fs = require('fs');
const { userCanAccessSimulation } = require('../lib/simulation-entitlement');
const { shouldEnforceModuleHtmlGate } = require('./register-module-html-gate');

function registerSimulationHtmlGate(app, { frontendDir, pool, resolveUserFromRequest, fullAccessEmail }) {
    const simulationDir = path.join(frontendDir, 'simulation');

    app.get('/simulation/:simHtml', async (req, res, next) => {
        const fileName = req.params.simHtml;
        if (!fileName || !/^[a-zA-Z0-9._-]+\.html$/.test(fileName)) {
            return next();
        }

        const filePath = path.join(simulationDir, fileName);
        if (!fs.existsSync(filePath)) {
            return next();
        }

        if (!shouldEnforceModuleHtmlGate(req)) {
            return res.sendFile(filePath);
        }

        const user = await resolveUserFromRequest(req);
        const access = await userCanAccessSimulation(pool, user, `/simulation/${fileName}`, fullAccessEmail);

        if (access.allowed) {
            return res.sendFile(filePath);
        }

        if (access.reason === 'login') {
            const redirect = encodeURIComponent(`/simulation/${fileName}`);
            return res.redirect(302, `/login.html?redirect=${redirect}`);
        }

        const lvl = access.level || 'beginner';
        const roadLevel =
            lvl === 'advanced' ? 'zirve' : lvl === 'intermediate' ? 'yukselis' : 'ilk-adim';
        return res.redirect(
            302,
            `/fiyatlandirma?category=sebs-road&level=${encodeURIComponent(roadLevel)}&simulation=${encodeURIComponent(fileName)}`
        );
    });
}

module.exports = { registerSimulationHtmlGate };
