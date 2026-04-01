#!/usr/bin/env node
/**
 * SEBS Global - Production Maintenance & Test Suite
 * Comprehensive testing and maintenance for production deployment
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_BASE || 'http://localhost:8006';
const TEST_TIMEOUT = 5000;

// Test results
const results = {
    passed: [],
    failed: [],
    warnings: [],
    skipped: []
};

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(70));
    log(title, 'cyan');
    console.log('='.repeat(70));
}

// ============================================
// 1. ENVIRONMENT & CONFIGURATION TESTS
// ============================================
function testEnvironment() {
    logSection('1. ENVIRONMENT & CONFIGURATION TESTS');
    
    // Check .env file
    if (fs.existsSync('.env')) {
        results.passed.push('✅ .env file exists');
        log('✅ .env file exists', 'green');
        
        // Check critical env variables
        require('dotenv').config();
        const requiredVars = ['JWT_SECRET', 'DATABASE_URL'];
        const missing = requiredVars.filter(v => !process.env[v]);
        
        if (missing.length === 0) {
            results.passed.push('✅ Critical environment variables set');
            log('✅ Critical environment variables set', 'green');
        } else {
            results.failed.push(`❌ Missing environment variables: ${missing.join(', ')}`);
            log(`❌ Missing environment variables: ${missing.join(', ')}`, 'red');
        }
    } else {
        results.failed.push('❌ .env file not found');
        log('❌ .env file not found', 'red');
    }
    
    // Check .gitignore
    if (fs.existsSync('.gitignore')) {
        const gitignore = fs.readFileSync('.gitignore', 'utf8');
        if (gitignore.includes('.env')) {
            results.passed.push('✅ .env in .gitignore');
            log('✅ .env in .gitignore', 'green');
        } else {
            results.warnings.push('⚠️  .env not in .gitignore');
            log('⚠️  .env not in .gitignore', 'yellow');
        }
    }
}

// ============================================
// 2. FILE STRUCTURE TESTS
// ============================================
function testFileStructure() {
    logSection('2. FILE STRUCTURE TESTS');
    
    const criticalFiles = [
        { path: 'index.html', desc: 'Main page' },
        { path: 'backend/server.js', desc: 'Server file' },
        { path: 'package.json', desc: 'Package config' },
        { path: 'frontend/utils/api-client.js', desc: 'API client' },
        { path: 'frontend/utils/module-progress.js', desc: 'Progress tracker' }
    ];
    
    criticalFiles.forEach(file => {
        if (fs.existsSync(file.path)) {
            const stat = fs.statSync(file.path);
            if (stat.size > 0) {
                results.passed.push(`✅ ${file.desc}: ${(stat.size/1024).toFixed(1)} KB`);
                log(`✅ ${file.desc}: ${(stat.size/1024).toFixed(1)} KB`, 'green');
            } else {
                results.failed.push(`❌ ${file.desc}: Empty file`);
                log(`❌ ${file.desc}: Empty file`, 'red');
            }
        } else {
            results.failed.push(`❌ ${file.desc}: Not found`);
            log(`❌ ${file.desc}: Not found`, 'red');
        }
    });
}

// ============================================
// 3. SECURITY TESTS
// ============================================
function testSecurity() {
    logSection('3. SECURITY TESTS');
    
    // Check for console.log in production files
    const filesToCheck = [
        'frontend/utils/api-client.js',
        'frontend/utils/module-progress.js',
        'backend/server.js'
    ];
    
    let totalLogs = 0;
    filesToCheck.forEach(file => {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            const logs = (content.match(/console\.(log|warn|debug|info)/g) || []).length;
            totalLogs += logs;
            
            if (logs > 0) {
                results.warnings.push(`⚠️  ${file}: ${logs} console.log found`);
                log(`⚠️  ${file}: ${logs} console.log found`, 'yellow');
            } else {
                results.passed.push(`✅ ${file}: No console.log`);
                log(`✅ ${file}: No console.log`, 'green');
            }
        }
    });
    
    if (totalLogs > 0) {
        results.warnings.push(`⚠️  Total: ${totalLogs} console.log statements (should use logger in production)`);
        log(`⚠️  Total: ${totalLogs} console.log statements`, 'yellow');
    }
    
    // Check for hardcoded secrets
    const secretPatterns = [
        /password\s*=\s*['"][^'"]+['"]/i,
        /secret\s*=\s*['"][^'"]+['"]/i,
        /api[_-]?key\s*=\s*['"][^'"]+['"]/i
    ];
    
    let foundSecrets = false;
    filesToCheck.forEach(file => {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            secretPatterns.forEach(pattern => {
                if (pattern.test(content)) {
                    foundSecrets = true;
                    results.failed.push(`❌ Potential hardcoded secret in ${file}`);
                    log(`❌ Potential hardcoded secret in ${file}`, 'red');
                }
            });
        }
    });
    
    if (!foundSecrets) {
        results.passed.push('✅ No hardcoded secrets found');
        log('✅ No hardcoded secrets found', 'green');
    }
}

// ============================================
// 4. API ENDPOINT TESTS
// ============================================
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;
        
        const req = client.request({
            hostname: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {},
            timeout: options.timeout || TEST_TIMEOUT
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, data: json, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data, headers: res.headers });
                }
            });
        });
        
        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function testAPIEndpoints() {
    logSection('4. API ENDPOINT TESTS');
    
    const endpoints = [
        { path: '/api/health', method: 'GET', auth: false, expectedStatus: 200 },
        { path: '/api/modules', method: 'GET', auth: false, expectedStatus: [200, 401] },
        { path: '/api/auth/register', method: 'POST', auth: false, expectedStatus: [200, 400] },
        { path: '/api/progress/overview', method: 'GET', auth: true, expectedStatus: [200, 401] }
    ];
    
    for (const endpoint of endpoints) {
        try {
            const url = `${API_BASE}${endpoint.path}`;
            const headers = endpoint.auth ? { 'Authorization': 'Bearer test-token' } : {};
            
            const response = await makeRequest(url, {
                method: endpoint.method,
                headers: headers,
                body: endpoint.method === 'POST' ? JSON.stringify({}) : undefined
            });
            
            const expected = Array.isArray(endpoint.expectedStatus) 
                ? endpoint.expectedStatus 
                : [endpoint.expectedStatus];
            
            if (expected.includes(response.status)) {
                results.passed.push(`✅ ${endpoint.method} ${endpoint.path}: ${response.status}`);
                log(`✅ ${endpoint.method} ${endpoint.path}: ${response.status}`, 'green');
            } else {
                results.failed.push(`❌ ${endpoint.method} ${endpoint.path}: Expected ${expected.join(' or ')}, got ${response.status}`);
                log(`❌ ${endpoint.method} ${endpoint.path}: Expected ${expected.join(' or ')}, got ${response.status}`, 'red');
            }
        } catch (error) {
            if (error.message === 'Request timeout') {
                results.failed.push(`❌ ${endpoint.method} ${endpoint.path}: Timeout`);
                log(`❌ ${endpoint.method} ${endpoint.path}: Timeout`, 'red');
            } else {
                results.failed.push(`❌ ${endpoint.method} ${endpoint.path}: ${error.message}`);
                log(`❌ ${endpoint.method} ${endpoint.path}: ${error.message}`, 'red');
            }
        }
    }
}

// ============================================
// 5. DATABASE CONNECTION TEST
// ============================================
async function testDatabase() {
    logSection('5. DATABASE CONNECTION TEST');
    
    try {
        const response = await makeRequest(`${API_BASE}/api/health`);
        
        if (response.status === 200 && response.data) {
            if (response.data.database && response.data.database.status === 'connected') {
                results.passed.push('✅ Database connection: Connected');
                log('✅ Database connection: Connected', 'green');
            } else {
                results.failed.push('❌ Database connection: Not connected');
                log('❌ Database connection: Not connected', 'red');
            }
        } else {
            results.failed.push('❌ Health check failed');
            log('❌ Health check failed', 'red');
        }
    } catch (error) {
        results.failed.push(`❌ Database test failed: ${error.message}`);
        log(`❌ Database test failed: ${error.message}`, 'red');
    }
}

// ============================================
// 6. PERFORMANCE TESTS
// ============================================
async function testPerformance() {
    logSection('6. PERFORMANCE TESTS');
    
    const endpoints = ['/api/health', '/api/modules'];
    
    for (const endpoint of endpoints) {
        try {
            const start = Date.now();
            await makeRequest(`${API_BASE}${endpoint}`, { timeout: 10000 });
            const duration = Date.now() - start;
            
            if (duration < 1000) {
                results.passed.push(`✅ ${endpoint}: ${duration}ms (fast)`);
                log(`✅ ${endpoint}: ${duration}ms (fast)`, 'green');
            } else if (duration < 3000) {
                results.warnings.push(`⚠️  ${endpoint}: ${duration}ms (moderate)`);
                log(`⚠️  ${endpoint}: ${duration}ms (moderate)`, 'yellow');
            } else {
                results.failed.push(`❌ ${endpoint}: ${duration}ms (slow)`);
                log(`❌ ${endpoint}: ${duration}ms (slow)`, 'red');
            }
        } catch (error) {
            results.failed.push(`❌ ${endpoint}: ${error.message}`);
            log(`❌ ${endpoint}: ${error.message}`, 'red');
        }
    }
}

// ============================================
// 7. ERROR HANDLING TESTS
// ============================================
async function testErrorHandling() {
    logSection('7. ERROR HANDLING TESTS');
    
    // Test invalid endpoint
    try {
        const response = await makeRequest(`${API_BASE}/api/nonexistent`);
        if (response.status === 404) {
            results.passed.push('✅ 404 handling: Correct');
            log('✅ 404 handling: Correct', 'green');
        } else {
            results.warnings.push(`⚠️  404 handling: Got ${response.status} instead`);
            log(`⚠️  404 handling: Got ${response.status} instead`, 'yellow');
        }
    } catch (error) {
        results.failed.push(`❌ Error handling test failed: ${error.message}`);
        log(`❌ Error handling test failed: ${error.message}`, 'red');
    }
}

// ============================================
// MAIN EXECUTION
// ============================================
async function runAllTests() {
    console.log('\n');
    log('╔═══════════════════════════════════════════════════════════════╗', 'cyan');
    log('║     SEBS Global - Production Maintenance & Test Suite        ║', 'cyan');
    log('╚═══════════════════════════════════════════════════════════════╝', 'cyan');
    console.log('');
    
    testEnvironment();
    testFileStructure();
    testSecurity();
    await testAPIEndpoints();
    await testDatabase();
    await testPerformance();
    await testErrorHandling();
    
    // Summary
    logSection('TEST SUMMARY');
    
    log(`✅ Passed: ${results.passed.length}`, 'green');
    log(`❌ Failed: ${results.failed.length}`, 'red');
    log(`⚠️  Warnings: ${results.warnings.length}`, 'yellow');
    log(`⏭️  Skipped: ${results.skipped.length}`, 'blue');
    
    console.log('\n');
    
    if (results.failed.length > 0) {
        log('❌ CRITICAL ISSUES:', 'red');
        results.failed.forEach(item => log(`   ${item}`, 'red'));
    }
    
    if (results.warnings.length > 0) {
        log('\n⚠️  WARNINGS:', 'yellow');
        results.warnings.forEach(item => log(`   ${item}`, 'yellow'));
    }
    
    console.log('\n');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    
    if (results.failed.length === 0) {
        log('🎉 PRODUCTION READY! (Warnings can be addressed later)', 'green');
    } else {
        log('⚠️  PRODUCTION NOT READY - Fix critical issues first', 'red');
    }
    
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    console.log('\n');
    
    // Save report
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            passed: results.passed.length,
            failed: results.failed.length,
            warnings: results.warnings.length,
            skipped: results.skipped.length
        },
        results: results
    };
    
    fs.writeFileSync('production-test-report.json', JSON.stringify(report, null, 2));
    log('📄 Test report saved to: production-test-report.json', 'blue');
    
    process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
    log(`\n❌ Test suite error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});
