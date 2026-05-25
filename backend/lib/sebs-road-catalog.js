/**
 * SEBS Yolu — modül / simülasyon / değerlendirme erişim kademeleri
 * İlk Adım (beginner) → Yükseliş (intermediate) → Zirve (advanced)
 */
const { getModuleLevel, levelRank, meetsRequiredLevel } = require('./module-catalog');

const ROAD_STAGE_BY_LEVEL = {
    beginner: 'ilk-adim',
    intermediate: 'yukselis',
    advanced: 'zirve'
};

/** Simülasyon URL yolu → gerekli paket seviyesi */
const SIMULATION_PATH_LEVELS = [
    ['sessiz-tekrar-lasfin', 'advanced'],
    ['ileri-kriptografi-simulasyonlari', 'advanced'],
    ['bexacmp-kriptografik', 'advanced'],
    ['penetration-testing', 'advanced'],
    ['threat-hunting', 'advanced'],
    ['incident-response', 'advanced'],
    ['isletim-sistemi-guvenligi-ileri', 'intermediate'],
    ['gece-acilan-kapi', 'intermediate'],
    ['sessiz-birakilan-dosya', 'intermediate'],
    ['malware-analizi', 'intermediate'],
    ['kor-nokta-soc', 'intermediate'],
    ['network-guvenligi', 'intermediate'],
    ['misafir-agini', 'intermediate'],
    ['terminalden-trafik', 'intermediate'],
    ['lunabox-teslimat', 'beginner'],
    ['orion-gece-alarmi', 'beginner'],
    ['temel-kriptografi-simulasyonlari', 'beginner'],
    ['temel-network-simulasyonlari', 'beginner'],
    ['temel-network-misafir', 'beginner'],
    ['sosyal-muhendislik', 'beginner'],
    ['isletim-sistemi-guvenligi-simulasyonlari', 'beginner'],
    ['guvenli-is-istasyonu', 'beginner'],
    ['linux-forensik-lab', 'beginner'],
    ['kayit-haftasi-krizi', 'beginner'],
    ['bir-seyler-yanlis', 'beginner'],
    ['semptom-etki-zinciri', 'beginner'],
    ['temel-siber-guvenlik', 'beginner'],
    ['mertin-bilgisayari', 'beginner'],
    ['temel-siber-guvenlik-simulasyonlari', 'beginner'],
    ['siber-guvenlige-giris', 'beginner'],
    ['web-app-security', 'intermediate'],
    ['kurumsal-guvenlik', 'intermediate']
];

const ASSESSMENT_PATHS = new Set(['big-five', 'kariyer-degerlendirme', 'career-assessment']);

/** Paket satın almadan erişilebilir simülasyonlar (Temel Siber Güvenlik + giriş senaryoları) */
const FREE_SIMULATION_PATH_FRAGMENTS = [
    'temel-siber-guvenlik',
    'siber-guvenlige-giris',
    'kayit-haftasi-krizi',
    'semptom-etki-zinciri',
    'bir-seyler-yanlis',
    'linux-forensik-lab'
];

function isFreeSimulation(pathOrSlug) {
    const s = String(pathOrSlug || '').toLowerCase();
    return FREE_SIMULATION_PATH_FRAGMENTS.some((frag) => s.includes(frag));
}

function getSimulationLevelFromPath(pathOrSlug) {
    const s = String(pathOrSlug || '').toLowerCase();
    for (const [fragment, level] of SIMULATION_PATH_LEVELS) {
        if (s.includes(fragment)) return level;
    }
    return getModuleLevel(s);
}

function isAssessmentPath(pathOrSlug) {
    const s = String(pathOrSlug || '').toLowerCase();
    for (const p of ASSESSMENT_PATHS) {
        if (s.includes(p)) return true;
    }
    return false;
}

/**
 * Aktif satın alımlardan kategori bazlı en yüksek kademe (-1 = yok)
 * @param {{ category: string, level: string }[]} purchases
 */
function getMaxPurchaseRank(purchases, category) {
    const cat = category || 'cybersecurity';
    let max = -1;
    for (const p of purchases || []) {
        const matchCat =
            p.category === cat ||
            (cat === 'cybersecurity' && (p.category === 'cybersecurity' || p.category === 'sebs-road'));
        if (!matchCat) continue;
        max = Math.max(max, levelRank(p.level));
    }
    return max;
}

function userMeetsTierForLevel(purchases, requiredLevel, category) {
    const maxRank = getMaxPurchaseRank(purchases, category);
    if (maxRank < 0) return false;
    return levelRank(requiredLevel) <= maxRank;
}

module.exports = {
    ROAD_STAGE_BY_LEVEL,
    SIMULATION_PATH_LEVELS,
    ASSESSMENT_PATHS,
    FREE_SIMULATION_PATH_FRAGMENTS,
    isFreeSimulation,
    getSimulationLevelFromPath,
    isAssessmentPath,
    getMaxPurchaseRank,
    userMeetsTierForLevel,
    getModuleLevel,
    levelRank,
    meetsRequiredLevel
};
