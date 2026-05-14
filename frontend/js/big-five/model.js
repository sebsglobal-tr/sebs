import { MODEL_INPUT_MODE } from './constants.js';

/** Yeni model.json deploy edildiğinde tarayıcı/CDN önbelleğini kırmak için artırın. */
const MODEL_ASSET_VERSION = 'wfix-1';
const MODEL_URL = `/models/big-five/model.json?v=${MODEL_ASSET_VERSION}`;

let loadPromise = null;

/**
 * @param {typeof import('@tensorflow/tfjs')} tf
 */
export function loadBigFiveModel(tf) {
  if (!tf || !tf.loadLayersModel) {
    return Promise.reject(new Error('TensorFlow.js yüklenemedi.'));
  }
  if (!loadPromise) {
    loadPromise = tf.loadLayersModel(MODEL_URL).catch((err) => {
      loadPromise = null;
      throw err;
    });
  }
  return loadPromise;
}

export function resetBigFiveModelCache() {
  loadPromise = null;
}

/**
 * @param {typeof import('@tensorflow/tfjs')} tf
 * @param {number[]} answers50
 * @returns {Promise<number[]>}
 */
export async function predictBigFiveSoftmax(tf, answers50) {
  const model = await loadBigFiveModel(tf);
  const vec = answers50.map((a) =>
    MODEL_INPUT_MODE === 'normalized_0_1' ? (a - 1) / 4 : a
  );

  const input = tf.tensor2d([vec], [1, 50], 'float32');
  let pred = null;
  try {
    pred = model.predict(input);
    const data = await pred.data();
    return Array.from(data);
  } finally {
    if (pred) pred.dispose();
    input.dispose();
  }
}
