/** Holland / RIASEC — klasik skor sırası */
export const RIASEC_ORDER = /** @type {const} */ ([
  'realistic',
  'investigative',
  'artistic',
  'social',
  'enterprising',
  'conventional',
]);

export const RIASEC_LABELS = {
  realistic: 'Gerçekçi (R) — Uygulamalı, teknik, somut işler',
  investigative: 'Araştırmacı (I) — Bilimsel, analitik, problem çözme',
  artistic: 'Sanatsal (A) — Yaratıcı, özgün, ifade odaklı işler',
  social: 'Sosyal (S) — İnsanlara yardım, eğitim, destek',
  enterprising: 'Girişimci (E) — İkna, satış, yönetim, liderlik',
  conventional: 'Geleneksel (C) — Düzen, kayıt, prosedür, ofis işleri',
};

/** Sinir ağı çıktısı (9 sınıf) — eğitim etiketleri; olasılık dağılımı olarak sunulur */
export const MODEL_CLUSTER_LABELS = [
  { key: 'r', label: 'Gerçekçi (R)', tagline: 'Uygulamalı ve teknik faaliyetler' },
  { key: 'i', label: 'Araştırmacı (I)', tagline: 'Araştırma ve analiz' },
  { key: 'a', label: 'Sanatsal (A)', tagline: 'Yaratıcı üretim ve tasarım' },
  { key: 's', label: 'Sosyal (S)', tagline: 'İnsan odaklı hizmet ve eğitim' },
  { key: 'e', label: 'Girişimci (E)', tagline: 'Yönetim, satış ve girişim' },
  { key: 'c', label: 'Geleneksel (C)', tagline: 'Düzenli kayıt ve operasyon' },
  { key: 'ri', label: 'Teknik–Araştırma', tagline: 'Laboratuvar ve mühendislik kesişimi' },
  { key: 'se', label: 'Sosyal–Girişim', tagline: 'Ekip liderliği ve danışmanlık' },
  { key: 'ec', label: 'Operasyon–Yönetim', tagline: 'Süreç ve işletme yönetimi' },
];

export const MODEL_INPUT_MODE = /** @type {'normalized_0_1'} */ ('normalized_0_1');

export const LIKERT_OPTIONS = [
  { value: 1, label: 'Hoşlanmam' },
  { value: 2, label: 'Pek hoşlanmam' },
  { value: 3, label: 'Kararsızım' },
  { value: 4, label: 'Biraz hoşlanırım' },
  { value: 5, label: 'Hoşlanırım' },
];
