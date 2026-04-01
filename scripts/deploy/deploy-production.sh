#!/bin/bash
# SEBS Global - Production Deployment Script
# This script automates the production deployment process

set -e  # Exit on error

echo "🚀 SEBS Global - Production Deployment"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Please do not run as root${NC}"
   exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo -e "${RED}❌ Node.js version 14 or higher is required${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    if [ -f env.example ]; then
        echo "Creating .env from env.example..."
        cp env.example .env
        echo -e "${YELLOW}⚠️  Please edit .env file with your production values${NC}"
        exit 1
    else
        echo -e "${RED}❌ env.example not found${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ .env file exists${NC}"

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check critical environment variables
CRITICAL_VARS=("JWT_SECRET" "DATABASE_URL")
MISSING_VARS=()

for var in "${CRITICAL_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing critical environment variables: ${MISSING_VARS[*]}${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Critical environment variables set${NC}"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install --production

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Test database connection
echo ""
echo "🔍 Testing database connection..."
node -e "
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || \`postgresql://\${process.env.DB_USER}:\${process.env.DB_PASSWORD}@\${process.env.DB_HOST}:\${process.env.DB_PORT || 5432}/\${process.env.DB_NAME}\`,
    ssl: process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('supabase') || process.env.DATABASE_URL.includes('sslmode=require')) ? { rejectUnauthorized: false } : false
});
pool.query('SELECT NOW()').then(() => {
    console.log('✅ Database connection successful');
    process.exit(0);
}).catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
});
"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Database connection test failed${NC}"
    echo -e "${YELLOW}⚠️  Please check your DATABASE_URL or DB_* variables${NC}"
    exit 1
fi

# Run production tests
echo ""
echo "🧪 Running production tests..."
if [ -f production-maintenance-test.js ]; then
    node production-maintenance-test.js || {
        echo -e "${YELLOW}⚠️  Some tests failed, but continuing deployment...${NC}"
    }
else
    echo -e "${YELLOW}⚠️  production-maintenance-test.js not found, skipping tests${NC}"
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo ""
    echo -e "${YELLOW}⚠️  PM2 is not installed${NC}"
    echo "Installing PM2..."
    npm install -g pm2
fi

# Stop existing process if running
echo ""
echo "🛑 Stopping existing process (if any)..."
pm2 stop sebs-global 2>/dev/null || true
pm2 delete sebs-global 2>/dev/null || true

# Start application with PM2
echo ""
echo "🚀 Starting application with PM2..."
NODE_ENV=production pm2 start server.js --name sebs-global --env production

# Save PM2 configuration
pm2 save

# Show status
echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "Useful commands:"
echo "  pm2 logs sebs-global    - View logs"
echo "  pm2 monit               - Monitor application"
echo "  pm2 restart sebs-global - Restart application"
echo "  pm2 stop sebs-global    - Stop application"
echo ""
echo "Health check: http://localhost:${PORT:-8006}/api/health"
echo ""
