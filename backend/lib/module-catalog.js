/** Modül slug → seviye/kategori (frontend access-control.js ile uyumlu) */
const MODULE_LEVELS = {
    'guncel-siber-guvenlige-giris': 'beginner',
    'temel-siber-guvenlik': 'beginner',
    'temel-network-egitimi': 'beginner',
    'temel-network': 'beginner',
    'isletim-sistemi-guvenligi-temel': 'beginner',
    'temel-kriptografi': 'beginner',
    'sosyal-muhendislik-giris': 'beginner',
    'sosyal-muhendislik': 'beginner',
    'network-guvenligi': 'intermediate',
    'web-uygulama-guvenligi': 'intermediate',
    'malware-analizi': 'intermediate',
    soc: 'intermediate',
    'isletim-sistemi-guvenligi-temel': 'beginner',
    'isletim-sistemi-guvenligi-ileri': 'intermediate',
    'temel-cloud-security': 'intermediate',
    'ileri-malware-analizi': 'advanced',
    'incident-response': 'advanced',
    'ileri-kriptografi': 'advanced',
    'cloud-security-ileri': 'advanced',
    'penetration-testing': 'advanced',
    'threat-hunting': 'advanced',
    'aws-temelleri': 'beginner',
    'azure-cloud': 'beginner',
    gcp: 'beginner'
};

const FREE_MODULE_SLUGS = new Set(['guncel-siber-guvenlige-giris', 'coming-soon']);

const LEVEL_RANK = { beginner: 0, intermediate: 1, advanced: 2 };

function getModuleLevel(slug) {
    const s = String(slug || '').toLowerCase();
    const keys = Object.keys(MODULE_LEVELS).sort((a, b) => b.length - a.length);
    for (const key of keys) {
        if (s.includes(key)) return MODULE_LEVELS[key];
    }
    return 'beginner';
}

function getCategoryFromSlug(slug) {
    const s = String(slug || '').toLowerCase();
    if (['aws-temelleri', 'azure-cloud', 'gcp'].some((k) => s.includes(k))) return 'cloud';
    if (s.includes('data-science')) return 'data-science';
    return 'cybersecurity';
}

function isFreeModule(slug) {
    return FREE_MODULE_SLUGS.has(String(slug || '').toLowerCase());
}

function levelRank(level) {
    const k = String(level || 'beginner').toLowerCase();
    return LEVEL_RANK[k] != null ? LEVEL_RANK[k] : 0;
}

function meetsRequiredLevel(userLevel, requiredLevel) {
    return levelRank(userLevel) >= levelRank(requiredLevel);
}

module.exports = {
    FREE_MODULE_SLUGS,
    getModuleLevel,
    getCategoryFromSlug,
    isFreeModule,
    levelRank,
    meetsRequiredLevel
};
