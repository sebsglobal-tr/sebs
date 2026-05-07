
const TOPIC_MAPPINGS = {
  modules: {
  },
  
  quizzes: {
  },
  
  simulations: {
  }
};

const DEFAULT_TOPICS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function getTopicsForModule(moduleId) {
  if (TOPIC_MAPPINGS.modules[moduleId]) {
    return TOPIC_MAPPINGS.modules[moduleId];
  }
  
  return DEFAULT_TOPICS;
}

export function getTopicsForQuiz(quizId, moduleId = null) {
  if (TOPIC_MAPPINGS.quizzes[quizId]) {
    return TOPIC_MAPPINGS.quizzes[quizId];
  }
  
  if (moduleId) {
    return getTopicsForModule(moduleId);
  }
  
  return DEFAULT_TOPICS;
}

export function getTopicsForSimulation(simulationId) {
  if (TOPIC_MAPPINGS.simulations[simulationId]) {
    return TOPIC_MAPPINGS.simulations[simulationId];
  }
  
  return DEFAULT_TOPICS;
}

export function addModuleMapping(moduleId, topics) {
  if (!Array.isArray(topics) || topics.length === 0) {
    throw new Error('Topics must be a non-empty array');
  }
  
  const validTopics = topics.filter(t => t >= 1 && t <= 10);
  if (validTopics.length === 0) {
    throw new Error('At least one valid topic ID (1-10) required');
  }
  
  TOPIC_MAPPINGS.modules[moduleId] = validTopics;
}

export function addQuizMapping(quizId, topics) {
  if (!Array.isArray(topics) || topics.length === 0) {
    throw new Error('Topics must be a non-empty array');
  }
  
  const validTopics = topics.filter(t => t >= 1 && t <= 10);
  if (validTopics.length === 0) {
    throw new Error('At least one valid topic ID (1-10) required');
  }
  
  TOPIC_MAPPINGS.quizzes[quizId] = validTopics;
}

export function addSimulationMapping(simulationId, topics) {
  if (!Array.isArray(topics) || topics.length === 0) {
    throw new Error('Topics must be a non-empty array');
  }
  
  const validTopics = topics.filter(t => t >= 1 && t <= 10);
  if (validTopics.length === 0) {
    throw new Error('At least one valid topic ID (1-10) required');
  }
  
  TOPIC_MAPPINGS.simulations[simulationId] = validTopics;
}

export function getAllMappings() {
  return {
    modules: TOPIC_MAPPINGS.modules,
    quizzes: TOPIC_MAPPINGS.quizzes,
    simulations: TOPIC_MAPPINGS.simulations
  };
}

export async function loadMappingsFromDatabase() {
  return {};
}

export async function saveMappingsToDatabase() {
  console.log('💾 Mappings would be saved to database');
}
