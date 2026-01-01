const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing VibeNet Setup...\n');

// Test 1: Check if Docker is available
console.log('1. Checking Docker...');
exec('docker --version', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Docker not found. Please install Docker first.');
    return;
  }
  console.log('✅ Docker found:', stdout.trim());
  
  // Test 2: Check if Docker Compose is available
  console.log('\n2. Checking Docker Compose...');
  exec('docker-compose --version', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Docker Compose not found. Please install Docker Compose.');
      return;
    }
    console.log('✅ Docker Compose found:', stdout.trim());
    
    // Test 3: Check if Node.js dependencies are installed
    console.log('\n3. Checking dependencies...');
    
    const frontendDeps = fs.existsSync('./node_modules');
    const backendDeps = fs.existsSync('./server/node_modules');
    
    console.log(frontendDeps ? '✅ Frontend dependencies installed' : '⚠️  Frontend dependencies missing - run: npm install');
    console.log(backendDeps ? '✅ Backend dependencies installed' : '⚠️  Backend dependencies missing - run: cd server && npm install');
    
    // Test 4: Check configuration files
    console.log('\n4. Checking configuration...');
    
    const frontendEnv = fs.existsSync('./.env');
    const backendEnv = fs.existsSync('./server/.env');
    const dockerCompose = fs.existsSync('./docker-compose.yml');
    
    console.log(frontendEnv ? '✅ Frontend .env file exists' : '❌ Frontend .env file missing');
    console.log(backendEnv ? '✅ Backend .env file exists' : '❌ Backend .env file missing');
    console.log(dockerCompose ? '✅ Docker Compose file exists' : '❌ Docker Compose file missing');
    
    console.log('\n🎉 Setup test complete!');
    console.log('\nNext steps:');
    console.log('1. Run: docker-compose up -d');
    console.log('2. Run: cd server && npm start');
    console.log('3. Run: npm start (in another terminal)');
    console.log('\nOr use the startup scripts:');
    console.log('- Windows: start.bat');
    console.log('- Mac/Linux: ./start.sh');
  });
});