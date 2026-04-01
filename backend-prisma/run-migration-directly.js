// Run migration SQL directly using Prisma
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('🔄 Running entitlements table migration...\n');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, 'migrations', 'create_entitlements_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // Split SQL into individual statements (handle multi-line statements)
    const lines = sql.split('\n');
    let statements = [];
    let currentStatement = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines
      if (trimmedLine.startsWith('--') || trimmedLine.length === 0) {
        continue;
      }
      
      currentStatement += ' ' + trimmedLine;
      
      // If line ends with semicolon, it's a complete statement
      if (trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim().slice(0, -1)); // Remove trailing semicolon
        currentStatement = '';
      }
    }
    
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    // Execute each statement in order
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          await prisma.$executeRawUnsafe(statement);
          console.log(`✅ Statement ${i + 1} executed successfully\n`);
        } catch (error) {
          // Ignore "already exists" errors
          if (error.code === '42P07' || error.code === '42P16' || 
              error.message.includes('already exists') || 
              error.message.includes('duplicate') ||
              error.message.includes('relation') && error.message.includes('already exists')) {
            console.log(`⚠️  Statement ${i + 1}: Already exists (skipping)`);
            console.log(`   Message: ${error.message}\n`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            throw error;
          }
        }
      }
    }
    
    // Verify table was created
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'entitlements'
    `;
    
    if (tables.length > 0) {
      console.log('✅ Migration completed successfully!');
      console.log('✅ Entitlements table exists');
      
      // Check columns
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'entitlements'
        ORDER BY ordinal_position
      `;
      
      console.log('\n📋 Table structure:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})`);
      });
      
    } else {
      console.log('❌ Migration may have failed - table not found');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed!');
    console.error('Error:', error.message);
    if (error.meta) {
      console.error('Details:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
