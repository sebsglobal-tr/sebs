// Expert Weights Parser
// Parses CSV data from cybersecurity experts and calculates normalized weights
// Based on expert opinions on importance of different cybersecurity topics

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache expert weights
let cachedWeights = null;
let cacheTimestamp = null;
const CACHE_TTL = 3600000; // 1 saat (milisaniye)

// Topic names mapping (from CSV columns)
export const TOPIC_NAMES = {
  1: 'Network Fundamentals',
  2: 'Protocols (TCP/IP, DNS, HTTP/HTTPS)',
  3: 'Operating System Fundamentals',
  4: 'Linux Environment',
  5: 'Log Concepts',
  6: 'Log Analysis',
  7: 'Basic Security Concepts',
  8: 'Web Application Fundamentals',
  9: 'Anomaly Awareness',
  10: 'Learning Adaptability'
};

// Topic keys for internal use
export const TOPIC_KEYS = {
  1: 'network_fundamentals',
  2: 'protocols',
  3: 'os_fundamentals',
  4: 'linux_environment',
  5: 'log_concepts',
  6: 'log_analysis',
  7: 'security_concepts',
  8: 'web_app_fundamentals',
  9: 'anomaly_awareness',
  10: 'learning_adaptability'
};

/**
 * Parse CSV file and extract expert opinions
 * @param {string} csvPath - Path to CSV file
 * @returns {Array} Array of expert responses
 */
export function parseExpertCSV(csvPath) {
  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Skip header (first line)
    const dataLines = lines.slice(1);
    
    const experts = [];
    
    for (const line of dataLines) {
      if (!line.trim()) continue;
      
      // Parse CSV line (handling quoted values)
      const values = parseCSVLine(line);
      
      if (values.length < 17) continue; // Skip incomplete rows
      
      const expert = {
        timestamp: values[0] || '',
        name: values[1] || '',
        expertiseType: values[2] || '',
        expertiseArea: values[3] || '',
        role: values[4] || '',
        experience: values[5] || '',
        workArea: values[6] || '',
        // Topic scores (columns 7-16, indices 7-16)
        scores: {}
      };
      
      // Extract scores for 10 topics
      for (let i = 1; i <= 10; i++) {
        const scoreValue = values[6 + i] || ''; // Column index 7-16
        expert.scores[i] = normalizeScore(scoreValue);
      }
      
      experts.push(expert);
    }
    
    return experts;
  } catch (error) {
    console.error('❌ Error parsing CSV:', error.message);
    return [];
  }
}

/**
 * Parse a CSV line handling quoted values
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim()); // Add last value
  
  return values;
}

/**
 * Normalize score value to 0-1 range
 * Handles various formats: numbers, percentages, text descriptions
 */
export function normalizeScore(value) {
  if (!value || typeof value !== 'string') return null;
  
  const trimmed = value.trim();
  
  // Handle numeric values (0-20 scale)
  const numericMatch = trimmed.match(/^(\d+)$/);
  if (numericMatch) {
    const num = parseInt(numericMatch[1], 10);
    // Normalize 0-20 scale to 0-1
    return Math.min(1, num / 20);
  }
  
  // Handle percentage values (%15, %100, etc.)
  const percentMatch = trimmed.match(/%(\d+)/);
  if (percentMatch) {
    const percent = parseInt(percentMatch[1], 10);
    return Math.min(1, percent / 100);
  }
  
  // Handle text descriptions
  const lower = trimmed.toLowerCase();
  if (lower.includes('çok önemli') || lower.includes('critical') || lower.includes('kritik')) {
    return 1.0;
  }
  if (lower.includes('önemli') || lower.includes('important')) {
    return 0.75;
  }
  if (lower.includes('orta') || lower.includes('moderate')) {
    return 0.5;
  }
  if (lower.includes('az') || lower.includes('low')) {
    return 0.25;
  }
  
  // Default: return null if can't parse
  return null;
}

/**
 * Calculate weighted average scores from all experts
 * Returns normalized weights (0-1) for each topic
 */
export function calculateExpertWeights(experts) {
  const topicScores = {};
  
  // Initialize topic scores
  for (let i = 1; i <= 10; i++) {
    topicScores[i] = [];
  }
  
  // Collect all valid scores for each topic
  for (const expert of experts) {
    for (let i = 1; i <= 10; i++) {
      const score = expert.scores[i];
      if (score !== null && score !== undefined) {
        topicScores[i].push(score);
      }
    }
  }
  
  // Calculate average for each topic
  const weights = {};
  for (let i = 1; i <= 10; i++) {
    const scores = topicScores[i];
    if (scores.length > 0) {
      const sum = scores.reduce((a, b) => a + b, 0);
      weights[i] = sum / scores.length;
    } else {
      weights[i] = 0.1; // Default weight if no data
    }
  }
  
  // Normalize weights so they sum to 1 (proportional weights)
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  if (totalWeight > 0) {
    for (let i = 1; i <= 10; i++) {
      weights[i] = weights[i] / totalWeight;
    }
  }
  
  return weights;
}

/**
 * Load expert weights from CSV file
 * @param {string} csvPath - Path to CSV file (default: project root)
 * @returns {Object} Normalized weights for each topic
 */
export function loadExpertWeights(csvPath = null) {
  // Check cache first
  if (cachedWeights && cacheTimestamp && 
      (Date.now() - cacheTimestamp) < CACHE_TTL) {
    return cachedWeights;
  }
  
  // Default path: backend/expert-survey.csv
  const defaultPath = path.join(__dirname, '../expert-survey.csv');
  const filePath = csvPath || defaultPath;
  
  // Try multiple possible locations
  const possiblePaths = [
    filePath,
    path.join(__dirname, '../../../Başlıksız form.csv'),
    path.join(__dirname, '../../../../Başlıksız form.csv'),
    path.join(__dirname, '../../../../../Başlıksız form.csv'),
    '/Users/apple/Downloads/Başlıksız form.csv'
  ];
  
  let experts = [];
  for (const tryPath of possiblePaths) {
    try {
      if (fs.existsSync(tryPath)) {
        console.log(`📊 Loading expert weights from: ${tryPath}`);
        experts = parseExpertCSV(tryPath);
        if (experts.length > 0) {
          break;
        }
      }
    } catch (error) {
      // Try next path
      continue;
    }
  }
  
  if (experts.length === 0) {
    console.warn('⚠️ No expert data found, using default weights');
    return getDefaultWeights();
  }
  
  console.log(`✅ Loaded ${experts.length} expert opinions`);
  const weights = calculateExpertWeights(experts);
  
  // Cache the weights
  cachedWeights = weights;
  cacheTimestamp = Date.now();
  
  // Log weights for debugging
  console.log('📊 Expert Weights:');
  for (let i = 1; i <= 10; i++) {
    console.log(`  ${i}. ${TOPIC_NAMES[i]}: ${(weights[i] * 100).toFixed(2)}%`);
  }
  
  return weights;
}

/**
 * Get default weights if CSV is not available
 * Equal weights for all topics
 */
function getDefaultWeights() {
  const weights = {};
  const defaultWeight = 1 / 10; // Equal weight for 10 topics
  for (let i = 1; i <= 10; i++) {
    weights[i] = defaultWeight;
  }
  return weights;
}

/**
 * Get topic key by number
 */
export function getTopicKey(topicNumber) {
  return TOPIC_KEYS[topicNumber] || `topic_${topicNumber}`;
}

/**
 * Get topic name by number
 */
export function getTopicName(topicNumber) {
  return TOPIC_NAMES[topicNumber] || `Topic ${topicNumber}`;
}
