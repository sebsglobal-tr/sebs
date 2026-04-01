/**
 * Comprehensive Security Audit
 * Kapsamlı Güvenlik Denetimi
 */

const fs = require('fs');
const path = require('path');

const issues = {
    critical: [],
    high: [],
    medium: [],
    low: [],
    info: []
};

function logIssue(severity, category, issue, file, line = null) {
    const entry = {
        category,
        issue,
        file,
        line
    };
    
    issues[severity].push(entry);
    
    const icon = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢',
        info: 'ℹ️'
    }[severity];
    
    console.log(`${icon} [${severity.toUpperCase()}] ${category}: ${issue}`);
    if (file) console.log(`   📁 ${file}${line ? `:${line}` : ''}`);
}

function scanFile(filePath, content) {
    const fileName = path.basename(filePath);
    const lines = content.split('\n');
    
    // SQL Injection risks
    if (content.includes('pool.query') || content.includes('db.query')) {
        const sqlQueries = content.match(/pool\.query\([^)]+\)/g) || [];
        sqlQueries.forEach((query, idx) => {
            if (!query.includes('$') && !query.includes('?') && query.includes('${')) {
                const lineNum = content.substring(0, content.indexOf(query)).split('\n').length;
                logIssue('critical', 'SQL Injection', 
                    'Potential SQL injection - using template literals instead of parameterized queries', 
                    filePath, lineNum);
            }
        });
    }
    
    // XSS vulnerabilities
    if (content.includes('innerHTML') || content.includes('dangerouslySetInnerHTML')) {
        lines.forEach((line, idx) => {
            if (line.includes('innerHTML') || line.includes('dangerouslySetInnerHTML')) {
                if (!line.includes('DOMPurify') && !line.includes('sanitize')) {
                    logIssue('high', 'XSS', 
                        'Potential XSS vulnerability - innerHTML without sanitization', 
                        filePath, idx + 1);
                }
            }
        });
    }
    
    // Hardcoded secrets
    const secretPatterns = [
        /password\s*[:=]\s*['"][^'"]+['"]/i,
        /secret\s*[:=]\s*['"][^'"]+['"]/i,
        /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
        /token\s*[:=]\s*['"][^'"]+['"]/i,
        /jwt[_-]?secret\s*[:=]\s*['"][^'"]+['"]/i
    ];
    
    secretPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
            matches.forEach(match => {
                const lineNum = content.substring(0, content.indexOf(match)).split('\n').length;
                logIssue('critical', 'Secrets', 
                    `Hardcoded secret found: ${match.substring(0, 50)}...`, 
                    filePath, lineNum);
            });
        }
    });
    
    // Console.log in production
    if (content.includes('console.log') || content.includes('console.error')) {
        lines.forEach((line, idx) => {
            if (line.includes('console.log') || line.includes('console.error')) {
                if (!line.includes('process.env.NODE_ENV') && !line.includes('DEBUG')) {
                    logIssue('medium', 'Logging', 
                        'Console.log found - should be conditional in production', 
                        filePath, idx + 1);
                }
            }
        });
    }
    
    // eval() usage
    if (content.includes('eval(')) {
        lines.forEach((line, idx) => {
            if (line.includes('eval(')) {
                logIssue('critical', 'Code Injection', 
                    'eval() usage - potential code injection vulnerability', 
                    filePath, idx + 1);
            }
        });
    }
    
    // Weak password hashing
    if (content.includes('bcrypt.hash') || content.includes('bcryptjs.hash')) {
        const hashMatches = content.match(/bcrypt(js)?\.hash\([^,]+,\s*(\d+)\)/);
        if (hashMatches && parseInt(hashMatches[2]) < 10) {
            const lineNum = content.substring(0, content.indexOf(hashMatches[0])).split('\n').length;
            logIssue('high', 'Password Security', 
                `Weak bcrypt salt rounds: ${hashMatches[2]} (should be >= 10)`, 
                filePath, lineNum);
        }
    }
    
    // Missing input validation
    if (content.includes('req.body') || content.includes('req.query') || content.includes('req.params')) {
        if (!content.includes('validate') && !content.includes('sanitize') && 
            !content.includes('zod') && !content.includes('joi') && 
            fileName.includes('server.js') || fileName.includes('controller')) {
            logIssue('high', 'Input Validation', 
                'Missing input validation - req.body/query/params used without validation', 
                filePath);
        }
    }
    
    // CORS misconfiguration
    if (content.includes('cors()') && !content.includes('cors({')) {
        logIssue('medium', 'CORS', 
            'CORS configured without options - may allow all origins', 
            filePath);
    }
    
    // Missing rate limiting
    if (content.includes('app.post') || content.includes('app.get') || content.includes('app.put')) {
        if (!content.includes('rateLimit') && !content.includes('rate-limit') && 
            fileName.includes('server.js')) {
            logIssue('high', 'Rate Limiting', 
                'Missing rate limiting on API endpoints', 
                filePath);
        }
    }
    
    // Missing Helmet
    if (fileName.includes('server.js') && !content.includes('helmet')) {
        logIssue('high', 'Security Headers', 
            'Missing Helmet.js for security headers', 
            filePath);
    }
    
    // JWT secret weak
    if (content.includes('jwt.sign') || content.includes('jwt.verify')) {
        if (content.includes('secret') && content.includes("'") && 
            (content.includes('your-secret') || content.includes('change-in-production'))) {
            logIssue('critical', 'JWT Security', 
                'Weak or default JWT secret found', 
                filePath);
        }
    }
    
    // Missing CSRF protection
    if (content.includes('app.post') && !content.includes('csurf') && 
        !content.includes('csrf') && fileName.includes('server.js')) {
        logIssue('medium', 'CSRF', 
            'Missing CSRF protection for POST endpoints', 
            filePath);
    }
    
    // Error information leakage
    if (content.includes('res.status(500)') || content.includes('res.status(400)')) {
        lines.forEach((line, idx) => {
            if (line.includes('error.message') || line.includes('error.stack')) {
                if (!line.includes('process.env.NODE_ENV') && !line.includes('development')) {
                    logIssue('high', 'Error Handling', 
                        'Error details exposed to client - potential information leakage', 
                        filePath, idx + 1);
                }
            }
        });
    }
}

function scanDirectory(dir, extensions = ['.js', '.html', '.jsx', '.ts', '.tsx']) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    files.forEach(file => {
        const fullPath = path.join(dir, file.name);
        
        // Skip node_modules and other directories
        if (file.isDirectory()) {
            if (file.name !== 'node_modules' && file.name !== '.git' && 
                file.name !== 'dist' && file.name !== 'build') {
                scanDirectory(fullPath, extensions);
            }
        } else if (file.isFile()) {
            const ext = path.extname(file.name);
            if (extensions.includes(ext)) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    scanFile(fullPath, content);
                } catch (err) {
                    // Skip binary files
                }
            }
        }
    });
}

function generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 GÜVENLİK DENETİM RAPORU');
    console.log('='.repeat(70) + '\n');
    
    const total = issues.critical.length + issues.high.length + 
                  issues.medium.length + issues.low.length + issues.info.length;
    
    console.log(`🔴 Critical: ${issues.critical.length}`);
    console.log(`🟠 High: ${issues.high.length}`);
    console.log(`🟡 Medium: ${issues.medium.length}`);
    console.log(`🟢 Low: ${issues.low.length}`);
    console.log(`ℹ️  Info: ${issues.info.length}`);
    console.log(`\n📊 Toplam: ${total} sorun tespit edildi\n`);
    
    if (total === 0) {
        console.log('✅ Hiç güvenlik sorunu tespit edilmedi!\n');
        return;
    }
    
    // Group by category
    const byCategory = {};
    Object.values(issues).flat().forEach(issue => {
        if (!byCategory[issue.category]) {
            byCategory[issue.category] = [];
        }
        byCategory[issue.category].push(issue);
    });
    
    console.log('📋 Kategori Bazında Özet:\n');
    Object.entries(byCategory).sort((a, b) => b[1].length - a[1].length).forEach(([cat, items]) => {
        console.log(`   ${cat}: ${items.length} sorun`);
    });
    
    return {
        total,
        bySeverity: {
            critical: issues.critical.length,
            high: issues.high.length,
            medium: issues.medium.length,
            low: issues.low.length,
            info: issues.info.length
        },
        byCategory,
        issues
    };
}

// Main execution
console.log('🔍 Kapsamlı güvenlik denetimi başlatılıyor...\n');
console.log('='.repeat(70));

// Scan current directory
const rootDir = process.cwd();
scanDirectory(rootDir);

// Generate report
const report = generateReport();

// Save report
if (report && report.total > 0) {
    fs.writeFileSync('SECURITY_AUDIT_REPORT.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detaylı rapor SECURITY_AUDIT_REPORT.json dosyasına kaydedildi.\n');
}

module.exports = { generateReport, scanFile, scanDirectory };

