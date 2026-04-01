// Direct test data creation script
// Creates test user, progress, and certificate for demonstration

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestData() {
    try {
        console.log('🚀 Creating test data...\n');
        
        // 1. Create test user
        console.log('1️⃣ Creating test user...');
        
        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { email: 'testuser@sebs.com' }
        });
        
        if (!user) {
            // Hash password (simple - in real app use bcrypt)
            const bcrypt = await import('bcrypt');
            const passwordHash = await bcrypt.hash('Test1234!', 10);
            
            user = await prisma.user.create({
                data: {
                    email: 'testuser@sebs.com',
                    passwordHash: passwordHash,
                    firstName: 'Test',
                    lastName: 'User',
                    isVerified: true,
                    isActive: true
                }
            });
            console.log('✅ User created:', user.email);
        } else {
            console.log('ℹ️ User already exists:', user.email);
        }
        
        // 2. Find or create modules for siber-guvenlik category
        console.log('\n2️⃣ Finding modules...');
        
        // Find "Temel Siber Güvenlik" module
        const module = await prisma.module.findFirst({
            where: {
                title: {
                    contains: 'Siber',
                    mode: 'insensitive'
                }
            },
            include: { course: true }
        });
        
        let moduleId = null;
        if (module) {
            moduleId = module.id;
            console.log('✅ Found module:', module.title);
        } else {
            console.log('⚠️ Module not found, using dummy ID');
            // We'll need to create progress differently
        }
        
        // 3. Create module progress (60% complete, not 100%)
        console.log('\n3️⃣ Creating module progress...');
        
        if (moduleId) {
            const progress = await prisma.moduleProgress.upsert({
                where: {
                    userId_moduleId: {
                        userId: user.id,
                        moduleId: moduleId
                    }
                },
                create: {
                    userId: user.id,
                    moduleId: moduleId,
                    percentComplete: 60,
                    isCompleted: false,
                    timeSpentMinutes: 45,
                    lastStep: JSON.stringify({
                        quizResults: [
                            {
                                quizId: 'quiz-1',
                                score: 70,
                                correctAnswers: 7,
                                wrongAnswers: 3,
                                answers: [],
                                timeSpent: 600
                            },
                            {
                                quizId: 'quiz-2',
                                score: 65,
                                correctAnswers: 6.5,
                                wrongAnswers: 3.5,
                                answers: [],
                                timeSpent: 750
                            }
                        ],
                        avgScore: 67.5
                    })
                },
                update: {
                    percentComplete: 60,
                    isCompleted: false,
                    timeSpentMinutes: 45
                }
            });
            console.log('✅ Progress created:', progress.id);
        }
        
        // 4. Create simulation run with medium performance
        console.log('\n4️⃣ Creating simulation run...');
        
        if (moduleId) {
            const simulation = await prisma.simulationRun.create({
                data: {
                    userId: user.id,
                    moduleId: moduleId,
                    simulationId: 'temel-siber-guvenlik-lab',
                    score: 72,
                    flagsFound: ['SEBS{flag1}', 'SEBS{flag2}', 'SEBS{flag3}'],
                    timeSpent: 1800, // 30 minutes
                    attempts: 2
                }
            });
            console.log('✅ Simulation run created:', simulation.id);
        }
        
        // 5. Create certificate with test data
        console.log('\n5️⃣ Creating certificate...');
        
        const certificate = await prisma.certificate.create({
            data: {
                userId: user.id,
                category: 'siber-guvenlik',
                title: 'Siber Güvenlik Uzmanı',
                description: 'Siber Güvenlik sertifikasyon programını başarıyla tamamladınız.',
                completionTime: 120, // 2 hours (not great time)
                metadata: JSON.stringify({
                    modules: [
                        {
                            name: 'Temel Siber Güvenlik',
                            completionTime: 45,
                            status: 'Tamamlandı',
                            percentage: 100
                        },
                        {
                            name: 'Network Güvenliği',
                            completionTime: 60,
                            status: 'Tamamlandı',
                            percentage: 100
                        },
                        {
                            name: 'Malware Analizi',
                            completionTime: 30,
                            status: 'Tamamlandı',
                            percentage: 95
                        }
                    ],
                    simulations: [
                        {
                            name: 'temel-siber-guvenlik-lab',
                            score: 72,
                            timeSpent: 1800,
                            flagsFound: 3
                        },
                        {
                            name: 'network-security-lab',
                            score: 68,
                            timeSpent: 2400,
                            flagsFound: 2
                        }
                    ],
                    quizResults: [
                        {
                            quizId: 'quiz-1',
                            score: 70,
                            correctAnswers: 7,
                            wrongAnswers: 3
                        },
                        {
                            quizId: 'quiz-2',
                            score: 65,
                            correctAnswers: 6.5,
                            wrongAnswers: 3.5
                        },
                        {
                            quizId: 'quiz-3',
                            score: 62,
                            correctAnswers: 6,
                            wrongAnswers: 4
                        }
                    ],
                    errors: [
                        'SQL Injection',
                        'XSS Prevention',
                        'Firewall Configuration'
                    ],
                    avgScore: 66, // Below 70
                    totalTime: 120
                }),
                earnedAt: new Date()
            }
        });
        
        console.log('✅ Certificate created:', certificate.id);
        
        // 6. Generate AI report
        console.log('\n6️⃣ Generating AI report...');
        
        const metadata = JSON.parse(certificate.metadata);
        
        // Calculate report
        const report = {
            summary: `Bu sertifika ${Math.round(certificate.completionTime / 60)} saatte tamamlandı. ${metadata.modules?.length || 0} modül ve ${metadata.simulations?.length || 0} simülasyon başarıyla tamamlandı.`,
            strengths: [],
            areasForImprovement: [],
            recommendations: []
        };
        
        // Analyze based on avgScore
        if (metadata.avgScore >= 70 && metadata.avgScore < 80) {
            report.areasForImprovement.push('Başarı oranınız %' + metadata.avgScore + ' - İyileştirme için ek çalışma önerilir');
        } else if (metadata.avgScore < 70) {
            report.areasForImprovement.push('Başarı oranınız %' + metadata.avgScore + ' - Bu alanlarda daha fazla pratik yapmalısınız');
            report.areasForImprovement.push('Temel konuları tekrar gözden geçirmeniz önerilir');
        }
        
        if (metadata.errors && metadata.errors.length > 0) {
            report.areasForImprovement.push(
                `${metadata.errors.length} farklı konuda hata tespit edildi. Bu konularda ek çalışma yapmanız önerilir.`
            );
        }
        
        if (metadata.simulations) {
            const avgSimScore = metadata.simulations.reduce((sum, s) => sum + (s.score || 0), 0) / metadata.simulations.length;
            if (avgSimScore < 80) {
                report.areasForImprovement.push('Simülasyonlarda daha fazla pratik yapmanız önerilir');
            }
        }
        
        report.recommendations.push(
            'Temel konuları tekrar gözden geçirin',
            'Daha fazla pratik yapın',
            'Simülasyonları tekrar çözün',
            'Eksik konularda ek kaynaklar inceleyin'
        );
        
        console.log('\n📊 AI REPORT:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n📋 ÖZET:');
        console.log(report.summary);
        console.log('\n✅ GÜÇLÜ YÖNLER:');
        report.strengths.forEach(s => console.log('  •', s));
        if (report.strengths.length === 0) {
            console.log('  (Güçlü yön bulunamadı)');
        }
        console.log('\n📈 GELİŞTİRİLMESİ GEREKEN ALANLAR:');
        report.areasForImprovement.forEach(a => console.log('  •', a));
        console.log('\n💡 ÖNERİLER:');
        report.recommendations.forEach(r => console.log('  •', r));
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        console.log('\n✅ Test data created successfully!');
        console.log('\n📝 Login Credentials:');
        console.log('  Email: testuser@sebs.com');
        console.log('  Password: Test1234!');
        console.log('\n🎓 Certificate ID:', certificate.id);
        console.log('📊 View in dashboard after login');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestData();

