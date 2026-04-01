/**
 * Security Vulnerabilities Fix Script
 * Güvenlik açıklarını düzelt
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Güvenlik açıkları düzeltiliyor...\n');

// Read server.js
const serverPath = path.join(__dirname, '..', '..', 'backend', 'server.js');
let serverContent = fs.readFileSync(serverPath, 'utf8');

let fixes = [];

// 1. Add Helmet security headers
if (!serverContent.includes("require('helmet')") && !serverContent.includes('require("helmet")')) {
    const helmetImport = "const helmet = require('helmet');\n";
    const expressImportIndex = serverContent.indexOf("const express = require('express');");
    if (expressImportIndex !== -1) {
        const insertIndex = serverContent.indexOf('\n', expressImportIndex) + 1;
        serverContent = serverContent.slice(0, insertIndex) + helmetImport + serverContent.slice(insertIndex);
        fixes.push('✅ Helmet security headers eklendi');
    }
}

// Add helmet middleware
if (!serverContent.includes('app.use(helmet())')) {
    const corsIndex = serverContent.indexOf('app.use(cors());');
    if (corsIndex !== -1) {
        const insertIndex = serverContent.indexOf('\n', corsIndex) + 1;
        serverContent = serverContent.slice(0, insertIndex) + 
            "app.use(helmet({\n" +
            "    contentSecurityPolicy: {\n" +
            "        directives: {\n" +
            "            defaultSrc: [\"'self'\"],\n" +
            "            styleSrc: [\"'self'\", \"'unsafe-inline'\"],\n" +
            "            scriptSrc: [\"'self'\"],\n" +
            "            imgSrc: [\"'self'\", \"data:\", \"https:\"],\n" +
            "        },\n" +
            "    },\n" +
            "    hsts: {\n" +
            "        maxAge: 31536000,\n" +
            "        includeSubDomains: true,\n" +
            "        preload: true\n" +
            "    }\n" +
            "}));\n" +
            serverContent.slice(insertIndex);
        fixes.push('✅ Helmet middleware eklendi');
    }
}

// 2. Add rate limiting
if (!serverContent.includes("require('express-rate-limit')") && !serverContent.includes('require("express-rate-limit")')) {
    const rateLimitImport = "const rateLimit = require('express-rate-limit');\n";
    const expressImportIndex = serverContent.indexOf("const express = require('express');");
    if (expressImportIndex !== -1) {
        const insertIndex = serverContent.indexOf('\n', expressImportIndex) + 1;
        serverContent = serverContent.slice(0, insertIndex) + rateLimitImport + serverContent.slice(insertIndex);
        fixes.push('✅ Rate limiting import eklendi');
    }
}

// Add rate limiter
if (!serverContent.includes('const limiter = rateLimit')) {
    const middlewareIndex = serverContent.indexOf('// Middleware');
    if (middlewareIndex !== -1) {
        const insertIndex = serverContent.indexOf('\n', middlewareIndex) + 1;
        serverContent = serverContent.slice(0, insertIndex) + 
            "\n// Rate limiting\n" +
            "const limiter = rateLimit({\n" +
            "    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes\n" +
            "    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs\n" +
            "    message: 'Too many requests from this IP, please try again later.',\n" +
            "    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers\n" +
            "    legacyHeaders: false, // Disable the `X-RateLimit-*` headers\n" +
            "    skip: (req) => {\n" +
            "        // Skip rate limiting for health check\n" +
            "        return req.path === '/api/health';\n" +
            "    }\n" +
            "});\n" +
            "\n// Apply rate limiting to all API routes\n" +
            "app.use('/api/', limiter);\n" +
            serverContent.slice(insertIndex);
        fixes.push('✅ Rate limiting middleware eklendi');
    }
}

// 3. Fix JWT secret fallback
if (serverContent.includes("process.env.JWT_SECRET || 'fallback_secret'")) {
    serverContent = serverContent.replace(
        /process\.env\.JWT_SECRET \|\| 'fallback_secret'/g,
        "process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET environment variable is required'); })()"
    );
    fixes.push('✅ JWT secret fallback kaldırıldı (kritik güvenlik açığı)');
}

// 4. Improve error handling (prevent information leakage)
const errorHandlingPattern = /res\.status\(500\)\.json\(\{[^}]*error[^}]*message[^}]*error\.message[^}]*\}\)/g;
if (errorHandlingPattern.test(serverContent)) {
    // This is complex, we'll add a helper function instead
    const helperFunction = `
// Secure error handler - prevents information leakage
const handleError = (res, error, customMessage = 'Internal server error') => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    console.error('Error:', error);
    res.status(500).json({
        success: false,
        message: customMessage,
        ...(isDevelopment && { error: error.message, stack: error.stack })
    });
};
`;
    
    const authenticateIndex = serverContent.indexOf('// JWT middleware');
    if (authenticateIndex !== -1) {
        serverContent = serverContent.slice(0, authenticateIndex) + helperFunction + '\n' + serverContent.slice(authenticateIndex);
        fixes.push('✅ Secure error handler eklendi');
    }
}

// 5. Improve CORS configuration
if (serverContent.includes('app.use(cors());')) {
    serverContent = serverContent.replace(
        'app.use(cors());',
        `app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // 24 hours
}));`
    );
    fixes.push('✅ CORS yapılandırması güvenli hale getirildi');
}

// 6. Add input sanitization helper
if (!serverContent.includes('sanitizeInput')) {
    const sanitizeFunction = `
// Input sanitization helper
const sanitizeInput = (input) => {
    if (typeof input === 'string') {
        // Remove potentially dangerous characters
        return input
            .replace(/<script[^>]*>.*?<\\/script>/gi, '')
            .replace(/<[^>]+>/g, '')
            .trim();
    }
    return input;
};
`;
    
    const authenticateIndex = serverContent.indexOf('// JWT middleware');
    if (authenticateIndex !== -1) {
        serverContent = serverContent.slice(0, authenticateIndex) + sanitizeFunction + '\n' + serverContent.slice(authenticateIndex);
        fixes.push('✅ Input sanitization helper eklendi');
    }
}

// 7. Add request size limit
if (!serverContent.includes('express.json({ limit:')) {
    serverContent = serverContent.replace(
        'app.use(express.json());',
        "app.use(express.json({ limit: '10mb' }));"
    );
    serverContent = serverContent.replace(
        'app.use(express.urlencoded({ extended: true }));',
        "app.use(express.urlencoded({ extended: true, limit: '10mb' }));"
    );
    fixes.push('✅ Request size limit eklendi');
}

// Write back
fs.writeFileSync(serverPath, serverContent);

console.log('\n📋 Yapılan Düzeltmeler:\n');
fixes.forEach(fix => console.log(`   ${fix}`));

console.log('\n✅ Güvenlik açıkları düzeltildi!\n');
console.log('⚠️  ÖNEMLİ: package.json\'a şu bağımlılıkları ekleyin:');
console.log('   npm install helmet express-rate-limit\n');

