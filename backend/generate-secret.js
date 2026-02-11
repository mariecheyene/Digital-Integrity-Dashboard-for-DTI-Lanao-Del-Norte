// generate-secret.js
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 Generating JWT Secret...\n');

// Generate a strong random secret (64 characters)
const secret = crypto.randomBytes(64).toString('hex');

// Read existing .env file if it exists
const envPath = path.join(__dirname, '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📁 Found existing .env file\n');
}

// Update or add JWT_SECRET
if (envContent.includes('JWT_SECRET=')) {
  // Replace existing JWT_SECRET
  envContent = envContent.replace(
    /JWT_SECRET=.*/,
    `JWT_SECRET=${secret}`
  );
  console.log('✓ Updated existing JWT_SECRET');
} else {
  // Add new JWT_SECRET
  envContent += `\nJWT_SECRET=${secret}\n`;
  console.log('✓ Added new JWT_SECRET');
}

// Ensure basic variables exist
const requiredVars = {
  'MONGODB_URI': 'mongodb://127.0.0.1:27017/digital_integrity',
  'PORT': '5000',
  'EMAIL_USER': 'your_email@gmail.com',
  'EMAIL_PASS': 'your_app_password_here'
};

for (const [key, defaultValue] of Object.entries(requiredVars)) {
  if (!envContent.includes(`${key}=`)) {
    envContent += `${key}=${defaultValue}\n`;
    console.log(`✓ Added ${key} with default value`);
  }
}

// Write to .env file
fs.writeFileSync(envPath, envContent.trim());

console.log('\n✅ .env file created/updated successfully!');
console.log('📁 Location:', envPath);
console.log('\n🔑 Your JWT Secret (first 20 chars):', secret.substring(0, 20) + '...');
console.log('⚠️  Keep this file secret! Never commit to git.\n');