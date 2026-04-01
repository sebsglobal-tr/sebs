// Seed Database with Courses and Modules
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const courses = [
    // BAŞLANGIÇ SEVİYESİ
  {
    title: 'Siber Güvenliğe Giriş',
    category: 'cybersecurity',
    level: 'beginner',
    sortOrder: 1,
    modules: [
      { title: 'Giriş', description: 'Siber güvenliğe giriş', order: 0, type: 'lesson' },
      { title: 'CIA Triad', description: 'Confidentiality, Integrity, Availability', order: 1, type: 'lesson' },
      { title: 'Siber Güvenlik Kavramları', description: 'Temel kavramlar', order: 2, type: 'lesson' },
      { title: 'Tehdit Türleri', description: 'Farklı tehdit türleri', order: 3, type: 'lesson' },
      { title: 'Güvenlik Prensipleri', description: 'Güvenlik prensipleri', order: 4, type: 'lesson' },
      { title: 'Risk Yönetimi', description: 'Risk yönetimi', order: 5, type: 'lesson' },
    ]
  },
  {
    title: 'Temel Network Eğitimi',
    category: 'cybersecurity',
    level: 'beginner',
    sortOrder: 2,
    modules: [
      { title: 'TCP/IP Protokol Yığını', description: 'TCP/IP temelleri', order: 0, type: 'lesson' },
      { title: 'OSI Modeli', description: 'OSI referans modeli', order: 1, type: 'lesson' },
      { title: 'Subnetting ve IP Adresleme', description: 'IP adresleme ve subnetting', order: 2, type: 'lesson' },
      { title: 'Network Cihazları', description: 'Router, switch, hub', order: 3, type: 'lesson' },
      { title: 'Network Topolojileri', description: 'Ağ topolojileri', order: 4, type: 'lesson' },
    ]
  },
  {
    title: 'İşletim Sistemleri Güvenliği (Temel)',
    category: 'cybersecurity',
    level: 'beginner',
    sortOrder: 3,
    modules: [
      { title: 'Windows Temel Güvenlik', description: 'Windows güvenlik ayarları', order: 0, type: 'lesson' },
      { title: 'Linux Temel Hardening', description: 'Linux temel güvenlik', order: 1, type: 'lesson' },
      { title: 'User ve Grup Yönetimi', description: 'Kullanıcı yönetimi', order: 2, type: 'lesson' },
      { title: 'Temel Sistem İzleme', description: 'Sistem izleme', order: 3, type: 'lesson' },
    ]
  },
  {
    title: 'Temel Kriptografi',
    category: 'cybersecurity',
    level: 'beginner',
    sortOrder: 4,
    modules: [
      { title: 'Simetrik Şifreleme', description: 'AES, DES algoritmaları', order: 0, type: 'lesson' },
      { title: 'Asimetrik Şifreleme', description: 'RSA, ECC algoritmaları', order: 1, type: 'lesson' },
      { title: 'Hash Fonksiyonları', description: 'SHA, MD5', order: 2, type: 'lesson' },
      { title: 'Dijital İmzalar', description: 'Dijital imza teknolojileri', order: 3, type: 'lesson' },
      { title: 'PKI (Public Key Infrastructure)', description: 'PKI yapısı', order: 4, type: 'lesson' },
    ]
  },
  {
    title: 'Sosyal Mühendisliğe Giriş',
    category: 'cybersecurity',
    level: 'beginner',
    sortOrder: 5,
    modules: [
      { title: 'Phishing Saldırıları', description: 'Phishing teknikleri', order: 0, type: 'lesson' },
      { title: 'Pretexting Teknikleri', description: 'Pretexting', order: 1, type: 'lesson' },
      { title: 'Fiziksel Güvenlik', description: 'Fiziksel güvenlik önlemleri', order: 2, type: 'lesson' },
      { title: 'Korunma Stratejileri', description: 'Sosyal mühendislikten korunma', order: 3, type: 'lesson' },
    ]
  },
  // ORTA SEVİYE
  {
    title: 'Network Güvenliği',
    category: 'cybersecurity',
    level: 'intermediate',
    sortOrder: 6,
    modules: [
      { title: 'Giriş ve Tanıtım', description: 'Network güvenliğine giriş', order: 0, type: 'lesson' },
      { title: 'Firewall Yapılandırması', description: 'Firewall yapılandırması', order: 1, type: 'lesson' },
      { title: 'VPN Teknolojileri', description: 'VPN teknolojileri', order: 2, type: 'lesson' },
      { title: 'Network İzleme', description: 'Network izleme', order: 3, type: 'lesson' },
      { title: 'Intrusion Detection Systems', description: 'IDS/IPS sistemleri', order: 4, type: 'lesson' },
      { title: 'Lab: Firewall Yapılandırması', description: 'Firewall lab', order: 5, type: 'lab' },
    ]
  },
  {
    title: 'Web Uygulama Güvenliği',
    category: 'cybersecurity',
    level: 'intermediate',
    sortOrder: 7,
    modules: [
      { title: 'OWASP Top 10', description: 'OWASP güvenlik açıkları', order: 0, type: 'lesson' },
      { title: 'SQL Injection', description: 'SQL injection saldırıları', order: 1, type: 'lesson' },
      { title: 'XSS (Cross-Site Scripting)', description: 'XSS saldırıları', order: 2, type: 'lesson' },
      { title: 'CSRF Protection', description: 'CSRF koruması', order: 3, type: 'lesson' },
    ]
  },
  {
    title: 'Malware Analizi (Orta Seviye)',
    category: 'cybersecurity',
    level: 'intermediate',
    sortOrder: 8,
    modules: [
      { title: 'Static Malware Analizi', description: 'Static analiz teknikleri', order: 0, type: 'lesson' },
      { title: 'Dynamic Analiz Teknikleri', description: 'Dynamic analiz', order: 1, type: 'lesson' },
      { title: 'Sandbox Kullanımı', description: 'Sandbox ortamları', order: 2, type: 'lesson' },
      { title: 'Temel Reverse Engineering', description: 'Temel reverse engineering', order: 3, type: 'lesson' },
    ]
  },
  {
    title: 'SOC (Security Operations Center) Eğitimi',
    category: 'cybersecurity',
    level: 'intermediate',
    sortOrder: 9,
    modules: [
      { title: 'SIEM Sistemleri', description: 'SIEM teknolojileri', order: 0, type: 'lesson' },
      { title: 'Log Analysis', description: 'Log analizi', order: 1, type: 'lesson' },
      { title: 'Incident Response', description: 'Olay müdahalesi', order: 2, type: 'lesson' },
      { title: 'Security Monitoring', description: 'Güvenlik izleme', order: 3, type: 'lesson' },
    ]
  },
  {
    title: 'İşletim Sistemi Güvenliği (İleri Temel)',
    category: 'cybersecurity',
    level: 'intermediate',
    sortOrder: 10,
    modules: [
      { title: 'Gelişmiş Windows Hardening', description: 'Windows ileri güvenlik', order: 0, type: 'lesson' },
      { title: 'Linux Güvenlik Yapılandırmaları', description: 'Linux ileri güvenlik', order: 1, type: 'lesson' },
      { title: 'Access Control ve Permissions', description: 'Erişim kontrolü', order: 2, type: 'lesson' },
      { title: 'Gelişmiş Sistem İzleme', description: 'İleri sistem izleme', order: 3, type: 'lesson' },
    ]
  },
  {
    title: 'Temel Cloud Security',
    category: 'cybersecurity',
    level: 'intermediate',
    sortOrder: 11,
    modules: [
      { title: 'Cloud Güvenlik Modelleri', description: 'Cloud güvenlik modelleri', order: 0, type: 'lesson' },
      { title: 'Identity and Access Management', description: 'IAM yapılandırması', order: 1, type: 'lesson' },
      { title: 'Cloud Data Protection', description: 'Bulut veri koruması', order: 2, type: 'lesson' },
      { title: 'Temel Cloud Compliance', description: 'Cloud uyumluluk', order: 3, type: 'lesson' },
    ]
  },
  // İLERİ SEVİYE
  {
    title: 'İleri Malware Analizi & Reverse Engineering',
    category: 'cybersecurity',
    level: 'advanced',
    sortOrder: 12,
    modules: [
      { title: 'İleri Seviye Reverse Engineering', description: 'İleri reverse engineering', order: 0, type: 'lesson' },
      { title: 'Assembly ve Disassembly', description: 'Assembly programlama', order: 1, type: 'lesson' },
      { title: 'Obfuscation Teknikleri', description: 'Kod gizleme teknikleri', order: 2, type: 'lesson' },
      { title: 'Advanced Malware Analysis', description: 'İleri malware analizi', order: 3, type: 'lesson' },
    ]
  },
  {
    title: 'Olay Müdahalesi & Digital Forensics',
    category: 'cybersecurity',
    level: 'advanced',
    sortOrder: 13,
    modules: [
      { title: 'Incident Response Plan', description: 'Olay müdahale planı', order: 0, type: 'lesson' },
      { title: 'Digital Forensics Metodolojisi', description: 'Dijital adli bilişim', order: 1, type: 'lesson' },
      { title: 'Evidence Collection ve Preservation', description: 'Delil toplama', order: 2, type: 'lesson' },
      { title: 'Advanced Recovery Procedures', description: 'İleri kurtarma prosedürleri', order: 3, type: 'lesson' },
    ]
  },
  {
    title: 'İleri Kriptografi',
    category: 'cybersecurity',
    level: 'advanced',
    sortOrder: 14,
    modules: [
      { title: 'Kuantum Kriptografi', description: 'Kuantum şifreleme', order: 0, type: 'lesson' },
      { title: 'Homomorphic Encryption', description: 'Homomorphic şifreleme', order: 1, type: 'lesson' },
      { title: 'Post-Quantum Cryptography', description: 'Kuantum sonrası kriptografi', order: 2, type: 'lesson' },
      { title: 'Kriptanaliz Teknikleri', description: 'Şifre kırma teknikleri', order: 3, type: 'lesson' },
    ]
  },
  {
    title: 'Cloud Security (İleri)',
    category: 'cybersecurity',
    level: 'advanced',
    sortOrder: 15,
    modules: [
      { title: 'Multi-Cloud Security Architecture', description: 'Çoklu bulut güvenliği', order: 0, type: 'lesson' },
      { title: 'Container ve Kubernetes Güvenliği', description: 'Container güvenliği', order: 1, type: 'lesson' },
      { title: 'Serverless Security', description: 'Serverless güvenlik', order: 2, type: 'lesson' },
      { title: 'Cloud Compliance ve Governance', description: 'Bulut uyumluluk', order: 3, type: 'lesson' },
    ]
  },
  {
    title: 'Red Team & Pentest (İleri)',
    category: 'cybersecurity',
    level: 'advanced',
    sortOrder: 16,
    modules: [
      { title: 'İleri Seviye Penetrasyon Testi', description: 'İleri pentest', order: 0, type: 'lesson' },
      { title: 'Red Team Metodolojisi', description: 'Red team operasyonları', order: 1, type: 'lesson' },
      { title: 'Advanced Exploitation Teknikleri', description: 'İleri exploitation', order: 2, type: 'lesson' },
      { title: 'Post-Exploitation ve Persistence', description: 'Post-exploitation', order: 3, type: 'lesson' },
    ]
  },
  {
    title: 'Threat Intelligence',
    category: 'cybersecurity',
    level: 'advanced',
    sortOrder: 17,
    modules: [
      { title: 'Threat Intelligence Framework', description: 'Tehdit istihbarat çerçevesi', order: 0, type: 'lesson' },
      { title: 'IOC (Indicators of Compromise)', description: 'IOC analizi', order: 1, type: 'lesson' },
      { title: 'TTP (Tactics, Techniques, Procedures)', description: 'TTP analizi', order: 2, type: 'lesson' },
      { title: 'MITRE ATT&CK Framework', description: 'MITRE ATT&CK', order: 3, type: 'lesson' },
    ]
  }
];

async function main() {
  console.log('🌱 Seeding database...');

  for (const courseData of courses) {
    const { modules, ...courseFields } = courseData;
    
    // Check if course exists
    const existingCourse = await prisma.course.findFirst({
      where: { 
        title: courseFields.title,
        category: courseFields.category 
      },
      include: { modules: true }
    });

    if (existingCourse) {
      console.log(`ℹ️  Course already exists: ${courseFields.title}`);
      
      // Update course if needed
      const updatedCourse = await prisma.course.update({
        where: { id: existingCourse.id },
        data: {
          ...courseFields,
          modules: {
            deleteMany: {}, // Delete existing modules
            create: modules // Create new modules
          }
        }
      });
      
      console.log(`✅ Updated course: ${updatedCourse.title} with ${modules.length} modules`);
    } else {
      // Create new course
      const course = await prisma.course.create({
        data: {
          ...courseFields,
          modules: {
            create: modules
          }
        }
      });

      console.log(`✅ Created course: ${course.title} with ${modules.length} modules`);
    }
  }

  console.log('✨ Seeding finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

