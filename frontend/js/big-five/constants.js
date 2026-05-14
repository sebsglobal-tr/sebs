/** @typedef {'raw_1_5' | 'normalized_0_1'} ModelInputMode */

/** Model eğitiminde kullanılan girdi biçimi (buradan değiştirin). */
export const MODEL_INPUT_MODE = /** @type {ModelInputMode} */ ('raw_1_5');

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
