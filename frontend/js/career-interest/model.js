import { MODEL_INPUT_MODE } from './constants.js';

const MODEL_ASSET_VERSION = '4';
const WEIGHTS_BASE = `/models/career-interest`;

/** @type {import('@tensorflow/tfjs').LayersModel|null} */
let cachedModel = null;
let loadPromise = null;

const WEIGHT_MANIFEST = [
  {
    paths: ['group1-shard1of1.bin'],
    weights: [
      { name: 'dense/kernel', shape: [48, 64], dtype: 'float32' },
      { name: 'dense/bias', shape: [64], dtype: 'float32' },
      { name: 'dense_1/kernel', shape: [64, 32], dtype: 'float32' },
      { name: 'dense_1/bias', shape: [32], dtype: 'float32' },
      { name: 'dense_2/kernel', shape: [32, 9], dtype: 'float32' },
      { name: 'dense_2/bias', shape: [9], dtype: 'float32' },
    ],
  },
];

/**
 * model.json / InputLayer kullanmadan mimariyi kodda kurar (Keras 3 uyumsuzluğu yok).
 * @param {typeof import('@tensorflow/tfjs')} tf
 */
function buildCareerInterestArchitecture(tf) {
  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      units: 64,
      activation: 'relu',
      inputShape: [48],
      name: 'dense',
    })
  );
  model.add(tf.layers.dropout({ rate: 0.2, name: 'dropout' }));
  model.add(tf.layers.dense({ units: 32, activation: 'relu', name: 'dense_1' }));
  model.add(tf.layers.dense({ units: 9, activation: 'softmax', name: 'dense_2' }));
  return model;
}

/**
 * @param {typeof import('@tensorflow/tfjs')} tf
 */
async function loadWeightTensors(tf) {
  const fetchWeights = (filePaths) =>
    Promise.all(
      filePaths.map((path) =>
        fetch(`${WEIGHTS_BASE}/${path}?v=${MODEL_ASSET_VERSION}`).then((res) => {
          if (!res.ok) throw new Error(`Ağırlık dosyası yüklenemedi: ${path}`);
          return res.arrayBuffer();
        })
      )
    );

  const loadWeights = tf.io.weightsLoaderFactory(fetchWeights);
  return loadWeights(WEIGHT_MANIFEST, '');
}

/**
 * @param {typeof import('@tensorflow/tfjs')} tf
 */
export async function loadCareerInterestModel(tf) {
  if (!tf?.sequential) {
    throw new Error('TensorFlow.js yüklenemedi.');
  }
  if (cachedModel) return cachedModel;

  if (!loadPromise) {
    loadPromise = (async () => {
      const named = await loadWeightTensors(tf);
      const model = buildCareerInterestArchitecture(tf);
      model.setWeights([
        named['dense/kernel'],
        named['dense/bias'],
        named['dense_1/kernel'],
        named['dense_1/bias'],
        named['dense_2/kernel'],
        named['dense_2/bias'],
      ]);
      cachedModel = model;
      return model;
    })().catch((err) => {
      loadPromise = null;
      throw err;
    });
  }

  return loadPromise;
}

export function resetCareerInterestModelCache() {
  if (cachedModel) {
    cachedModel.dispose();
    cachedModel = null;
  }
  loadPromise = null;
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
