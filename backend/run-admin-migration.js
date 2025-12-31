// Run admin tables migration
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
    console.log('🔄 Running admin tables migration...\n');
    
    const sqlPath = path.join(__dirname, 'migrations', 'create_admin_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    const lines = sql.split('\n');
    let statements = [];
    let currentStatement = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('--') || trimmedLine.length === 0) {
        continue;
      }
      
      currentStatement += ' ' + trimmedLine;
      
      if (trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim().slice(0, -1));
        currentStatement = '';
      }
    }
    
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          await prisma.$executeRawUnsafe(statement);
          console.log(`✅ Statement ${i + 1} executed successfully\n`);
        } catch (error) {
          if (error.code === '42P07' || error.code === '42P16' || 
              error.message.includes('already exists') || 
              error.message.includes('duplicate') ||
              (error.message.includes('relation') && error.message.includes('already exists')) ||
              error.message.includes('column') && error.message.includes('already exists')) {
            console.log(`⚠️  Statement ${i + 1}: Already exists (skipping)`);
            console.log(`   Message: ${error.message}\n`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            throw error;
          }
        }
      }
    }
    
    console.log('✅ Migration completed successfully!');
    
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
