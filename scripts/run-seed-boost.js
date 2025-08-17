#!/usr/bin/env node

// Node.js runner for seed boost - handles environment setup
const { execSync } = require('child_process');
const path = require('path');

// Set up environment variables for scripts
const env = {
  ...process.env,
  SUPABASE_URL: 'https://dvgubqqjvmsepkilnkak.supabase.co',
  // Service role key needs to be set separately for security
  NODE_OPTIONS: '--loader=ts-node/esm'
};

console.log('🚀 Running Devmart Seed Boost...');
console.log('⚠️  Make sure SUPABASE_SERVICE_ROLE_KEY is set in your environment');

try {
  // Run the TypeScript seeding script
  execSync('npx ts-node --esm scripts/seed-devmart-extra.ts', {
    cwd: process.cwd(),
    env,
    stdio: 'inherit'
  });
  
  console.log('✅ Seed boost completed successfully!');
} catch (error) {
  console.error('❌ Seed boost failed:', error.message);
  console.log('\n💡 Make sure you have set SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.log('   You can find it in your Supabase project settings > API');
  process.exit(1);
}