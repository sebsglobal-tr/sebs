// Evidence-Based AI Reporter
// Uses AI to interpret scores and provide recommendations
// IMPORTANT: AI NEVER generates scores - only interprets existing scores

import { generateAIReport } from './real-ai-service.js';

/**
 * Generate evidence-based AI report
 * @param {Object} scoreData - Calculated scores from score-calculator
 * @param {Object} userData - User information
 * @param {Object} metadata - Additional metadata (modules, simulations, etc.)
 * @returns {Promise<Object>} AI-generated interpretation and recommendations
 */
export async function generateEvidenceBasedReport(scoreData, userData, metadata = {}) {
  // Prepare data for AI interpretation
  const interpretationData = prepareInterpretationData(scoreData, metadata);
  
  // Generate AI interpretation (AI only interprets, never scores)
  const aiInterpretation = await generateAIInterpretation(interpretationData, userData);
  
  // Structure the report
  const report = {
    // Deterministic scores (from score-calculator)
    scores: {
      overall: scoreData.overallScore,
      breakdown: scoreData.topicBreakdown,
      summary: scoreData.summary
    },
    
    // AI interpretation (only interpretation, no scoring)
    interpretation: {
      overall: aiInterpretation.overall || '',
      strengths: aiInterpretation.strengths || [],
      weaknesses: aiInterpretation.weaknesses || [],
      learningStyle: aiInterpretation.learningStyle || '',
      recommendations: aiInterpretation.recommendations || []
    },
    
    // Evidence-based analysis
    evidence: {
      quizCount: metadata.quizResults?.length || 0,
      simulationCount: metadata.simulations?.length || 0,
      totalTimeSpent: metadata.totalTime || 0,
      expertWeightsUsed: scoreData.expertWeights
    },
    
    // Metadata
    generatedAt: new Date().toISOString(),
    version: '1.0.0'
  };
  
  return report;
}

/**
 * Prepare data for AI interpretation
 */
function prepareInterpretationData(scoreData, metadata) {
  const topics = Object.values(scoreData.topicBreakdown);
  
  // Strong topics (score >= 80)
  const strongTopics = topics
    .filter(t => t.combinedScore >= 80)
    .map(t => ({
      name: t.topicName,
      score: t.combinedScore,
      quizScore: t.quizScore,
      simulationScore: t.simulationScore
    }));
  
  // Weak topics (score < 60)
  const weakTopics = topics
    .filter(t => t.combinedScore < 60)
    .map(t => ({
      name: t.topicName,
      score: t.combinedScore,
      quizScore: t.quizScore,
      simulationScore: t.simulationScore,
      weight: t.weight // Expert importance
    }));
  
  // Moderate topics (60-80)
  const moderateTopics = topics
    .filter(t => t.combinedScore >= 60 && t.combinedScore < 80)
    .map(t => ({
      name: t.topicName,
      score: t.combinedScore
    }));
  
  return {
    overallScore: scoreData.overallScore,
    strongTopics,
    weakTopics,
    moderateTopics,
    quizCount: metadata.quizResults?.length || 0,
    simulationCount: metadata.simulations?.length || 0,
    totalTime: metadata.totalTime || 0,
    avgQuizScore: calculateAverageQuizScore(metadata.quizResults || []),
    avgSimulationScore: calculateAverageSimulationScore(metadata.simulations || [])
  };
}

/**
 * Generate AI interpretation of scores
 * AI only interprets, never generates scores
 */
async function generateAIInterpretation(data, userData) {
  const prompt = buildInterpretationPrompt(data, userData);
  
  try {
    // Use OpenAI if available, otherwise use fallback
    const aiResponse = await generateAIReport(userData, null, {
      scores: data,
      interpretationRequest: true
    });
    
    // Parse AI response
    return parseAIInterpretation(aiResponse, data);
  } catch (error) {
    console.error('❌ AI Interpretation Error:', error.message);
    // Fallback to rule-based interpretation
    return generateFallbackInterpretation(data);
  }
}

/**
 * Build prompt for AI interpretation
 */
function buildInterpretationPrompt(data, userData) {
  let prompt = `Sen bir siber güvenlik eğitim analiz uzmanısın. Aşağıdaki KANITA DAYALI skorları yorumla ve öneriler sun.\n\n`;
  
  prompt += `**ÖNEMLİ:** Sen sadece yorumlama yapacaksın. Skor üretmeyeceksin. Skorlar zaten deterministik araçlardan (quiz, simülasyon, süre) hesaplanmış.\n\n`;
  
  prompt += `**Kullanıcı Bilgileri:**\n`;
  prompt += `- İsim: ${userData.firstName || ''} ${userData.lastName || ''}\n`;
  prompt += `- Toplam Quiz Sayısı: ${data.quizCount}\n`;
  prompt += `- Toplam Simülasyon Sayısı: ${data.simulationCount}\n`;
  prompt += `- Toplam Süre: ${Math.round(data.totalTime / 60)} saat\n\n`;
  
  prompt += `**Genel Performans Skoru:** ${Math.round(data.overallScore * 100)}/100\n`;
  prompt += `(Bu skor quiz, simülasyon ve süre verilerinden hesaplanmıştır)\n\n`;
  
  prompt += `**Güçlü Yönler (Skor >= 80):**\n`;
  if (data.strongTopics.length > 0) {
    data.strongTopics.forEach((topic, i) => {
      prompt += `${i + 1}. ${topic.name}: ${topic.score}% (Quiz: ${topic.quizScore}%, Simülasyon: ${topic.simulationScore}%)\n`;
    });
  } else {
    prompt += `Güçlü yön tespit edilmedi.\n`;
  }
  prompt += `\n`;
  
  prompt += `**Geliştirilmesi Gereken Alanlar (Skor < 60):**\n`;
  if (data.weakTopics.length > 0) {
    data.weakTopics.forEach((topic, i) => {
      prompt += `${i + 1}. ${topic.name}: ${topic.score}% (Uzman Önemi: %${topic.weight})\n`;
    });
  } else {
    prompt += `Zayıf alan tespit edilmedi.\n`;
  }
  prompt += `\n`;
  
  prompt += `**Orta Seviye Konular (60-80 arası):**\n`;
  if (data.moderateTopics.length > 0) {
    data.moderateTopics.forEach((topic, i) => {
      prompt += `${i + 1}. ${topic.name}: ${topic.score}%\n`;
    });
  } else {
    prompt += `Orta seviye konu yok.\n`;
  }
  prompt += `\n`;
  
  prompt += `**Görev:**\n`;
  prompt += `Bu kanıta dayalı skorları yorumla ve şu formatta analiz sun:\n\n`;
  prompt += `1. **Genel Değerlendirme:** Genel skor ${Math.round(data.overallScore * 100)}/100. Bu skorun ne anlama geldiğini açıkla.\n`;
  prompt += `2. **Güçlü Yönler:** Kullanıcının başarılı olduğu konuları vurgula ve neden başarılı olduğunu analiz et.\n`;
  prompt += `3. **Geliştirme Alanları:** Zayıf olduğu konuları belirle ve neden zayıf olduğunu analiz et. Uzman önem ağırlıklarını dikkate al.\n`;
  prompt += `4. **Öğrenme Stili:** Quiz ve simülasyon skorlarına bakarak öğrenme stilini analiz et.\n`;
  prompt += `5. **Kişiselleştirilmiş Öneriler:** Kanıta dayalı öneriler sun. Hangi konularda daha fazla çalışma gerektiğini belirt.\n`;
  prompt += `\n`;
  prompt += `**ÖNEMLİ:** Skor üretme, sadece mevcut skorları yorumla ve öneriler sun.`;
  
  return prompt;
}

/**
 * Parse AI interpretation response
 */
function parseAIInterpretation(aiResponse, data) {
  // If AI response is structured, parse it
  // Otherwise use fallback
  
  if (typeof aiResponse === 'string') {
    return {
      overall: aiResponse.substring(0, 500),
      strengths: extractListItems(aiResponse, 'güçlü', 'strength'),
      weaknesses: extractListItems(aiResponse, 'geliştir', 'weakness'),
      learningStyle: extractSection(aiResponse, 'öğrenme', 'learning'),
      recommendations: extractListItems(aiResponse, 'öneri', 'recommendation')
    };
  }
  
  // If structured response
  return {
    overall: aiResponse.summary || '',
    strengths: aiResponse.strengths || [],
    weaknesses: aiResponse.areasForImprovement || [],
    learningStyle: aiResponse.learningPattern?.description || '',
    recommendations: aiResponse.recommendations || []
  };
}

/**
 * Extract list items from text
 */
function extractListItems(text, ...keywords) {
  const items = [];
  const lines = text.split('\n');
  
  let inSection = false;
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      inSection = true;
      continue;
    }
    
    if (inSection) {
      if (line.match(/^[-•\d.]+\s+/) || line.trim().startsWith('-')) {
        const item = line.replace(/^[-•\d.]+\s*/, '').trim();
        if (item) items.push(item);
      } else if (line.trim() === '') {
        // End of section
        break;
      }
    }
  }
  
  return items.length > 0 ? items : ['Analiz tamamlandı.'];
}

/**
 * Extract section text
 */
function extractSection(text, ...keywords) {
  const lines = text.split('\n');
  let inSection = false;
  const sectionLines = [];
  
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      inSection = true;
      continue;
    }
    
    if (inSection) {
      if (line.trim() === '' && sectionLines.length > 0) {
        break;
      }
      sectionLines.push(line.trim());
    }
  }
  
  return sectionLines.join(' ') || 'Öğrenme stili analizi tamamlandı.';
}

/**
 * Generate fallback interpretation (rule-based)
 */
function generateFallbackInterpretation(data) {
  const overallScore = Math.round(data.overallScore * 100);
  
  let overall = '';
  if (overallScore >= 90) {
    overall = `Mükemmel bir performans gösterdiniz. Genel skorunuz ${overallScore}/100. Tüm konularda güçlü bir temel oluşturmuşsunuz.`;
  } else if (overallScore >= 80) {
    overall = `İyi bir performans sergilediniz. Genel skorunuz ${overallScore}/100. Çoğu konuda başarılısınız, bazı alanlarda gelişim fırsatı var.`;
  } else if (overallScore >= 70) {
    overall = `Orta seviye bir performans gösterdiniz. Genel skorunuz ${overallScore}/100. Temel bilgilere sahipsiniz, daha fazla pratik ile ilerleyebilirsiniz.`;
  } else if (overallScore >= 60) {
    overall = `Geliştirilmesi gereken bir performans. Genel skorunuz ${overallScore}/100. Bazı temel konularda eksikleriniz var, sistematik çalışma önerilir.`;
  } else {
    overall = `Temel konuları tekrar gözden geçirmeniz gerekiyor. Genel skorunuz ${overallScore}/100. Adım adım ilerlemeniz önerilir.`;
  }
  
  const strengths = data.strongTopics.map(t => 
    `${t.name} konusunda güçlüsünüz (${t.score}%). Bu konuda başarılı olduğunuz için diğer konulara odaklanabilirsiniz.`
  );
  
  const weaknesses = data.weakTopics.map(t => 
    `${t.name} konusunda gelişim gerekiyor (${t.score}%). Bu konu uzmanlar tarafından %${t.weight} önemli görülüyor, bu yüzden öncelik vermeniz önerilir.`
  );
  
  const recommendations = [
    ...weaknesses.map(w => `Zayıf olduğunuz konularda ek çalışma yapın: ${w}`),
    'Quiz ve simülasyonları tekrar çözerek pratik yapın.',
    'Zaman yönetimini iyileştirin ve düzenli çalışma planı oluşturun.'
  ];
  
  return {
    overall,
    strengths: strengths.length > 0 ? strengths : ['Genel olarak dengeli bir performans gösteriyorsunuz.'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['Tüm konularda dengeli bir seviyedesiniz.'],
    learningStyle: 'Öğrenme stiliniz quiz ve simülasyon sonuçlarına göre analiz edilmiştir.',
    recommendations
  };
}

/**
 * Calculate average quiz score
 */
function calculateAverageQuizScore(quizResults) {
  if (!quizResults || quizResults.length === 0) return 0;
  const sum = quizResults.reduce((acc, q) => acc + (q.score || 0), 0);
  return Math.round(sum / quizResults.length);
}

/**
 * Calculate average simulation score
 */
function calculateAverageSimulationScore(simulations) {
  if (!simulations || simulations.length === 0) return 0;
  const sum = simulations.reduce((acc, s) => acc + (s.score || 0), 0);
  return Math.round(sum / simulations.length);
}
