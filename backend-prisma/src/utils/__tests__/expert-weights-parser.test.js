// Test Expert Weights Parser
import { parseExpertCSV, calculateExpertWeights, loadExpertWeights, normalizeScore } from '../expert-weights-parser.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Expert Weights Parser...\n');

// Test 1: normalizeScore function
console.log('Test 1: normalizeScore function');
const testCases = [
  { input: '7', expected: 0.35 }, // 7/20 = 0.35
  { input: '20', expected: 1.0 }, // 20/20 = 1.0
  { input: '%15', expected: 0.15 }, // 15/100 = 0.15
  { input: '%100', expected: 1.0 }, // 100/100 = 1.0
  { input: 'Çok önemli', expected: 1.0 },
  { input: 'Önemli', expected: 0.75 },
  { input: 'SOC İÇİN ÇOK ÖNEMLİ', expected: 1.0 },
];

testCases.forEach(({ input, expected }) => {
  const result = normalizeScore(input);
  const passed = Math.abs(result - expected) < 0.01;
  console.log(`  ${passed ? '✅' : '❌'} "${input}" -> ${result} (expected: ${expected})`);
});

console.log('\n');

// Test 2: Load CSV file
console.log('Test 2: Load CSV file');
try {
  const weights = loadExpertWeights();
  console.log('✅ CSV loaded successfully');
  console.log('   Expert weights:');
  for (let i = 1; i <= 10; i++) {
    console.log(`   Topic ${i}: ${(weights[i] * 100).toFixed(2)}%`);
  }
  
  // Check if weights sum to ~1.0
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  console.log(`\n   Total weight: ${total.toFixed(4)} (should be ~1.0)`);
  if (Math.abs(total - 1.0) < 0.01) {
    console.log('   ✅ Weights normalized correctly');
  } else {
    console.log('   ⚠️ Weights may not be normalized');
  }
} catch (error) {
  console.log(`❌ Error loading CSV: ${error.message}`);
}

console.log('\n');

// Test 3: Parse CSV directly
console.log('Test 3: Parse CSV directly');
const csvPath = path.join(__dirname, '../../expert-survey.csv');
if (fs.existsSync(csvPath)) {
  try {
    const experts = parseExpertCSV(csvPath);
    console.log(`✅ Parsed ${experts.length} expert opinions`);
    
    if (experts.length > 0) {
      console.log('\n   Sample expert data:');
      const firstExpert = experts[0];
      console.log(`   - Role: ${firstExpert.role}`);
      console.log(`   - Experience: ${firstExpert.experience}`);
      console.log(`   - Topic scores: ${Object.keys(firstExpert.scores).length} topics`);
      
      // Show first 3 topic scores
      for (let i = 1; i <= 3; i++) {
        const score = firstExpert.scores[i];
        console.log(`     Topic ${i}: ${score !== null ? score.toFixed(2) : 'N/A'}`);
      }
    }
    
    // Calculate weights
    const weights = calculateExpertWeights(experts);
    console.log('\n   Calculated weights:');
    for (let i = 1; i <= 5; i++) {
      console.log(`   Topic ${i}: ${(weights[i] * 100).toFixed(2)}%`);
    }
  } catch (error) {
    console.log(`❌ Error parsing CSV: ${error.message}`);
  }
} else {
  console.log(`⚠️ CSV file not found at: ${csvPath}`);
  console.log('   Using default weights');
}

console.log('\n✅ All tests completed!\n');
