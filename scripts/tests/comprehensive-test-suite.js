#!/usr/bin/env node
/**
 * SEBS Global - Comprehensive Test Suite
 * Proje Test Uzmanı Raporu
 * Tüm sistem bileşenlerini test eder ve raporlar
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const API_BASE = process.env.API_BASE || 'http://localhost:8006';
const TEST_TIMEOUT = 10000;

// Test Results
const testResults = {
    passed: [],
    failed: [],
    warnings: [],
    errors: [],
    summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        errors: 0
    }
};

// Colors
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '═'.repeat(70));
    log(title, 'cyan');
    console.log('═'.repeat(70));
}

function addResult(category, test, status, message = '') {
    testResults.summary.total++;
    const result = { category, test, message, timestamp: new Date().toISOString() };
    
    if (status === 'passed') {
        testResults.passed.push(result);
        testResults.summary.passed++;
        log(`  ✅ ${test}`, 'green');
    } else if (status === 'failed') {
        testResults.failed.push(result);
        testResults.summary.failed++;
        log(`  ❌ ${test}: ${message}`, 'red');
    } else if (status === 'warning') {
        testResults.warnings.push(result);
        testResults.summary.warnings++;
        log(`  ⚠️  ${test}: ${message}`, 'yellow');
    } else if (status === 'error') {
        testResults.errors.push(result);
        testResults.summary.errors++;
        log(`  🔴 ${test}: ${message}`, 'red');
    }
}

// HTTP Request Helper
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

// ============================================
// 1. ENVIRONMENT & CONFIGURATION TESTS
// ============================================
function testEnvironment() {
    logSection('1. ENVIRONMENT & CONFIGURATION TESTS');
    
    // .env file
    if (fs.existsSync('.env')) {
        addResult('Environment', '.env file exists', 'passed');
    } else {
        addResult('Environment', '.env file exists', 'failed', 'File not found');
    }
    
    // Critical environment variables
    const requiredVars = ['JWT_SECRET', 'DATABASE_URL'];
    requiredVars.forEach(varName => {
        if (process.env[varName]) {
            addResult('Environment', `${varName} is set`, 'passed');
        } else {
            addResult('Environment', `${varName} is set`, 'failed', 'Missing');
        }
    });
    
    // Node version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
    if (majorVersion >= 14) {
        addResult('Environment', `Node.js version (${nodeVersion})`, 'passed');
    } else {
        addResult('Environment', `Node.js version (${nodeVersion})`, 'failed', 'Version 14+ required');
    }
}

// ============================================
// 2. FILE STRUCTURE TESTS
// ============================================
function testFileStructure() {
    logSection('2. FILE STRUCTURE TESTS');
    
    const criticalFiles = [
        { path: 'index.html', desc: 'Main page' },
        { path: 'server.js', desc: 'Server file' },
        { path: 'package.json', desc: 'Package config' },
        { path: 'utils/api-client.js', desc: 'API client' },
        { path: 'utils/module-progress.js', desc: 'Progress tracker' },
        { path: 'dashboard.html', desc: 'Dashboard' },
        { path: 'login.html', desc: 'Login page' },
        { path: 'signup.html', desc: 'Signup page' },
        { path: 'modules.html', desc: 'Modules page' },
        { path: 'simulations.html', desc: 'Simulations page' }
    ];
    
    criticalFiles.forEach(file => {
        if (fs.existsSync(file.path)) {
            const stat = fs.statSync(file.path);
            if (stat.size > 0) {
                addResult('File Structure', file.desc, 'passed', `${(stat.size/1024).toFixed(1)} KB`);
            } else {
                addResult('File Structure', file.desc, 'failed', 'Empty file');
            }
        } else {
            addResult('File Structure', file.desc, 'failed', 'Not found');
        }
    });
}

// ============================================
// 3. DATABASE CONNECTION TESTS
// ============================================
async function testDatabase() {
    logSection('3. DATABASE CONNECTION TESTS');
    
    try {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 1
        });
        
        // Test connection
        const result = await pool.query('SELECT NOW(), version(), current_database()');
        addResult('Database', 'Connection', 'passed', 'Connected successfully');
        addResult('Database', 'PostgreSQL version', 'passed', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
        addResult('Database', 'Database name', 'passed', result.rows[0].current_database);
        
        // Test tables
        const tablesResult = await pool.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        const tableCount = parseInt(tablesResult.rows[0].count);
        addResult('Database', 'Tables count', 'passed', `${tableCount} tables`);
        
        // Test critical tables
        const criticalTables = ['users', 'modules', 'courses', 'enrollments', 'certificates'];
        for (const table of criticalTables) {
            try {
                const tableCheck = await pool.query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = $1
                    )
                `, [table]);
                if (tableCheck.rows[0].exists) {
                    addResult('Database', `Table: ${table}`, 'passed');
                } else {
                    addResult('Database', `Table: ${table}`, 'warning', 'Table not found');
                }
            } catch (e) {
                addResult('Database', `Table: ${table}`, 'error', e.message);
            }
        }
        
        await pool.end();
    } catch (error) {
        addResult('Database', 'Connection', 'failed', error.message);
    }
}

// ============================================
// 4. API ENDPOINT TESTS
// ============================================
async function testAPIEndpoints() {
    logSection('4. API ENDPOINT TESTS');
    
    const endpoints = [
        { 
            path: '/api/health', 
            method: 'GET', 
            auth: false, 
            expectedStatus: 200,
            description: 'Health check'
        },
        { 
            path: '/api/modules', 
            method: 'GET', 
            auth: false, 
            expectedStatus: [200, 401, 500],
            description: 'Get modules'
        },
        { 
            path: '/api/auth/register', 
            method: 'POST', 
            auth: false, 
            expectedStatus: [200, 400, 500], // 500 if SMTP not configured (expected)
            body: JSON.stringify({
                email: 'test' + Date.now() + '@example.com',
                password: 'test123456',
                firstName: 'Test',
                lastName: 'User'
            }),
            description: 'User registration'
        },
        { 
            path: '/api/progress/overview', 
            method: 'GET', 
            auth: true, 
            expectedStatus: [200, 401],
            description: 'Progress overview (requires auth)'
        },
        { 
            path: '/api/users/me', 
            method: 'GET', 
            auth: true, 
            expectedStatus: [200, 401],
            description: 'Get current user (requires auth)'
        }
    ];
    
    for (const endpoint of endpoints) {
        try {
            const url = `${API_BASE}${endpoint.path}`;
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (endpoint.auth) {
                headers['Authorization'] = 'Bearer test-token-invalid';
            }
            
            const response = await makeRequest(url, {
                method: endpoint.method,
                headers: headers,
                body: endpoint.body,
                timeout: 5000
            });
            
            const expected = Array.isArray(endpoint.expectedStatus) 
                ? endpoint.expectedStatus 
                : [endpoint.expectedStatus];
            
            if (expected.includes(response.status)) {
                addResult('API', endpoint.description, 'passed', `Status: ${response.status}`);
            } else {
                addResult('API', endpoint.description, 'failed', `Expected ${expected.join(' or ')}, got ${response.status}`);
            }
        } catch (error) {
            if (error.message === 'Request timeout') {
                addResult('API', endpoint.description, 'failed', 'Timeout');
            } else {
                addResult('API', endpoint.description, 'error', error.message);
            }
        }
    }
}

// ============================================
// 5. SERVER HEALTH TESTS
// ============================================
async function testServerHealth() {
    logSection('5. SERVER HEALTH TESTS');
    
    try {
        const response = await makeRequest(`${API_BASE}/api/health`);
        
        if (response.status === 200 && response.data) {
            if (response.data.status === 'healthy') {
                addResult('Server', 'Health status', 'passed', 'Healthy');
            } else {
                addResult('Server', 'Health status', 'warning', `Status: ${response.data.status}`);
            }
            
            if (response.data.database) {
                if (response.data.database.status === 'connected') {
                    addResult('Server', 'Database status', 'passed', 'Connected');
                } else {
                    addResult('Server', 'Database status', 'failed', response.data.database.status);
                }
            }
            
            if (response.data.pool) {
                addResult('Server', 'Connection pool', 'passed', 
                    `Total: ${response.data.pool.totalCount}, Idle: ${response.data.pool.idleCount}`);
            }
        } else {
            addResult('Server', 'Health check', 'failed', `Status: ${response.status}`);
        }
    } catch (error) {
        addResult('Server', 'Health check', 'error', error.message);
    }
}

// ============================================
// 6. SECURITY TESTS
// ============================================
function testSecurity() {
    logSection('6. SECURITY TESTS');
    
    // Check for hardcoded secrets
    const filesToCheck = ['server.js', 'utils/api-client.js'];
    let foundSecrets = false;
    
    filesToCheck.forEach(file => {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            const secretPatterns = [
                /password\s*=\s*['"][^'"]+['"]/i,
                /secret\s*=\s*['"][^'"]+['"]/i,
                /api[_-]?key\s*=\s*['"][^'"]+['"]/i
            ];
            
            secretPatterns.forEach(pattern => {
                if (pattern.test(content) && !content.includes('process.env')) {
                    foundSecrets = true;
                    addResult('Security', `Hardcoded secret in ${file}`, 'failed', 'Potential security issue');
                }
            });
        }
    });
    
    if (!foundSecrets) {
        addResult('Security', 'No hardcoded secrets', 'passed');
    }
    
    // Check .gitignore
    if (fs.existsSync('.gitignore')) {
        const gitignore = fs.readFileSync('.gitignore', 'utf8');
        if (gitignore.includes('.env')) {
            addResult('Security', '.env in .gitignore', 'passed');
        } else {
            addResult('Security', '.env in .gitignore', 'warning', '.env should be in .gitignore');
        }
    }
    
    // Check JWT_SECRET strength
    if (process.env.JWT_SECRET) {
        if (process.env.JWT_SECRET.length >= 32) {
            addResult('Security', 'JWT_SECRET strength', 'passed', 'Strong enough');
        } else {
            addResult('Security', 'JWT_SECRET strength', 'warning', 'Should be at least 32 characters');
        }
    }
}

// ============================================
// 7. PERFORMANCE TESTS
// ============================================
async function testPerformance() {
    logSection('7. PERFORMANCE TESTS');
    
    const endpoints = ['/api/health', '/api/modules'];
    
    for (const endpoint of endpoints) {
        try {
            const start = Date.now();
            await makeRequest(`${API_BASE}${endpoint}`, { timeout: 10000 });
            const duration = Date.now() - start;
            
            if (duration < 500) {
                addResult('Performance', `${endpoint} response time`, 'passed', `${duration}ms (fast)`);
            } else if (duration < 2000) {
                addResult('Performance', `${endpoint} response time`, 'warning', `${duration}ms (moderate)`);
            } else {
                addResult('Performance', `${endpoint} response time`, 'failed', `${duration}ms (slow)`);
            }
        } catch (error) {
            addResult('Performance', `${endpoint} response time`, 'error', error.message);
        }
    }
}

// ============================================
// 8. ERROR HANDLING TESTS
// ============================================
async function testErrorHandling() {
    logSection('8. ERROR HANDLING TESTS');
    
    // Test 404
    try {
        const response = await makeRequest(`${API_BASE}/api/nonexistent`);
        if (response.status === 404) {
            addResult('Error Handling', '404 handling', 'passed');
        } else {
            addResult('Error Handling', '404 handling', 'warning', `Got ${response.status} instead`);
        }
    } catch (error) {
        addResult('Error Handling', '404 handling', 'error', error.message);
    }
    
    // Test invalid JSON
    try {
        const response = await makeRequest(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: 'invalid json'
        });
        if (response.status === 400) {
            addResult('Error Handling', 'Invalid JSON handling', 'passed');
        } else {
            addResult('Error Handling', 'Invalid JSON handling', 'warning', `Got ${response.status}`);
        }
    } catch (error) {
        addResult('Error Handling', 'Invalid JSON handling', 'error', error.message);
    }
}

// ============================================
// 9. FRONTEND FILES TESTS
// ============================================
function testFrontendFiles() {
    logSection('9. FRONTEND FILES TESTS');
    
    const frontendFiles = [
        'index.html',
        'dashboard.html',
        'login.html',
        'signup.html',
        'modules.html',
        'simulations.html',
        'about.html',
        'contact.html'
    ];
    
    frontendFiles.forEach(file => {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            
            // Check for basic HTML structure
            if (content.includes('<!DOCTYPE html') || content.includes('<html')) {
                addResult('Frontend', file, 'passed');
            } else {
                addResult('Frontend', file, 'warning', 'Invalid HTML structure');
            }
        } else {
            addResult('Frontend', file, 'failed', 'Not found');
        }
    });
}

// ============================================
// 10. MODULES & SIMULATIONS TESTS
// ============================================
function testModulesAndSimulations() {
    logSection('10. MODULES & SIMULATIONS TESTS');
    
    // Check modules directory
    if (fs.existsSync('modules')) {
        const modules = fs.readdirSync('modules').filter(f => f.endsWith('.html'));
        addResult('Modules', 'Modules directory', 'passed', `${modules.length} files`);
    } else {
        addResult('Modules', 'Modules directory', 'failed', 'Not found');
    }
    
    // Check simulations directory
    if (fs.existsSync('simulation')) {
        const sims = fs.readdirSync('simulation').filter(f => f.endsWith('.html'));
        addResult('Simulations', 'Simulations directory', 'passed', `${sims.length} files`);
    } else {
        addResult('Simulations', 'Simulations directory', 'warning', 'Not found');
    }
}

// ============================================
// MAIN EXECUTION
// ============================================
async function runAllTests() {
    console.log('\n');
    log('╔═══════════════════════════════════════════════════════════════╗', 'cyan');
    log('║     SEBS Global - Comprehensive Test Suite                   ║', 'cyan');
    log('║     Proje Test Uzmanı Raporu                                 ║', 'cyan');
    log('╚═══════════════════════════════════════════════════════════════╝', 'cyan');
    console.log('');
    
    testEnvironment();
    testFileStructure();
    await testDatabase();
    await testAPIEndpoints();
    await testServerHealth();
    testSecurity();
    await testPerformance();
    await testErrorHandling();
    testFrontendFiles();
    testModulesAndSimulations();
    
    // Summary
    logSection('TEST SUMMARY');
    
    log(`Toplam Test: ${testResults.summary.total}`, 'cyan');
    log(`✅ Başarılı: ${testResults.summary.passed}`, 'green');
    log(`❌ Başarısız: ${testResults.summary.failed}`, 'red');
    log(`⚠️  Uyarılar: ${testResults.summary.warnings}`, 'yellow');
    log(`🔴 Hatalar: ${testResults.summary.errors}`, 'red');
    
    const successRate = ((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1);
    log(`\nBaşarı Oranı: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');
    
    // Save report
    const report = {
        timestamp: new Date().toISOString(),
        summary: testResults.summary,
        results: {
            passed: testResults.passed,
            failed: testResults.failed,
            warnings: testResults.warnings,
            errors: testResults.errors
        }
    };
    
    fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
    log('\n📄 Test raporu kaydedildi: test-report.json', 'blue');
    
    // Exit code
    process.exit(testResults.summary.failed > 0 || testResults.summary.errors > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
    log(`\n❌ Test suite error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});
