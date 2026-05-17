import { MODEL_INPUT_MODE } from './constants.js';

const MODEL_ASSET_VERSION = '1';
const MODEL_URL = `/models/career-interest/model.json?v=${MODEL_ASSET_VERSION}`;

let loadPromise = null;

/**
 * @param {typeof import('@tensorflow/tfjs')} tf
 */
export function loadCareerInterestModel(tf) {
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

/**
 * @param {typeof import('@tensorflow/tfjs')} tf
 * @param {number[]} answers48
 * @returns {Promise<number[]>}
 */
export async function predictCareerInterestSoftmax(tf, answers48) {
  const model = await loadCareerInterestModel(tf);
  const vec = answers48.map((a) =>
    MODEL_INPUT_MODE === 'normalized_0_1' ? (a - 1) / 4 : a
  );

  const input = tf.tensor2d([vec], [1, 48], 'float32');
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
