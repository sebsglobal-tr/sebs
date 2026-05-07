
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedWeights = null;
let cacheTimestamp = null;
const CACHE_TTL = 3600000; // 1 saat (milisaniye)

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

export function parseExpertCSV(csvPath) {
  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    const dataLines = lines.slice(1);
    
    const experts = [];
    
    for (const line of dataLines) {
      if (!line.trim()) continue;
      
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
        scores: {}
      };
      
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

export function normalizeScore(value) {
  if (!value || typeof value !== 'string') return null;
  
  const trimmed = value.trim();
  
  const numericMatch = trimmed.match(/^(\d+)$/);
  if (numericMatch) {
    const num = parseInt(numericMatch[1], 10);
    return Math.min(1, num / 20);
  }
  
  const percentMatch = trimmed.match(/%(\d+)/);
  if (percentMatch) {
    const percent = parseInt(percentMatch[1], 10);
    return Math.min(1, percent / 100);
  }
  
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
  
  return null;
}

export function calculateExpertWeights(experts) {
  const topicScores = {};
  
  for (let i = 1; i <= 10; i++) {
    topicScores[i] = [];
  }
  
  for (const expert of experts) {
    for (let i = 1; i <= 10; i++) {
      const score = expert.scores[i];
      if (score !== null && score !== undefined) {
        topicScores[i].push(score);
      }
    }
  }
  
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
  
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  if (totalWeight > 0) {
    for (let i = 1; i <= 10; i++) {
      weights[i] = weights[i] / totalWeight;
    }
  }
  
  return weights;
}

export function loadExpertWeights(csvPath = null) {
  if (cachedWeights && cacheTimestamp && 
      (Date.now() - cacheTimestamp) < CACHE_TTL) {
    return cachedWeights;
  }
  
  const defaultPath = path.join(__dirname, '../expert-survey.csv');
  const filePath = csvPath || defaultPath;
  
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
      continue;
    }
  }
  
  if (experts.length === 0) {
    console.warn('⚠️ No expert data found, using default weights');
    return getDefaultWeights();
  }
  
  console.log(`✅ Loaded ${experts.length} expert opinions`);
  const weights = calculateExpertWeights(experts);
  
  cachedWeights = weights;
  cacheTimestamp = Date.now();
  
  console.log('📊 Expert Weights:');
  for (let i = 1; i <= 10; i++) {
    console.log(`  ${i}. ${TOPIC_NAMES[i]}: ${(weights[i] * 100).toFixed(2)}%`);
  }
  
  return weights;
}

function getDefaultWeights() {
  const weights = {};
  const defaultWeight = 1 / 10; // Equal weight for 10 topics
  for (let i = 1; i <= 10; i++) {
    weights[i] = defaultWeight;
  }
  return weights;
}

export function getTopicKey(topicNumber) {
  return TOPIC_KEYS[topicNumber] || `topic_${topicNumber}`;
}

export function getTopicName(topicNumber) {
  return TOPIC_NAMES[topicNumber] || `Topic ${topicNumber}`;
}
