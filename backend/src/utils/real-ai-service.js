// Real AI Service Integration
// Uses OpenAI API for intelligent analysis and report generation

let OpenAI = null;
let openaiClient = null;
let openaiLoaded = false;

// Lazy load OpenAI (optional dependency)
async function loadOpenAI() {
    if (openaiLoaded) {
        return OpenAI;
    }
    
    try {
        const openaiModule = await import('openai');
        OpenAI = openaiModule.default;
        openaiLoaded = true;
        return OpenAI;
    } catch (e) {
        console.warn('⚠️ OpenAI package not installed, AI features will use fallback');
        openaiLoaded = true; // Mark as loaded to avoid repeated attempts
        return null;
    }
}

// Initialize OpenAI client
async function getOpenAIClient() {
    const OpenAI = await loadOpenAI();
    if (!OpenAI) {
        return null;
    }
    
    if (!openaiClient) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.warn('⚠️ OPENAI_API_KEY not set, AI features will use fallback');
            return null;
        }
        try {
            openaiClient = new OpenAI({
                apiKey: apiKey
            });
        } catch (e) {
            console.error('❌ Failed to initialize OpenAI client:', e.message);
            return null;
        }
    }
    return openaiClient;
}

/**
 * Generate AI-powered analysis report from user progress data
 * @param {Object} userData - Complete user progress data
 * @param {Object} certificate - Certificate information
 * @param {Object} metadata - Metadata from certificate
 * @returns {Promise<Object>} AI-generated report
 */
export async function generateAIReport(userData, certificate, metadata) {
    const client = await getOpenAIClient();
    
    // If OpenAI is not configured, use fallback
    if (!client) {
        return generateFallbackReport(certificate, metadata);
    }

    try {
        // Prepare comprehensive user data for AI analysis
        const analysisPrompt = buildAnalysisPrompt(userData, certificate, metadata);
        
        const completion = await client.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Sen bir eğitim analiz uzmanısın. Kullanıcıların öğrenme performanslarını analiz edip 
                    detaylı, yapıcı ve kişiselleştirilmiş raporlar hazırlıyorsun. Raporlar Türkçe olmalı ve 
                    kullanıcıya somut, uygulanabilir öneriler sunmalı.`
                },
                {
                    role: 'user',
                    content: analysisPrompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        });

        const aiResponse = completion.choices[0].message.content;
        
        // Parse AI response into structured report
        return parseAIResponse(aiResponse, certificate, metadata);
        
    } catch (error) {
        console.error('❌ OpenAI API Error:', error.message);
        // Fallback to pattern-based analysis
        return generateFallbackReport(certificate, metadata);
    }
}

/**
 * Build comprehensive prompt for AI analysis
 */
function buildAnalysisPrompt(userData, certificate, metadata) {
    const hours = Math.round(certificate.completionTime / 60);
    const modulesCompleted = metadata.modules?.filter(m => m.status === 'Tamamlandı').length || 0;
    const totalModules = metadata.modules?.length || 0;
    const avgScore = metadata.avgScore || 0;
    
    let prompt = `Aşağıdaki kullanıcı verilerini analiz et ve detaylı bir öğrenme performans raporu hazırla:\n\n`;
    
    prompt += `**Kullanıcı Bilgileri:**\n`;
    prompt += `- İsim: ${userData.firstName} ${userData.lastName}\n`;
    prompt += `- Kategori: ${certificate.category}\n`;
    prompt += `- Tamamlama Süresi: ${hours} saat\n\n`;
    
    prompt += `**Modül Performansı:**\n`;
    if (metadata.modules && metadata.modules.length > 0) {
        metadata.modules.forEach((module, index) => {
            prompt += `${index + 1}. ${module.name}: %${module.percentage || 0} tamamlandı, ${module.completionTime || 0} dakika\n`;
        });
    }
    prompt += `\nToplam: ${modulesCompleted}/${totalModules} modül tamamlandı\n\n`;
    
    prompt += `**Simülasyon Performansı:**\n`;
    if (metadata.simulations && metadata.simulations.length > 0) {
        metadata.simulations.forEach((sim, index) => {
            prompt += `${index + 1}. ${sim.name}: %${sim.score || 0} başarı, ${Math.round((sim.timeSpent || 0) / 60)} dakika\n`;
        });
    } else {
        prompt += `Simülasyon tamamlanmadı\n`;
    }
    prompt += `\n`;
    
    prompt += `**Quiz Sonuçları:**\n`;
    if (metadata.quizResults && metadata.quizResults.length > 0) {
        const quizScores = metadata.quizResults.map(q => q.score || 0);
        const avgQuizScore = Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length);
        prompt += `- Toplam Quiz: ${metadata.quizResults.length}\n`;
        prompt += `- Ortalama Skor: %${avgQuizScore}\n`;
        prompt += `- En Yüksek: %${Math.max(...quizScores)}\n`;
        prompt += `- En Düşük: %${Math.min(...quizScores)}\n`;
    } else {
        prompt += `Quiz sonucu yok\n`;
    }
    prompt += `\n`;
    
    prompt += `**Genel Performans:**\n`;
    prompt += `- Ortalama Başarı Oranı: %${avgScore}\n`;
    if (metadata.errors && metadata.errors.length > 0) {
        prompt += `- Zorlanılan Konular: ${metadata.errors.join(', ')}\n`;
    }
    prompt += `\n`;
    
    prompt += `**Görev:**\n`;
    prompt += `Bu verilere dayanarak şu formatta detaylı bir analiz raporu hazırla:\n\n`;
    prompt += `1. **Özet:** Kullanıcının genel performansını 2-3 cümleyle özetle\n`;
    prompt += `2. **Güçlü Yönler:** Kullanıcının başarılı olduğu alanları belirle (3-5 madde)\n`;
    prompt += `3. **Geliştirilmesi Gereken Alanlar:** Zayıf olduğu konuları ve nedenlerini belirle (3-5 madde)\n`;
    prompt += `4. **Öğrenme Stili Analizi:** Kullanıcının öğrenme tarzını analiz et (hızlı/yavaş, teorik/pratik odaklı vb.)\n`;
    prompt += `5. **Kişiselleştirilmiş Öneriler:** Kullanıcıya özel, uygulanabilir öneriler sun (5-7 madde)\n`;
    prompt += `6. **Sonraki Adımlar:** Kullanıcının hangi konulara odaklanması gerektiğini belirle\n`;
    prompt += `\nRapor profesyonel, yapıcı ve motivasyonel olmalı. JSON formatında döndürme, sadece metin olarak hazırla.`;
    
    return prompt;
}

/**
 * Parse AI response into structured report format
 */
function parseAIResponse(aiResponse, certificate, metadata) {
    // Try to extract structured information from AI response
    // If AI returns structured JSON, parse it; otherwise use the text as summary
    
    const report = {
        summary: '',
        strengths: [],
        areasForImprovement: [],
        learningStyle: {},
        recommendations: [],
        nextSteps: [],
        aiGenerated: true,
        rawResponse: aiResponse
    };
    
    // Simple parsing - extract sections
    const sections = aiResponse.split(/\*\*/).filter(s => s.trim());
    
    sections.forEach(section => {
        const lines = section.split('\n').filter(l => l.trim());
        const title = lines[0]?.toLowerCase() || '';
        
        if (title.includes('özet') || title.includes('summary')) {
            report.summary = lines.slice(1).join(' ').trim();
        } else if (title.includes('güçlü') || title.includes('strength')) {
            report.strengths = lines.slice(1).filter(l => l.trim().startsWith('-') || l.trim().match(/^\d+\./))
                .map(l => l.replace(/^[-•\d.]+\s*/, '').trim());
        } else if (title.includes('geliştir') || title.includes('improvement')) {
            report.areasForImprovement = lines.slice(1).filter(l => l.trim().startsWith('-') || l.trim().match(/^\d+\./))
                .map(l => l.replace(/^[-•\d.]+\s*/, '').trim());
        } else if (title.includes('öneri') || title.includes('recommendation')) {
            report.recommendations = lines.slice(1).filter(l => l.trim().startsWith('-') || l.trim().match(/^\d+\./))
                .map(l => l.replace(/^[-•\d.]+\s*/, '').trim());
        } else if (title.includes('adım') || title.includes('next step')) {
            report.nextSteps = lines.slice(1).filter(l => l.trim().startsWith('-') || l.trim().match(/^\d+\./))
                .map(l => l.replace(/^[-•\d.]+\s*/, '').trim());
        }
    });
    
    // If parsing failed, use the whole response as summary
    if (!report.summary && aiResponse) {
        report.summary = aiResponse.substring(0, 500);
        report.fullAnalysis = aiResponse;
    }
    
    return report;
}

/**
 * Fallback report when AI is not available
 */
function generateFallbackReport(certificate, metadata) {
    // Use existing pattern-based analysis
    const { generateAdvancedAIReport } = require('./ai-reporter.js');
    return generateAdvancedAIReport(certificate, metadata);
}

/**
 * Analyze user learning patterns with AI
 */
export async function analyzeLearningPattern(userData, progressData) {
    const client = await getOpenAIClient();
    if (!client) {
        return null;
    }

    try {
        const prompt = `Kullanıcının öğrenme verilerini analiz et:
        - Modül tamamlama süreleri: ${progressData.modules?.map(m => `${m.name}: ${m.completionTime}dk`).join(', ')}
        - Quiz skorları: ${progressData.quizResults?.map(q => q.score).join(', ')}
        - Simülasyon performansı: ${progressData.simulations?.map(s => `${s.name}: %${s.score}`).join(', ')}
        
        Kullanıcının öğrenme stilini, güçlü yönlerini ve geliştirilmesi gereken alanları belirle.`;
        
        const completion = await client.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Sen bir öğrenme analiz uzmanısın. Kullanıcı verilerini analiz edip öğrenme stilini belirliyorsun.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        return {
            analysis: completion.choices[0].message.content,
            aiGenerated: true
        };
    } catch (error) {
        console.error('❌ AI Learning Pattern Analysis Error:', error.message);
        return null;
    }
}
