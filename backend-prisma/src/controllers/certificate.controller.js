// Certificate Controller
import { prisma } from '../server.js';
import { generateCertificate } from '../utils/certificate-generator.js';
import { generateAdvancedAIReport } from '../utils/ai-reporter.js';
import { generateAIReport } from '../utils/real-ai-service.js';

// Get user certificates
export async function getUserCertificates(req, res, next) {
  try {
    const { publicId } = req.user;

    const user = await prisma.user.findUnique({ where: { publicId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const certificates = await prisma.certificate.findMany({
      where: { userId: user.id },
      orderBy: { earnedAt: 'desc' }
    });

    res.json({
      success: true,
      data: { certificates }
    });
  } catch (error) {
    next(error);
  }
}

// Generate certificate for completed category
export async function generateCategoryCertificate(req, res, next) {
  try {
    const { publicId } = req.user;
    const { category } = req.body; // siber-guvenlik, bulut-bilisim, etc.

    const user = await prisma.user.findUnique({ where: { publicId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if certificate already exists
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        userId: user.id,
        category
      }
    });

    if (existingCertificate) {
      return res.json({
        success: true,
        message: 'Certificate already exists',
        data: { certificate: existingCertificate }
      });
    }

    // Get user progress for this category
    const categoryModules = await getCategoryModules(category);
    const userProgress = await getUserProgressForCategory(user.id, categoryModules);
    
    // Check if all required modules/simulations are completed
    const isComplete = checkCategoryCompletion(userProgress, category);

    if (!isComplete.complete) {
      return res.status(400).json({
        success: false,
        message: 'Category not completed yet',
        data: {
          missing: isComplete.missing,
          progress: isComplete.progress
        }
      });
    }

    // Calculate total completion time
    const completionTime = calculateCompletionTime(userProgress);

    // Generate metadata (for AI reporting)
    const metadata = generateMetadata(userProgress);

    // Create certificate
    const certificate = await prisma.certificate.create({
      data: {
        userId: user.id,
        category,
        title: getCategoryTitle(category),
        description: getCategoryDescription(category),
        completionTime,
        metadata: JSON.stringify(metadata),
        earnedAt: new Date()
      }
    });

    // Generate PDF certificate
    const pdfUrl = await generateCertificate(certificate, user);

    // Update certificate with PDF URL
    const updatedCertificate = await prisma.certificate.update({
      where: { id: certificate.id },
      data: { certificateUrl: pdfUrl }
    });

    res.json({
      success: true,
      message: 'Certificate generated successfully',
      data: { certificate: updatedCertificate }
    });
  } catch (error) {
    next(error);
  }
}

// Check and auto-generate certificate if category completed
export async function checkCategoryCompletion(req, res, next) {
  try {
    const { publicId } = req.user;
    const { category } = req.params;

    const user = await prisma.user.findUnique({ where: { publicId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get category modules
    const modules = await getCategoryModules(category);
    
    // Get user progress
    const progress = await getUserProgressForCategory(user.id, modules);
    
    // Check completion
    const completion = checkCategoryCompletionStatus(progress, category);

    // If complete, generate certificate
    if (completion.complete) {
      // Check if certificate already exists
      const existing = await prisma.certificate.findFirst({
        where: {
          userId: user.id,
          category
        }
      });

      if (!existing) {
        // Generate certificate
        const completionTime = calculateCompletionTime(progress);
        const metadata = await generateMetadata(user.id, progress, category);

        const certificate = await prisma.certificate.create({
          data: {
            userId: user.id,
            category,
            title: getCategoryTitle(category),
            description: getCategoryDescription(category),
            completionTime,
            metadata: JSON.stringify(metadata),
            earnedAt: new Date()
          }
        });

        // Generate PDF
        const pdfUrl = await generateCertificate(certificate, user);
        await prisma.certificate.update({
          where: { id: certificate.id },
          data: { certificateUrl: pdfUrl }
        });

        return res.json({
          success: true,
          message: 'Certificate generated successfully',
          data: { 
            certificate,
            completion 
          }
        });
      }

      return res.json({
        success: true,
        message: 'Category already has certificate',
        data: { 
          certificate: existing,
          completion 
        }
      });
    }

    res.json({
      success: true,
      message: 'Category not yet completed',
      data: { completion }
    });
  } catch (error) {
    next(error);
  }
}

// Get AI report for certificate
export async function getCertificateReport(req, res, next) {
  try {
    const { publicId } = req.user;
    const { certificateId } = req.params;

    const user = await prisma.user.findUnique({ where: { publicId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const certificate = await prisma.certificate.findFirst({
      where: {
        id: certificateId,
        userId: user.id
      }
    });

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    // Generate advanced AI report
    const metadata = JSON.parse(certificate.metadata || '{}');
    
    console.log('📊 Generating AI report for certificate:', certificateId);
    console.log('📋 Metadata:', JSON.stringify(metadata, null, 2));
    
    // Get additional user progress data
    const userProgress = await prisma.moduleProgress.findMany({
      where: { userId: user.id },
      include: {
        module: {
          select: {
            title: true,
            course: {
              select: { category: true }
            }
          }
        }
      }
    });
    
    console.log('📈 User progress:', userProgress.length, 'modules');
    
    // Prepare user data for AI analysis
    const userData = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      accessLevel: user.accessLevel || 'beginner'
    };
    
    // Try to generate real AI report first, fallback to pattern-based
    let report;
    try {
      // Try real AI service (OpenAI if configured)
      report = await generateAIReport(userData, certificate, metadata);
      console.log('✅ AI report generated successfully');
    } catch (aiError) {
      console.error('❌ AI report error, using fallback:', aiError.message);
      // Fallback to pattern-based analysis
    try {
      report = generateAdvancedAIReport(certificate, metadata, userProgress);
        console.log('✅ Fallback report generated successfully');
    } catch (reportError) {
        console.error('❌ Fallback report error:', reportError);
        // Final fallback
      report = {
        summary: 'Rapor oluşturulurken bir hata oluştu.',
        strengths: [],
        areasForImprovement: ['Lütfen sistem yöneticisine bildirin.'],
        recommendations: []
      };
      }
    }

    res.json({
      success: true,
      data: { report }
    });
  } catch (error) {
    console.error('❌ Error in getCertificateReport:', error);
    next(error);
  }
}

// Helper functions
async function getCategoryModules(category) {
  const categoryMap = {
    'siber-guvenlik': [
      'Temel Siber Güvenlik',
      'Network Güvenliği',
      'Malware Analizi',
      'Threat Hunting',
      'Penetration Testing'
    ],
    'bulut-bilisim': [
      'AWS Temelleri',
      'Azure Temelleri',
      'Google Cloud Platform'
    ],
    'veri-bilimi': [
      'Python Veri Analizi',
      'Makine Öğrenmesi',
      'Derin Öğrenme'
    ]
  };

  return categoryMap[category] || [];
}

async function getUserProgressForCategory(userId, modules) {
  // Get progress from database (ModuleProgress table)
  const progress = [];
  
  for (const moduleName of modules) {
    // Find module by title in courses
    const module = await prisma.module.findFirst({
      where: {
        title: moduleName
      },
      include: {
        course: true
      }
    });
    
    if (module) {
      const moduleProgress = await prisma.moduleProgress.findFirst({
        where: {
          userId: userId,
          moduleId: module.id
        }
      });
      
      if (moduleProgress) {
        progress.push({
          moduleName,
          moduleId: module.id,
          percentage: moduleProgress.percentComplete,
          isCompleted: moduleProgress.isCompleted,
          timeSpentMinutes: moduleProgress.timeSpentMinutes || 0,
          status: moduleProgress.isCompleted ? 'Tamamlandı' : 'Devam Ediyor'
        });
      } else {
        progress.push({
          moduleName,
          moduleId: module.id,
          percentage: 0,
          isCompleted: false,
          timeSpentMinutes: 0,
          status: 'Başlanmadı'
        });
      }
    }
  }
  
  return progress;
}

function checkCategoryCompletionStatus(progress, category) {
  const total = progress.length;
  const completed = progress.filter(p => p.isCompleted || p.status === 'Tamamlandı').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const missing = progress
    .filter(p => !p.isCompleted && p.status !== 'Tamamlandı')
    .map(p => p.moduleName);
  
  return {
    complete: completed === total && total > 0,
    missing,
    progress: percentage,
    completed,
    total
  };
}

function calculateCompletionTime(progress) {
  // Sum all time spent in minutes
  return progress.reduce((total, p) => total + (p.timeSpentMinutes || 0), 0);
}

async function generateMetadata(userId, progress, category) {
  const metadata = {
    modules: progress.map(p => ({
      name: p.moduleName,
      completionTime: p.timeSpentMinutes || 0,
      status: p.status,
      percentage: p.percentage
    })),
    simulations: [],
    quizResults: [],
    errors: [],
    avgScore: 0,
    totalTime: calculateCompletionTime(progress)
  };

  // Get simulation runs for this category
  const modules = await getCategoryModules(category);
  const moduleIds = [];
  
  for (const moduleName of modules) {
    const module = await prisma.module.findFirst({
      where: { title: moduleName }
    });
    if (module) {
      moduleIds.push(module.id);
    }
  }

  const simulations = await prisma.simulationRun.findMany({
    where: {
      userId,
      moduleId: { in: moduleIds }
    }
  });

  metadata.simulations = simulations.map(s => ({
    name: s.simulationId,
    score: s.score,
    timeSpent: s.timeSpent,
    flagsFound: s.flagsFound.length
  }));

  // Get quiz results from module progress metadata
  for (const moduleProgress of progress) {
    if (moduleProgress.moduleId) {
      const mp = await prisma.moduleProgress.findFirst({
        where: {
          userId,
          moduleId: moduleProgress.moduleId
        }
      });

      if (mp?.lastStep) {
        try {
          const moduleMetadata = JSON.parse(mp.lastStep);
          if (moduleMetadata.quizResults) {
            metadata.quizResults.push(...moduleMetadata.quizResults);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }

  // Calculate average score
  const allScores = [
    ...metadata.simulations.map(s => s.score || 0),
    ...metadata.quizResults.map(q => q.score || 0)
  ].filter(s => s > 0);

  if (allScores.length > 0) {
    metadata.avgScore = Math.round(
      allScores.reduce((sum, s) => sum + s, 0) / allScores.length
    );
  }

  // Extract errors from wrong answers
  metadata.errors = metadata.quizResults
    .flatMap(q => q.wrongAnswers || [])
    .filter((v, i, a) => a.indexOf(v) === i); // unique

  return metadata;
}

function getCategoryTitle(category) {
  const titles = {
    'siber-guvenlik': 'Siber Güvenlik Uzmanı',
    'bulut-bilisim': 'Bulut Bilişim Uzmanı',
    'veri-bilimi': 'Veri Bilimi Uzmanı'
  };
  return titles[category] || category;
}

function getCategoryDescription(category) {
  return `${getCategoryTitle(category)} sertifikasyon programını başarıyla tamamladınız.`;
}

