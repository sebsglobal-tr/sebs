import { RIASEC_LABELS } from '../career-interest/constants.js';
import { DIMENSION_LABELS } from '../big-five/constants.js';

/**
 * @typedef {Object} CareerRec
 * @property {string} title
 * @property {string} description
 * @property {string} match
 * @property {string} href
 * @property {string} icon
 */

/**
 * @param {{ key: string, pct: number }[]} topRiasec
 * @param {{ key: string, pct: number }[]} topBf
 * @param {Record<string, { percentage: number }>} bfScores
 */
export function buildCareerRecommendations(topRiasec, topBf, bfScores) {
  /** @type {Map<string, CareerRec>} */
  const byTitle = new Map();

  const r = topRiasec[0]?.key;
  const r2 = topRiasec[1]?.key;
  const bf1 = topBf[0]?.key;
  const bf2 = topBf[1]?.key;
  const open = bfScores.openness?.percentage ?? 50;
  const consc = bfScores.conscientiousness?.percentage ?? 50;
  const extra = bfScores.extraversion?.percentage ?? 50;

  function add(rec) {
    if (!byTitle.has(rec.title)) byTitle.set(rec.title, rec);
  }

  const investigative = r === 'investigative' || r2 === 'investigative';
  const realistic = r === 'realistic' || r2 === 'realistic';
  const social = r === 'social' || r2 === 'social';
  const enterprising = r === 'enterprising' || r2 === 'enterprising';
  const conventional = r === 'conventional' || r2 === 'conventional';
  const artistic = r === 'artistic' || r2 === 'artistic';

  if (investigative || bf1 === 'openness' || open >= 58) {
    add({
      title: 'SOC Analisti',
      description:
        'Olay kayıtlarını analiz etme, tehdit avcılığı ve savunma operasyonları. Araştırmacı ilgi ve analitik öğrenme profiliyle uyumludur.',
      match: 'yüksek',
      href: '/egitimler/soc-analist',
      icon: 'fa-shield-halved',
    });
    add({
      title: 'Tehdit Avcılığı (Threat Hunting)',
      description: 'Proaktif tehdit arama, anomali analizi ve saldırı örüntüleri. Merak ve sistematik düşünme gerektirir.',
      match: investigative ? 'yüksek' : 'orta',
      href: '/egitimler/soc-analist',
      icon: 'fa-crosshairs',
    });
  }

  if (realistic || investigative || consc >= 55) {
    add({
      title: 'Sızma Testi Uzmanı (Penetration Tester)',
      description:
        'Kontrollü saldırı simülasyonları, zafiyet doğrulama ve raporlama. Uygulamalı teknik ilgi ve disiplinli çalışma ile örtüşür.',
      match: realistic && investigative ? 'yüksek' : 'orta',
      href: '/simulasyonlar/penetration-testing',
      icon: 'fa-user-secret',
    });
    add({
      title: 'Zararlı Yazılım Analisti',
      description: 'Örnek inceleme, tersine mühendislik ve davranış analizi. Derin teknik odak ve sabır gerektirir.',
      match: realistic ? 'yüksek' : 'orta',
      href: '/simulasyonlar/malware-analizi',
      icon: 'fa-bug',
    });
  }

  if (investigative || conventional || bf1 === 'conscientiousness') {
    add({
      title: 'Olay Müdahale (Incident Response)',
      description: 'Olay sürecini yönetme, kanıt toplama ve kök neden analizi. Prosedür ve analiz dengesi önemlidir.',
      match: 'orta',
      href: '/simulasyonlar/incident-response',
      icon: 'fa-bolt',
    });
  }

  if (enterprising || social || extra >= 58) {
    add({
      title: 'Güvenlik Danışmanı / CISO Yolu',
      description:
        'Risk iletişimi, politika ve ekip yönetimi. Girişimci veya sosyal ilgi ile dışadönük öğrenme profili destekler.',
      match: enterprising ? 'yüksek' : 'orta',
      href: '/fiyatlandirma',
      icon: 'fa-briefcase',
    });
  }

  if (investigative || realistic || open >= 50) {
    add({
      title: 'Web Uygulama Güvenliği Uzmanı',
      description: 'OWASP zafiyetleri, API güvenliği ve güvenli kod inceleme. Analitik ve uygulamalı ilgiyle uyumludur.',
      match: investigative ? 'yüksek' : 'orta',
      href: '/egitimler/web-uygulama-guvenligi',
      icon: 'fa-code',
    });
    add({
      title: 'Bulut Güvenliği (Cloud Security)',
      description: 'IAM, yapılandırma denetimi ve bulut olay yönetimi. Teknik merak ve düzenli öğrenme gerektirir.',
      match: 'orta',
      href: '/egitimler/cloud-security',
      icon: 'fa-cloud',
    });
  }

  if (social && !investigative) {
    add({
      title: 'Güvenlik Farkındalık ve Eğitim Uzmanı',
      description: 'Kurumsal eğitim, phishing simülasyonları ve iletişim. Sosyal ilgi ve uyumluluk profiliyle örtüşür.',
      match: 'yüksek',
      href: '/egitimler/siber-guvenlik',
      icon: 'fa-chalkboard-user',
    });
  }

  if (conventional || artistic) {
    add({
      title: 'GRC / Uyumluluk ve Politika',
      description: 'Standartlar, denetim hazırlığı ve dokümantasyon. Geleneksel ilgi ve planlı çalışma eğilimiyle uyumludur.',
      match: conventional ? 'yüksek' : 'orta',
      href: '/egitimler/siber-guvenlik',
      icon: 'fa-clipboard-check',
    });
  }

  if (byTitle.size === 0) {
    add({
      title: 'Siber Güvenliğe Giriş',
      description: 'Temel kavramlar ve geniş yol haritası ile başlamak için dengeli bir başlangıç noktası.',
      match: 'orta',
      href: '/egitimler/siber-guvenlik',
      icon: 'fa-compass',
    });
  }

  const rLabel = topRiasec[0] ? RIASEC_LABELS[topRiasec[0].key]?.split('—')[0].trim() : '—';
  const bfLabel = topBf[0] ? DIMENSION_LABELS[topBf[0].key] : '—';

  const narrative = `Meslek ilgi profilinde <strong>${rLabel}</strong> öne çıkıyor; öğrenme ve çalışma tarzında ise <strong>${bfLabel}</strong> belirgin. Aşağıdaki SEBS kariyer yolları bu iki profilin birleşimine göre sıralanmıştır — kesin bir iş garantisi veya tanı değildir; keşif ve planlama içindir.`;

  return {
    narrative,
    careers: Array.from(byTitle.values()).slice(0, 6),
    topRiasecLabel: rLabel,
    topBfLabel: bfLabel,
  };
}
