import { MODEL_INPUT_MODE } from './constants.js';

/** model.json düzeltildiğinde önbelleği kırmak için artırın. */
const MODEL_ASSET_VERSION = '3';
const MODEL_JSON_URL = `/models/career-interest/model.json?v=${MODEL_ASSET_VERSION}`;
const WEIGHTS_BASE = `/models/career-interest`;

let loadPromise = null;

/**
 * Keras 3 → TF.js: ayrı InputLayer (batch_shape) tarayıcıda hata verir.
 * @param {object} artifact
 */
function patchCareerModelArtifact(artifact) {
  const topology = artifact.modelTopology;
  const modelConfig = topology?.model_config?.config;
  if (!modelConfig?.layers?.length) return artifact;

  const layers = modelConfig.layers;
  const first = layers[0];

  if (first?.class_name === 'InputLayer') {
    const shape =
      first.config?.batch_shape ||
      first.config?.batchInputShape ||
      first.config?.inputShape ||
      modelConfig.build_input_shape;
    const inputDim = Array.isArray(shape) ? shape[shape.length - 1] : 48;
    layers.shift();

    const dense = layers[0];
    if (dense?.class_name === 'Dense') {
      dense.config.inputShape = [inputDim];
      if (dense.config.dtype && typeof dense.config.dtype === 'object') {
        dense.config.dtype = dense.config.dtype?.config?.name || 'float32';
      }
    }
    modelConfig.build_input_shape = [null, inputDim];
  }

  modelConfig.dtype =
    typeof modelConfig.dtype === 'object' ? modelConfig.dtype?.config?.name || 'float32' : modelConfig.dtype || 'float32';

  for (const layer of layers) {
    if (layer.config?.dtype && typeof layer.config.dtype === 'object') {
      layer.config.dtype = layer.config.dtype?.config?.name || 'float32';
    }
  }

  return artifact;
}

/**
 * @returns {import('@tensorflow/tfjs').io.IOHandler}
 */
function createModelIOHandler() {
  return {
    load: async () => {
      const res = await fetch(MODEL_JSON_URL);
      if (!res.ok) throw new Error(`Model yüklenemedi (${res.status})`);
      const artifact = patchCareerModelArtifact(await res.json());

      const weightSpecs = [];
      const weightData = [];

      for (const group of artifact.weightsManifest || []) {
        for (const spec of group.weights || []) {
          const name = spec.name?.startsWith('sequential/')
            ? spec.name.replace(/^sequential\//, '')
            : spec.name;
          weightSpecs.push({ ...spec, name });
        }
        for (const path of group.paths || []) {
          const wRes = await fetch(`${WEIGHTS_BASE}/${path}?v=${MODEL_ASSET_VERSION}`);
          if (!wRes.ok) throw new Error(`Ağırlık dosyası yüklenemedi: ${path}`);
          weightData.push(await wRes.arrayBuffer());
        }
      }

      return {
        modelTopology: artifact.modelTopology,
        format: artifact.format,
        generatedBy: artifact.generatedBy,
        convertedBy: artifact.convertedBy,
        weightSpecs,
        weightData,
      };
    },
  };
}

/**
 * @param {typeof import('@tensorflow/tfjs')} tf
 */
export function loadCareerInterestModel(tf) {
  if (!tf || !tf.loadLayersModel) {
    return Promise.reject(new Error('TensorFlow.js yüklenemedi.'));
  }
  if (!loadPromise) {
    loadPromise = tf.loadLayersModel(createModelIOHandler()).catch((err) => {
      loadPromise = null;
      throw err;
    });
  }
  return loadPromise;
}

export function resetCareerInterestModelCache() {
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
