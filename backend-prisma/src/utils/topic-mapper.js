// Topic Mapper
// Maps modules, lessons, quizzes, and simulations to cybersecurity topics
// This will be populated as content is created

/**
 * Topic mapping configuration
 * Maps content IDs to topic IDs (1-10)
 */
const TOPIC_MAPPINGS = {
  // Module/Lesson mappings
  modules: {
    // Example: 'module-network-basics': [1, 2], // Network Fundamentals + Protocols
    // Will be populated as modules are created
  },
  
  // Quiz mappings
  quizzes: {
    // Example: 'quiz-tcp-ip': [2], // Protocols only
    // Will be populated as quizzes are created
  },
  
  // Simulation mappings
  simulations: {
    // Example: 'cafe-hack': [1, 2, 4, 6], // Network, Protocols, Linux, Log Analysis
    // Will be populated as simulations are created
  }
};

/**
 * Default topic mapping (used when no specific mapping exists)
 * Currently distributes equally across all topics
 */
const DEFAULT_TOPICS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Get topics for a module
 * @param {string} moduleId - Module ID
 * @returns {Array<number>} Array of topic IDs (1-10)
 */
export function getTopicsForModule(moduleId) {
  if (TOPIC_MAPPINGS.modules[moduleId]) {
    return TOPIC_MAPPINGS.modules[moduleId];
  }
  
  // Fallback: return all topics (temporary)
  return DEFAULT_TOPICS;
}

/**
 * Get topics for a quiz
 * @param {string} quizId - Quiz ID
 * @param {string} moduleId - Optional module ID for context
 * @returns {Array<number>} Array of topic IDs (1-10)
 */
export function getTopicsForQuiz(quizId, moduleId = null) {
  // Check specific quiz mapping
  if (TOPIC_MAPPINGS.quizzes[quizId]) {
    return TOPIC_MAPPINGS.quizzes[quizId];
  }
  
  // Fallback to module topics if moduleId provided
  if (moduleId) {
    return getTopicsForModule(moduleId);
  }
  
  // Final fallback: return all topics
  return DEFAULT_TOPICS;
}

/**
 * Get topics for a simulation
 * @param {string} simulationId - Simulation ID
 * @returns {Array<number>} Array of topic IDs (1-10)
 */
export function getTopicsForSimulation(simulationId) {
  if (TOPIC_MAPPINGS.simulations[simulationId]) {
    return TOPIC_MAPPINGS.simulations[simulationId];
  }
  
  // Fallback: return all topics (temporary)
  return DEFAULT_TOPICS;
}

/**
 * Add topic mapping for a module
 * @param {string} moduleId - Module ID
 * @param {Array<number>} topics - Array of topic IDs (1-10)
 */
export function addModuleMapping(moduleId, topics) {
  if (!Array.isArray(topics) || topics.length === 0) {
    throw new Error('Topics must be a non-empty array');
  }
  
  // Validate topic IDs
  const validTopics = topics.filter(t => t >= 1 && t <= 10);
  if (validTopics.length === 0) {
    throw new Error('At least one valid topic ID (1-10) required');
  }
  
  TOPIC_MAPPINGS.modules[moduleId] = validTopics;
}

/**
 * Add topic mapping for a quiz
 * @param {string} quizId - Quiz ID
 * @param {Array<number>} topics - Array of topic IDs (1-10)
 */
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

/**
 * Add topic mapping for a simulation
 * @param {string} simulationId - Simulation ID
 * @param {Array<number>} topics - Array of topic IDs (1-10)
 */
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

/**
 * Get all mappings (for admin/debugging)
 */
export function getAllMappings() {
  return {
    modules: TOPIC_MAPPINGS.modules,
    quizzes: TOPIC_MAPPINGS.quizzes,
    simulations: TOPIC_MAPPINGS.simulations
  };
}

/**
 * Load mappings from database or config file
 * TODO: Implement database persistence
 */
export async function loadMappingsFromDatabase() {
  // TODO: Load from database table or config file
  // For now, return empty (will use defaults)
  return {};
}

/**
 * Save mappings to database or config file
 * TODO: Implement database persistence
 */
export async function saveMappingsToDatabase() {
  // TODO: Save to database table or config file
  console.log('💾 Mappings would be saved to database');
}
