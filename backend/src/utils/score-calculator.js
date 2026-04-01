// Score Calculator
// Calculates weighted scores based on quiz results, simulation scores, and time spent
// Uses expert weights from CSV data for weighted averaging

import { loadExpertWeights, getTopicKey, getTopicName } from './expert-weights-parser.js';
import { getTopicsForQuiz, getTopicsForSimulation } from './topic-mapper.js';

// Cache expert weights (now handled in expert-weights-parser.js)
// This function just calls loadExpertWeights which has its own caching

/**
 * Get expert weights (cached)
 */
function getExpertWeights() {
  // loadExpertWeights now has internal caching
  return loadExpertWeights();
}

/**
 * Calculate weighted score for a user
 * @param {Object} userData - User progress data
 * @param {Array} quizResults - Quiz results array
 * @param {Array} simulationResults - Simulation results array
 * @param {Object} timeSpent - Time spent per module/topic
 * @returns {Object} Calculated scores and breakdown
 */
export function calculateWeightedScore(userData, quizResults = [], simulationResults = [], timeSpent = {}) {
  const expertWeights = getExpertWeights();
  
  // 1. Collect raw scores by topic
  const topicScores = initializeTopicScores();
  
  // 2. Process quiz results
  processQuizScores(quizResults, topicScores);
  
  // 3. Process simulation results
  processSimulationScores(simulationResults, topicScores);
  
  // 4. Process time spent (efficiency score)
  processTimeScores(timeSpent, topicScores);
  
  // 5. Calculate individual topic scores (this also calculates combinedScore)
  const topicBreakdown = calculateTopicBreakdown(topicScores, expertWeights);
  
  // 6. Calculate weighted average (after combinedScore is calculated)
  const weightedScore = calculateWeightedAverage(topicScores, expertWeights);
  
  return {
    overallScore: weightedScore,
    topicBreakdown: topicBreakdown,
    rawScores: topicScores,
    expertWeights: expertWeights,
    summary: generateScoreSummary(weightedScore, topicBreakdown)
  };
}

/**
 * Initialize topic scores structure
 */
function initializeTopicScores() {
  const scores = {};
  for (let i = 1; i <= 10; i++) {
    scores[i] = {
      quizScores: [],
      simulationScores: [],
      timeScore: null,
      averageQuizScore: 0,
      averageSimulationScore: 0,
      combinedScore: 0
    };
  }
  return scores;
}

/**
 * Process quiz results and map to topics
 * Note: This is a simplified mapping - in real implementation,
 * you'd need to map quiz questions to specific topics
 */
function processQuizScores(quizResults, topicScores) {
  for (const quiz of quizResults) {
    const score = normalizeScore(quiz.score || 0);
    
    // Map quiz to topics based on module/category
    // For now, distribute evenly across all topics if no specific mapping
    // TODO: Implement proper topic mapping based on quiz content
    
    const topics = mapQuizToTopics(quiz);
    
    for (const topicId of topics) {
      if (topicScores[topicId]) {
        topicScores[topicId].quizScores.push(score);
      }
    }
  }
  
  // Calculate average quiz scores per topic
  for (let i = 1; i <= 10; i++) {
    const scores = topicScores[i].quizScores;
    if (scores.length > 0) {
      topicScores[i].averageQuizScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    }
  }
}

/**
 * Process simulation results
 */
function processSimulationScores(simulationResults, topicScores) {
  for (const sim of simulationResults) {
    const score = normalizeScore(sim.score || 0);
    
    // Map simulation to topics
    const topics = mapSimulationToTopics(sim);
    
    for (const topicId of topics) {
      if (topicScores[topicId]) {
        topicScores[topicId].simulationScores.push(score);
      }
    }
  }
  
  // Calculate average simulation scores per topic
  for (let i = 1; i <= 10; i++) {
    const scores = topicScores[i].simulationScores;
    if (scores.length > 0) {
      topicScores[i].averageSimulationScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    }
  }
}

/**
 * Process time spent scores (efficiency)
 * Lower time with good scores = higher efficiency score
 */
function processTimeScores(timeSpent, topicScores) {
  // Time score is based on efficiency:
  // - If user completed quickly with good scores = high efficiency
  // - If user took too long = lower efficiency
  // This is a relative measure
  
  // For now, we'll use a simple heuristic:
  // If time is reasonable (not too fast, not too slow), give good score
  // TODO: Implement more sophisticated time-based scoring
  
  for (let i = 1; i <= 10; i++) {
    const topicTime = timeSpent[i] || 0;
    
    // Normalize time score (0-1)
    // Assume optimal time is 30-60 minutes per topic
    if (topicTime === 0) {
      topicScores[i].timeScore = 0.5; // Neutral if no time data
    } else if (topicTime >= 30 && topicTime <= 60) {
      topicScores[i].timeScore = 1.0; // Optimal time
    } else if (topicTime < 30) {
      topicScores[i].timeScore = Math.max(0.5, topicTime / 30); // Too fast might mean rushed
    } else {
      topicScores[i].timeScore = Math.max(0.3, 1 - (topicTime - 60) / 120); // Too slow
    }
  }
}

/**
 * Calculate combined score for each topic
 * Combines quiz, simulation, and time scores
 */
function calculateTopicBreakdown(topicScores, expertWeights) {
  const breakdown = {};
  
  for (let i = 1; i <= 10; i++) {
    const topic = topicScores[i];
    
    // Weighted combination: 50% quiz, 40% simulation, 10% time efficiency
    const quizWeight = 0.5;
    const simWeight = 0.4;
    const timeWeight = 0.1;
    
    const combinedScore = 
      (topic.averageQuizScore * quizWeight) +
      (topic.averageSimulationScore * simWeight) +
      ((topic.timeScore || 0.5) * timeWeight);
    
    topic.combinedScore = combinedScore;
    
    breakdown[i] = {
      topicId: i,
      topicKey: getTopicKey(i),
      topicName: getTopicName(i),
      quizScore: Math.round(topic.averageQuizScore * 100),
      simulationScore: Math.round(topic.averageSimulationScore * 100),
      timeScore: Math.round((topic.timeScore || 0.5) * 100),
      combinedScore: Math.round(combinedScore * 100),
      weight: Math.round(expertWeights[i] * 100),
      weightedScore: Math.round(combinedScore * expertWeights[i] * 100)
    };
  }
  
  return breakdown;
}

/**
 * Calculate weighted average using expert weights
 */
function calculateWeightedAverage(topicScores, expertWeights) {
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  for (let i = 1; i <= 10; i++) {
    const topic = topicScores[i];
    const weight = expertWeights[i] || 0;
    
    // combinedScore is 0-1 range, normalize to percentage for calculation
    const scoreValue = topic.combinedScore; // Already 0-1
    
    if (weight > 0 && scoreValue >= 0) {
      totalWeightedScore += scoreValue * weight;
      totalWeight += weight;
    }
  }
  
  // Normalize by total weight
  const weightedAverage = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  
  return weightedAverage; // Return as 0-1 value
}

/**
 * Normalize score to 0-1 range
 */
function normalizeScore(score) {
  if (typeof score !== 'number') return 0;
  // Assume score is 0-100, normalize to 0-1
  return Math.max(0, Math.min(1, score / 100));
}

/**
 * Map quiz to topics
 * Uses topic-mapper for proper mapping
 */
function mapQuizToTopics(quiz) {
  const quizId = quiz.quizId || quiz.id;
  const moduleId = quiz.moduleId || quiz.moduleId;
  
  return getTopicsForQuiz(quizId, moduleId);
}

/**
 * Map simulation to topics
 * Uses topic-mapper for proper mapping
 */
function mapSimulationToTopics(simulation) {
  const simulationId = simulation.simulationId || simulation.id;
  
  return getTopicsForSimulation(simulationId);
}

/**
 * Generate score summary
 */
function generateScoreSummary(overallScore, topicBreakdown) {
  const topics = Object.values(topicBreakdown);
  const strongTopics = topics.filter(t => t.combinedScore >= 80);
  const weakTopics = topics.filter(t => t.combinedScore < 60);
  
  return {
    overallScore: Math.round(overallScore * 100),
    strongTopics: strongTopics.map(t => ({
      name: t.topicName,
      score: t.combinedScore
    })),
    weakTopics: weakTopics.map(t => ({
      name: t.topicName,
      score: t.combinedScore
    })),
    topicCount: topics.length,
    averageTopicScore: Math.round(
      topics.reduce((sum, t) => sum + t.combinedScore, 0) / topics.length
    )
  };
}
