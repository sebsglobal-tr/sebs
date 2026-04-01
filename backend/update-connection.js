// Script to update Supabase connection strings
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function encodePassword(password) {
  return encodeURIComponent(password);
}

async function main() {
  console.log('🔧 Supabase Connection String Güncelleme\n');
  console.log('Bu script .env dosyanızdaki Supabase connection string\'lerini güncelleyecektir.\n');
  console.log('Supabase Dashboard\'dan connection string\'leri almak için:');
  console.log('1. https://supabase.com → Projenize giriş yapın');
  console.log('2. Settings → Database bölümüne gidin');
  console.log('3. Connection string\'leri kopyalayın\n');

  // Get DATABASE_URL (Connection Pooling)
  console.log('📊 DATABASE_URL (Connection Pooling - Runtime için):');
  console.log('   Settings → Database → Connection pooling → Transaction mode\n');
  const databaseUrl = await question('DATABASE_URL\'yi yapıştırın: ');
  
  // Get DIRECT_URL (Direct Connection)
  console.log('\n🔗 DIRECT_URL (Direct Connection - Migration için):');
  console.log('   Settings → Database → Connection string → URI\n');
  const directUrl = await question('DIRECT_URL\'yi yapıştırın: ');

  // Parse passwords and encode if needed
  let dbPassword = '';
  let directPassword = '';
  
  try {
    const dbUrl = new URL(databaseUrl);
    dbPassword = dbUrl.password;
    dbUrl.password = encodePassword(dbPassword);
    const encodedDatabaseUrl = dbUrl.toString();
    
    const directUrlObj = new URL(directUrl);
    directPassword = directUrlObj.password;
    directUrlObj.password = encodePassword(directPassword);
    const encodedDirectUrl = directUrlObj.toString();

    // Read current .env file
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }

    // Update or add DATABASE_URL
    if (envContent.includes('DATABASE_URL=')) {
      envContent = envContent.replace(
        /DATABASE_URL=".*?"/,
        `DATABASE_URL="${encodedDatabaseUrl}"`
      );
    } else {
      envContent += `\nDATABASE_URL="${encodedDatabaseUrl}"\n`;
    }

    // Update or add DIRECT_URL
    if (envContent.includes('DIRECT_URL=')) {
      envContent = envContent.replace(
        /DIRECT_URL=".*?"/,
        `DIRECT_URL="${encodedDirectUrl}"`
      );
    } else {
      envContent += `DIRECT_URL="${encodedDirectUrl}"\n`;
    }

    // Write updated .env file
    fs.writeFileSync(envPath, envContent, 'utf-8');
    
    console.log('\n✅ .env dosyası güncellendi!');
    console.log('\n📝 Güncellenen değerler:');
    console.log(`   DATABASE_URL: ${new URL(encodedDatabaseUrl).hostname}`);
    console.log(`   DIRECT_URL: ${new URL(encodedDirectUrl).hostname}`);
    console.log('\n🧪 Bağlantıyı test etmek için:');
    console.log('   node test-connection.js\n');

  } catch (error) {
    console.error('\n❌ Hata:', error.message);
    console.log('\nLütfen connection string\'lerin doğru formatta olduğundan emin olun.');
    console.log('Format: postgresql://user:password@host:port/database');
  }

  rl.close();
}

main().catch(console.error);

