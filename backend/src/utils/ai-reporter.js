// Advanced AI Report Generator
// Uses intelligent analysis patterns to generate detailed reports

export function generateAdvancedAIReport(certificate, metadata, userProgress = {}) {
  const report = {
    summary: '',
    performanceAnalysis: {
      overall: {},
      modules: [],
      simulations: [],
      quizzes: []
    },
    learningPattern: {},
    strengths: [],
    areasForImprovement: [],
    detailedRecommendations: [],
    nextSteps: [],
    resources: []
  };

  // 1. DETAILED SUMMARY
  const hours = Math.round(certificate.completionTime / 60);
  const modulesCompleted = metadata.modules?.filter(m => m.status === 'Tamamlandı').length || 0;
  const totalModules = metadata.modules?.length || 0;
  const simulationsCompleted = metadata.simulations?.length || 0;
  const totalQuizzes = metadata.quizResults?.length || 0;

  report.summary = generateDetailedSummary({
    hours,
    modulesCompleted,
    totalModules,
    simulationsCompleted,
    avgScore: metadata.avgScore,
    errors: metadata.errors?.length || 0
  });

  // 2. PERFORMANCE ANALYSIS
  report.performanceAnalysis.overall = analyzeOverallPerformance(metadata);
  report.performanceAnalysis.modules = analyzeModulePerformance(metadata.modules || []);
  report.performanceAnalysis.simulations = analyzeSimulationPerformance(metadata.simulations || []);
  report.performanceAnalysis.quizzes = analyzeQuizPerformance(metadata.quizResults || []);

  // 3. LEARNING PATTERN ANALYSIS
  report.learningPattern = analyzeLearningPattern(metadata, certificate);

  // 4. STRENGTHS (Detailed)
  report.strengths = generateDetailedStrengths(metadata, report.performanceAnalysis, report.learningPattern);

  // 5. AREAS FOR IMPROVEMENT (Detailed with specific topics)
  report.areasForImprovement = generateDetailedImprovements(metadata, report.performanceAnalysis);

  // 6. DETAILED RECOMMENDATIONS (Topic-specific)
  report.detailedRecommendations = generateDetailedRecommendations(
    metadata,
    report.performanceAnalysis,
    report.learningPattern
  );

  // 7. NEXT STEPS (Actionable items)
  report.nextSteps = generateNextSteps(metadata, report.performanceAnalysis);

  // 8. RESOURCE RECOMMENDATIONS
  report.resources = generateResourceRecommendations(metadata, report.performanceAnalysis);

  return report;
}

// Detailed Summary Generator
function generateDetailedSummary(data) {
  const { hours, modulesCompleted, totalModules, simulationsCompleted, avgScore, errors } = data;
  
  let summary = `Bu sertifikasyon programını ${hours} saatte tamamladınız. `;
  
  summary += `${modulesCompleted}/${totalModules} modül tamamlandı`;
  if (simulationsCompleted > 0) {
    summary += `, ${simulationsCompleted} simülasyon gerçekleştirdiniz`;
  }
  summary += '. ';
  
  if (avgScore) {
    if (avgScore >= 85) {
      summary += `Mükemmel bir performans gösterdiniz (%${avgScore} ortalama). `;
    } else if (avgScore >= 70) {
      summary += `İyi bir performans sergilediniz (%${avgScore} ortalama). `;
    } else {
      summary += `Ortalama başarı oranınız %${avgScore}. `;
    }
  }
  
  if (errors > 0) {
    summary += `${errors} farklı konuda zorluk yaşadığınız tespit edildi. `;
  }
  
  summary += `Detaylı analiz aşağıda sunulmaktadır.`;
  
  return summary;
}

// Overall Performance Analysis
function analyzeOverallPerformance(metadata) {
  const analysis = {
    score: metadata.avgScore || 0,
    level: '',
    trend: '',
    consistency: ''
  };

  // Level determination
  if (analysis.score >= 90) {
    analysis.level = 'Mükemmel';
    analysis.description = 'Üst düzey performans gösterdiniz. Profesyonel seviyede bilgiye sahipsiniz.';
  } else if (analysis.score >= 80) {
    analysis.level = 'İyi';
    analysis.description = 'İyi bir seviyede performans gösterdiniz. Bazı konularda derinleşmeye ihtiyaç var.';
  } else if (analysis.score >= 70) {
    analysis.level = 'Orta';
    analysis.description = 'Temel bilgilere sahipsiniz. Pratik yaparak ve tekrar ederek seviyenizi yükseltebilirsiniz.';
  } else if (analysis.score >= 60) {
    analysis.level = 'Geliştirilmeli';
    analysis.description = 'Temel konularda eksikleriniz var. Sistematik bir çalışma planı ile ilerlemeniz önerilir.';
  } else {
    analysis.level = 'Yeniden Gözden Geçirilmeli';
    analysis.description = 'Temel kavramları tekrar öğrenmeniz gerekiyor. Adım adım ilerlemeniz önerilir.';
  }

  // Trend analysis (if we have quiz history)
  if (metadata.quizResults && metadata.quizResults.length > 1) {
    const scores = metadata.quizResults.map(q => q.score || 0);
    const firstHalf = scores.slice(0, Math.ceil(scores.length / 2));
    const secondHalf = scores.slice(Math.ceil(scores.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg + 5) {
      analysis.trend = 'İyileşme';
      analysis.trendDescription = 'Sınav sonuçlarınızda pozitif bir trend görülüyor. Çalışma yönteminiz etkili.';
    } else if (secondAvg < firstAvg - 5) {
      analysis.trend = 'Düşüş';
      analysis.trendDescription = 'Son sınavlarda performansınız düştü. Konuları daha detaylı çalışmanız önerilir.';
    } else {
      analysis.trend = 'Stabil';
      analysis.trendDescription = 'Performansınız sabit. Daha fazla pratik ile ilerleme kaydedebilirsiniz.';
    }
  }

  // Consistency analysis
  if (metadata.quizResults && metadata.quizResults.length > 2) {
    const scores = metadata.quizResults.map(q => q.score || 0);
    const variance = calculateVariance(scores);
    if (variance < 100) {
      analysis.consistency = 'Tutarlı';
      analysis.consistencyDescription = 'Performansınız tutarlı, bu iyi bir işaret.';
    } else {
      analysis.consistency = 'Değişken';
      analysis.consistencyDescription = 'Performansınızda dalgalanmalar var. Daha düzenli çalışma önerilir.';
    }
  }

  return analysis;
}

// Module Performance Analysis
function analyzeModulePerformance(modules) {
  return modules.map(module => ({
    name: module.name,
    completion: module.percentage || 0,
    timeSpent: module.completionTime || 0,
    status: module.status,
    assessment: getModuleAssessment(module.percentage || 0),
    strengths: getModuleStrengths(module),
    weaknesses: getModuleWeaknesses(module)
  }));
}

// Simulation Performance Analysis
function analyzeSimulationPerformance(simulations) {
  if (simulations.length === 0) return [];
  
  const avgScore = simulations.reduce((sum, s) => sum + (s.score || 0), 0) / simulations.length;
  const avgTime = simulations.reduce((sum, s) => sum + (s.timeSpent || 0), 0) / simulations.length;
  
  return {
    total: simulations.length,
    averageScore: Math.round(avgScore),
    averageTime: Math.round(avgTime / 60), // minutes
    bestPerformance: Math.max(...simulations.map(s => s.score || 0)),
    worstPerformance: Math.min(...simulations.map(s => s.score || 0)),
    assessment: getSimulationAssessment(avgScore),
    recommendations: getSimulationRecommendations(simulations)
  };
}

// Quiz Performance Analysis
function analyzeQuizPerformance(quizzes) {
  if (quizzes.length === 0) return null;
  
  const scores = quizzes.map(q => q.score || 0);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const topics = extractWrongAnswers(quizzes);
  
  return {
    total: quizzes.length,
    averageScore: Math.round(avgScore),
    bestScore: Math.max(...scores),
    worstScore: Math.min(...scores),
    weakTopics: topics,
    improvementAreas: generateTopicRecommendations(topics)
  };
}

// Learning Pattern Analysis
function analyzeLearningPattern(metadata, certificate) {
  const pattern = {
    learningStyle: '',
    pace: '',
    focus: '',
    recommendations: []
  };

  // Learning pace
  const hours = Math.round(certificate.completionTime / 60);
  const avgModuleTime = metadata.modules?.reduce((sum, m) => sum + (m.completionTime || 0), 0) / (metadata.modules?.length || 1);
  
  if (hours < 5) {
    pattern.pace = 'Hızlı';
    pattern.paceDescription = 'Hızlı bir öğrenme hızınız var. Derinlemesine çalışma önerilir.';
  } else if (hours > 30) {
    pattern.pace = 'Yavaş ve Detaylı';
    pattern.paceDescription = 'Kavramları detaylı öğreniyorsunuz. Bu iyi bir yaklaşım.';
  } else {
    pattern.pace = 'Dengeli';
    pattern.paceDescription = 'Öğrenme hızınız dengeli. Mevcut hızınızı koruyabilirsiniz.';
  }

  // Learning focus (theory vs practice)
  const theoryModules = metadata.modules?.filter(m => m.type === 'lesson').length || 0;
  const practiceSims = metadata.simulations?.length || 0;
  
  if (practiceSims > theoryModules * 2) {
    pattern.focus = 'Pratik Odaklı';
    pattern.focusDescription = 'Pratik yapmayı seviyorsunuz. Teorik bilgileri de pekiştirmeniz önerilir.';
  } else if (theoryModules > practiceSims * 2) {
    pattern.focus = 'Teorik Odaklı';
    pattern.focusDescription = 'Teorik bilgilere odaklanıyorsunuz. Daha fazla pratik yapmanız önerilir.';
  } else {
    pattern.focus = 'Dengeli';
    pattern.focusDescription = 'Teori ve pratik arasında iyi bir denge kurmuşsunuz.';
  }

  // Learning style inference
  const errorRate = (metadata.errors?.length || 0) / (metadata.quizResults?.length || 1);
  if (errorRate < 0.2 && metadata.avgScore >= 80) {
    pattern.learningStyle = 'Yüksek Öğrenme Kapasitesi';
    pattern.learningStyleDescription = 'Hızlı öğreniyorsunuz ve az hata yapıyorsunuz. İleri seviye içeriklere geçebilirsiniz.';
  } else if (errorRate > 0.4) {
    pattern.learningStyle = 'Pratikle Gelişen';
    pattern.learningStyleDescription = 'Pratik yaparak öğreniyorsunuz. Daha fazla simülasyon ve uygulama önerilir.';
  } else {
    pattern.learningStyle = 'Karışık Öğrenme';
    pattern.learningStyleDescription = 'Farklı yöntemlerle öğreniyorsunuz. Tekrar ve pekiştirme yapmanız önerilir.';
  }

  return pattern;
}

// Generate Detailed Strengths
function generateDetailedStrengths(metadata, performance, learningPattern) {
  const strengths = [];

  // Score-based strengths
  if (performance.overall.score >= 90) {
    strengths.push({
      title: 'Mükemmel Başarı Oranı',
      description: `%${performance.overall.score} ortalama skor ile üst düzey performans gösterdiniz.`,
      impact: 'Yüksek'
    });
  } else if (performance.overall.score >= 80) {
    strengths.push({
      title: 'İyi Başarı Oranı',
      description: `%${performance.overall.score} ortalama ile iyi bir seviyedesiniz.`,
      impact: 'Orta'
    });
  }

  // Time-based strengths
  const hours = Math.round(certificate.completionTime / 60);
  if (hours < 10 && metadata.avgScore >= 75) {
    strengths.push({
      title: 'Hızlı ve Etkili Öğrenme',
      description: `Çok kısa sürede (${hours} saat) iyi sonuçlar aldınız. Öğrenme verimliliğiniz yüksek.`,
      impact: 'Yüksek'
    });
  }

  // Consistency strengths
  if (performance.overall.consistency === 'Tutarlı') {
    strengths.push({
      title: 'Tutarlı Performans',
      description: 'Performansınız tutarlı, bu uzun vadede başarılı olacağınızın göstergesi.',
      impact: 'Orta'
    });
  }

  // Learning pattern strengths
  if (learningPattern.focus === 'Dengeli') {
    strengths.push({
      title: 'Dengeli Öğrenme Yaklaşımı',
      description: 'Teori ve pratik arasında iyi bir denge kurmuşsunuz.',
      impact: 'Orta'
    });
  }

  // Module completion strengths
  const completedModules = metadata.modules?.filter(m => m.status === 'Tamamlandı').length || 0;
  if (completedModules === metadata.modules?.length) {
    strengths.push({
      title: 'Tam Tamamlama',
      description: 'Tüm modülleri tamamladınız. Disiplinli bir çalışma sergilediniz.',
      impact: 'Yüksek'
    });
  }

  return strengths;
}

// Generate Detailed Improvements
function generateDetailedImprovements(metadata, performance) {
  const improvements = [];

  // Score-based improvements
  if (performance.overall.score < 70) {
    improvements.push({
      title: 'Başarı Oranını Artırma',
      description: `Ortalama başarı oranınız %${performance.overall.score}. Hedef en az %80 olmalı.`,
      priority: 'Yüksek',
      specificTopics: identifyWeakTopics(metadata),
      actionPlan: [
        'Temel konuları tekrar gözden geçirin',
        'Her konudan sonra pratik yapın',
        'Zayıf olduğunuz konularda ek kaynaklar okuyun'
      ]
    });
  }

  // Error-based improvements
  if (metadata.errors && metadata.errors.length > 0) {
    improvements.push({
      title: 'Hata Kategorilerinde Gelişim',
      description: `${metadata.errors.length} farklı konuda zorluk yaşıyorsunuz: ${metadata.errors.join(', ')}`,
      priority: 'Yüksek',
      specificTopics: metadata.errors,
      actionPlan: generateErrorActionPlan(metadata.errors)
    });
  }

  // Simulation improvements
  if (performance.simulations.averageScore < 80) {
    improvements.push({
      title: 'Simülasyon Performansını Artırma',
      description: `Simülasyonlarda ortalama skorunuz %${performance.simulations.averageScore}. Daha fazla pratik gerekiyor.`,
      priority: 'Orta',
      actionPlan: [
        'Simülasyonları tekrar çözün',
        'Her simülasyondan sonra hatalarınızı inceleyin',
        'Zaman yönetimi teknikleri uygulayın'
      ]
    });
  }

  // Time management improvements
  const avgTimePerModule = certificate.completionTime / (metadata.modules?.length || 1);
  if (avgTimePerModule > 120 && performance.overall.score < 75) {
    improvements.push({
      title: 'Zaman Yönetimi',
      description: 'Modül başına geçirdiğiniz süre uzun ancak başarı oranı düşük. Daha verimli çalışma teknikleri önerilir.',
      priority: 'Orta',
      actionPlan: [
        'Pomodoro tekniği kullanın (25 dakika çalış, 5 dakika mola)',
        'Önce hızlıca gözden geçirip sonra detaylı çalışın',
        'Odaklanma teknikleri uygulayın'
      ]
    });
  }

  return improvements;
}

// Generate Detailed Recommendations
function generateDetailedRecommendations(metadata, performance, learningPattern) {
  const recommendations = [];

  // Based on score
  if (performance.overall.score < 70) {
    recommendations.push({
      category: 'Temel Geliştirme',
      items: [
        {
          title: 'Temel Konuları Tekrar Çalışın',
          description: 'Siber güvenlik temellerini (CIA triad, tehdit türleri, saldırı vektörleri) gözden geçirin.',
          priority: 'Yüksek',
          resources: [
            'Temel Siber Güvenlik modülünü tekrar inceleyin',
            'İlgili video dersler izleyin',
            'Pratik uygulamalar yapın'
          ]
        },
        {
          title: 'Hatalarınızı Analiz Edin',
          description: 'Yanlış cevapladığınız soruları tekrar gözden geçirin ve doğru cevapları öğrenin.',
          priority: 'Yüksek',
          resources: []
        }
      ]
    });
  }

  // Based on errors
  if (metadata.errors && metadata.errors.length > 0) {
    recommendations.push({
      category: 'Hata Odaklı Geliştirme',
      items: metadata.errors.map(error => ({
        title: `${error} Konusunda Derinleşin`,
        description: `Bu konuda daha fazla pratik yapmanız gerekiyor.`,
        priority: 'Yüksek',
        resources: getResourcesForTopic(error)
      }))
    });
  }

  // Based on learning pattern
  if (learningPattern.focus === 'Teorik Odaklı') {
    recommendations.push({
      category: 'Öğrenme Yöntemi Geliştirme',
      items: [
        {
          title: 'Daha Fazla Pratik Yapın',
          description: 'Simülasyonları ve lab ortamlarını daha sık kullanın.',
          priority: 'Orta',
          resources: [
            'Mevcut simülasyonları tekrar çözün',
            'Yeni lab ortamlarını deneyin',
            'Gerçek dünya senaryoları uygulayın'
          ]
        }
      ]
    });
  }

  // General recommendations
  recommendations.push({
    category: 'Genel Öneriler',
    items: [
      {
        title: 'Düzenli Çalışma Planı Oluşturun',
        description: 'Her gün en az 1 saat ayırın ve düzenli çalışın.',
        priority: 'Orta',
        resources: []
      },
      {
        title: 'Akranlarla Çalışın',
        description: 'Gruplar halinde çalışarak birbirinizden öğrenin.',
        priority: 'Düşük',
        resources: []
      }
    ]
  });

  return recommendations;
}

// Generate Next Steps
function generateNextSteps(metadata, performance) {
  const steps = [];

  if (performance.overall.score < 70) {
    steps.push({
      step: 1,
      title: 'Temel Konuları Gözden Geçirin',
      description: 'İlk modülleri tekrar inceleyin ve temel kavramları pekiştirin',
      estimatedTime: '2-3 saat',
      deadline: '1 hafta içinde'
    });

    steps.push({
      step: 2,
      title: 'Zayıf Konularda Pratik Yapın',
      description: `${metadata.errors?.join(', ') || 'Zayıf konularda'} özel çalışma yapın`,
      estimatedTime: '3-4 saat',
      deadline: '2 hafta içinde'
    });
  }

  steps.push({
    step: steps.length + 1,
    title: 'İleri Seviye Modüllere Geçin',
    description: 'Temel konularda iyileşme gösterdikten sonra ileri seviye içeriklere geçin',
    estimatedTime: '5-10 saat',
    deadline: '1 ay içinde'
  });

  return steps;
}

// Generate Resource Recommendations
function generateResourceRecommendations(metadata, performance) {
  const resources = [];

  // Based on weak topics
  if (metadata.errors && metadata.errors.length > 0) {
    metadata.errors.forEach(topic => {
      resources.push({
        topic: topic,
        type: 'Video',
        title: `${topic} - Detaylı Video Eğitimi`,
        url: '#',
        description: 'Bu konuda detaylı açıklamalar içeren video eğitim',
        difficulty: 'Başlangıç'
      });

      resources.push({
        topic: topic,
        type: 'Pratik',
        title: `${topic} - Hands-on Lab`,
        url: '#',
        description: 'Bu konuda uygulamalı lab çalışması',
        difficulty: 'Orta'
      });
    });
  }

  // General resources
  resources.push({
    topic: 'Genel',
    type: 'Makale',
    title: 'Siber Güvenlik En İyi Uygulamaları',
    url: '#',
    description: 'Endüstri standartlarını öğrenin',
    difficulty: 'Genel'
  });

  return resources;
}

// Helper Functions

function calculateVariance(numbers) {
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
}

function getModuleAssessment(percentage) {
  if (percentage >= 90) return 'Mükemmel';
  if (percentage >= 75) return 'İyi';
  if (percentage >= 60) return 'Orta';
  return 'Geliştirilmeli';
}

function getModuleStrengths(module) {
  const strengths = [];
  if ((module.percentage || 0) >= 90) {
    strengths.push('Kavramları çok iyi anlamışsınız');
  }
  if ((module.completionTime || 0) < 60 && (module.percentage || 0) >= 80) {
    strengths.push('Etkili öğrenme gösterdiniz');
  }
  return strengths;
}

function getModuleWeaknesses(module) {
  const weaknesses = [];
  if ((module.percentage || 0) < 70) {
    weaknesses.push('Bu modülde daha fazla çalışma gerekiyor');
  }
  if ((module.completionTime || 0) > 120 && (module.percentage || 0) < 80) {
    weaknesses.push('Zaman yönetimini iyileştirin');
  }
  return weaknesses;
}

function getSimulationAssessment(avgScore) {
  if (avgScore >= 90) return 'Mükemmel performans';
  if (avgScore >= 80) return 'İyi performans';
  if (avgScore >= 70) return 'Orta performans';
  return 'Geliştirilmeli';
}

function getSimulationRecommendations(simulations) {
  const recommendations = [];
  const avgScore = simulations.reduce((sum, s) => sum + (s.score || 0), 0) / simulations.length;
  
  if (avgScore < 80) {
    recommendations.push('Simülasyonları tekrar çözün');
    recommendations.push('Her simülasyondan sonra hatalarınızı analiz edin');
  }
  
  return recommendations;
}

function extractWrongAnswers(quizzes) {
  const topics = new Set();
  quizzes.forEach(quiz => {
    if (quiz.wrongAnswers) {
      quiz.wrongAnswers.forEach(topic => topics.add(topic));
    }
  });
  return Array.from(topics);
}

function generateTopicRecommendations(topics) {
  return topics.map(topic => ({
    topic: topic,
    action: `"${topic}" konusunda ek çalışma yapın`,
    resources: getResourcesForTopic(topic)
  }));
}

function identifyWeakTopics(metadata) {
  const weakTopics = [];
  
  // From errors
  if (metadata.errors) {
    weakTopics.push(...metadata.errors);
  }
  
  // From quiz results
  if (metadata.quizResults) {
    metadata.quizResults.forEach(quiz => {
      if (quiz.score < 70 && quiz.wrongAnswers) {
        weakTopics.push(...quiz.wrongAnswers);
      }
    });
  }
  
  // From low-scoring modules
  if (metadata.modules) {
    metadata.modules.forEach(module => {
      if ((module.percentage || 0) < 70) {
        weakTopics.push(module.name);
      }
    });
  }
  
  // Remove duplicates
  return [...new Set(weakTopics)];
}

function generateErrorActionPlan(errors) {
  const plan = [];
  
  errors.forEach(error => {
    plan.push(`${error} konusunda özel çalışma yapın`);
    plan.push(`${error} ile ilgili simülasyonları tekrar çözün`);
  });
  
  plan.push('Hatalarınızı not edin ve düzenli gözden geçirin');
  
  return plan;
}

function getResourcesForTopic(topic) {
  const resourceMap = {
    'SQL Injection': [
      'OWASP SQL Injection Kılavuzu',
      'SQL Injection Lab Simülasyonu',
      'Güvenli SQL Yazım Teknikleri'
    ],
    'XSS Prevention': [
      'XSS Saldırı Türleri ve Korunma',
      'Content Security Policy (CSP)',
      'XSS Filtreleme Teknikleri'
    ],
    'Firewall Configuration': [
      'Firewall Kuralları Yazımı',
      'Network Segmentasyon',
      'IDS/IPS Sistemleri'
    ]
  };
  
  return resourceMap[topic] || [
    `${topic} konusunda detaylı kaynaklar`,
    `İlgili lab simülasyonları`,
    `Pratik uygulamalar`
  ];
}

