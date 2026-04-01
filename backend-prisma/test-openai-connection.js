// Test OpenAI Connection
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function testOpenAI() {
  console.log('🧪 Testing OpenAI Connection...\n');
  
  // Check API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('❌ OPENAI_API_KEY not found in .env');
    return;
  }
  
  console.log('✅ OPENAI_API_KEY found');
  console.log(`   Key prefix: ${apiKey.substring(0, 10)}...`);
  
  // Check model
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  console.log(`✅ Model: ${model}\n`);
  
  // Try to import OpenAI
  try {
    const { default: OpenAI } = await import('openai');
    console.log('✅ OpenAI package imported successfully');
    
    // Initialize client
    const client = new OpenAI({
      apiKey: apiKey
    });
    
    console.log('✅ OpenAI client initialized\n');
    
    // Test API call
    console.log('📡 Testing API call...');
    try {
      const completion = await client.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Respond with "OK" if you can read this.'
          },
          {
            role: 'user',
            content: 'Say OK'
          }
        ],
        max_tokens: 10
      });
      
      const response = completion.choices[0].message.content;
      console.log(`✅ API call successful!`);
      console.log(`   Response: ${response}`);
      console.log(`\n🎉 OpenAI is working correctly!`);
      
    } catch (apiError) {
      console.log(`❌ API call failed: ${apiError.message}`);
      if (apiError.status === 401) {
        console.log('   → Invalid API key');
      } else if (apiError.status === 429) {
        console.log('   → Rate limit exceeded');
      } else {
        console.log(`   → Status: ${apiError.status}`);
      }
    }
    
  } catch (importError) {
    console.log('❌ Failed to import OpenAI package');
    console.log(`   Error: ${importError.message}`);
    console.log('\n💡 Install OpenAI package:');
    console.log('   npm install openai');
  }
}

testOpenAI().catch(console.error);
