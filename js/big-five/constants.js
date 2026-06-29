/** @typedef {'raw_1_5' | 'normalized_0_1'} ModelInputMode */

/** Model eğitiminde kullanılan girdi biçimi (buradan değiştirin).
 * `raw_1_5`: doğrudan 1–5. Bazı ağlarda doyum nedeniyle çıktı az değişir.
 * `normalized_0_1`: (cevap−1)/4 ile [0,1] — eğitim bu ölçekteyse daha duyarlıdır. */
export const MODEL_INPUT_MODE = /** @type {ModelInputMode} */ ('normalized_0_1');

/** Klasik puan ve rapor sırası (model softmax ile aynı). */
export const DIMENSION_ORDER = /** @type {const} */ ([
  'openness',
  'conscientiousness',
  'extraversion',
  'agreeableness',
  'emotional_sensitivity',
]);

export const DIMENSION_LABELS = {
  openness: 'Açıklık / Yeniliğe Açıklık',
  conscientiousness: 'Planlılık / Sorumluluk',
  extraversion: 'Dışadönüklük',
  agreeableness: 'Uyumluluk / İşbirliği',
  emotional_sensitivity: 'Duygusal Hassasiyet',
};

export const LIKERT_OPTIONS = [
  { value: 1, label: 'Kesinlikle katılmıyorum' },
  { value: 2, label: 'Katılmıyorum' },
  { value: 3, label: 'Kararsızım' },
  { value: 4, label: 'Katılıyorum' },
  { value: 5, label: 'Kesinlikle katılıyorum' },
];
