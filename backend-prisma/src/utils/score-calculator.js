
import { loadExpertWeights, getTopicKey, getTopicName } from './expert-weights-parser.js';
import { getTopicsForQuiz, getTopicsForSimulation } from './topic-mapper.js';


function getExpertWeights() {
  return loadExpertWeights();
}

export function calculateWeightedScore(userData, quizResults = [], simulationResults = [], timeSpent = {}) {
  const expertWeights = getExpertWeights();
  
  const topicScores = initializeTopicScores();
  
  processQuizScores(quizResults, topicScores);
  
  processSimulationScores(simulationResults, topicScores);
  
  processTimeScores(timeSpent, topicScores);
  
  const topicBreakdown = calculateTopicBreakdown(topicScores, expertWeights);
  
  const weightedScore = calculateWeightedAverage(topicScores, expertWeights);
  
  return {
    overallScore: weightedScore,
    topicBreakdown: topicBreakdown,
    rawScores: topicScores,
    expertWeights: expertWeights,
    summary: generateScoreSummary(weightedScore, topicBreakdown)
  };
}

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

function processQuizScores(quizResults, topicScores) {
  for (const quiz of quizResults) {
    const score = normalizeScore(quiz.score || 0);
    
    
    const topics = mapQuizToTopics(quiz);
    
    for (const topicId of topics) {
      if (topicScores[topicId]) {
        topicScores[topicId].quizScores.push(score);
      }
    }
  }
  
  for (let i = 1; i <= 10; i++) {
    const scores = topicScores[i].quizScores;
    if (scores.length > 0) {
      topicScores[i].averageQuizScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    }
  }
}

function processSimulationScores(simulationResults, topicScores) {
  for (const sim of simulationResults) {
    const score = normalizeScore(sim.score || 0);
    
    const topics = mapSimulationToTopics(sim);
    
    for (const topicId of topics) {
      if (topicScores[topicId]) {
        topicScores[topicId].simulationScores.push(score);
      }
    }
  }
  
  for (let i = 1; i <= 10; i++) {
    const scores = topicScores[i].simulationScores;
    if (scores.length > 0) {
      topicScores[i].averageSimulationScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    }
  }
}

function processTimeScores(timeSpent, topicScores) {
  
  
  for (let i = 1; i <= 10; i++) {
    const topicTime = timeSpent[i] || 0;
    
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

function calculateTopicBreakdown(topicScores, expertWeights) {
  const breakdown = {};
  
  for (let i = 1; i <= 10; i++) {
    const topic = topicScores[i];
    
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

function calculateWeightedAverage(topicScores, expertWeights) {
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  for (let i = 1; i <= 10; i++) {
    const topic = topicScores[i];
    const weight = expertWeights[i] || 0;
    
    const scoreValue = topic.combinedScore; // Already 0-1
    
    if (weight > 0 && scoreValue >= 0) {
      totalWeightedScore += scoreValue * weight;
      totalWeight += weight;
    }
  }
  
  const weightedAverage = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  
  return weightedAverage; // Return as 0-1 value
}

function normalizeScore(score) {
  if (typeof score !== 'number') return 0;
  return Math.max(0, Math.min(1, score / 100));
}

function mapQuizToTopics(quiz) {
  const quizId = quiz.quizId || quiz.id;
  const moduleId = quiz.moduleId || quiz.moduleId;
  
  return getTopicsForQuiz(quizId, moduleId);
}

function mapSimulationToTopics(simulation) {
  const simulationId = simulation.simulationId || simulation.id;
  
  return getTopicsForSimulation(simulationId);
}

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
