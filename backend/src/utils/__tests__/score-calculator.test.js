// Test Score Calculator
import { calculateWeightedScore } from '../score-calculator.js';

console.log('🧪 Testing Score Calculator...\n');

// Test 1: Basic score calculation
console.log('Test 1: Basic score calculation with sample data');

const userData = {
  id: 'test-user',
  firstName: 'Test',
  lastName: 'User'
};

// Sample quiz results
const quizResults = [
  { score: 85, moduleId: 'module-1', quizId: 'quiz-1' },
  { score: 90, moduleId: 'module-1', quizId: 'quiz-2' },
  { score: 75, moduleId: 'module-2', quizId: 'quiz-3' },
  { score: 80, moduleId: 'module-3', quizId: 'quiz-4' }
];

// Sample simulation results
const simulationResults = [
  { score: 88, simulationId: 'sim-1', simulationName: 'Network Security' },
  { score: 82, simulationId: 'sim-2', simulationName: 'Web App Security' },
  { score: 90, simulationId: 'sim-3', simulationName: 'Linux Basics' }
];

// Sample time spent (in minutes per topic)
const timeSpent = {
  1: 45,  // Network Fundamentals - optimal time
  2: 35,  // Protocols - good time
  3: 60,  // OS Fundamentals - optimal
  4: 25,  // Linux - too fast
  5: 70,  // Log Concepts - a bit slow
  6: 50,  // Log Analysis - optimal
  7: 55,  // Security Concepts - good
  8: 40,  // Web App - good
  9: 65,  // Anomaly Awareness - a bit slow
  10: 30  // Learning Adaptability - good
};

try {
  const result = calculateWeightedScore(userData, quizResults, simulationResults, timeSpent);
  
  console.log('✅ Score calculation completed\n');
  console.log('Results:');
  console.log(`  Overall Score: ${(result.overallScore * 100).toFixed(2)}%`);
  console.log(`\n  Topic Breakdown:`);
  
  const topics = Object.values(result.topicBreakdown);
  topics.forEach(topic => {
    console.log(`    ${topic.topicName}:`);
    console.log(`      Quiz: ${topic.quizScore}%`);
    console.log(`      Simulation: ${topic.simulationScore}%`);
    console.log(`      Time: ${topic.timeScore}%`);
    console.log(`      Combined: ${topic.combinedScore}%`);
    console.log(`      Weight: ${topic.weight}%`);
    console.log(`      Weighted Score: ${topic.weightedScore.toFixed(2)}%`);
  });
  
  console.log(`\n  Summary:`);
  console.log(`    Overall: ${result.summary.overallScore}%`);
  console.log(`    Strong Topics: ${result.summary.strongTopics.length}`);
  console.log(`    Weak Topics: ${result.summary.weakTopics.length}`);
  console.log(`    Average Topic Score: ${result.summary.averageTopicScore}%`);
  
  // Validation
  if (result.overallScore >= 0 && result.overallScore <= 1) {
    console.log('\n  ✅ Overall score is in valid range (0-1)');
  } else {
    console.log('\n  ❌ Overall score is out of range!');
  }
  
  if (result.summary.strongTopics.length + result.summary.weakTopics.length <= 10) {
    console.log('  ✅ Topic categorization is valid');
  } else {
    console.log('  ❌ Topic categorization error!');
  }
  
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
  console.error(error);
}

console.log('\n');

// Test 2: Empty data
console.log('Test 2: Empty data handling');
try {
  const emptyResult = calculateWeightedScore(userData, [], [], {});
  console.log(`✅ Empty data handled: Overall score = ${(emptyResult.overallScore * 100).toFixed(2)}%`);
} catch (error) {
  console.log(`❌ Error with empty data: ${error.message}`);
}

console.log('\n✅ All score calculator tests completed!\n');
