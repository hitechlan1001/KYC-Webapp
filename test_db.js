// Simple database test script
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

import { connectDatabase, initializeKYCTables } from './backend/src/config/database.js';

async function testDatabase() {
  try {
    console.log('🔌 Testing database connection...');
    await connectDatabase();
    console.log('✅ Database connection successful!');
    
    console.log('🏗️ Initializing KYC tables...');
    await initializeKYCTables();
    console.log('✅ KYC tables initialized successfully!');
    
    console.log('🎉 Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

testDatabase();
