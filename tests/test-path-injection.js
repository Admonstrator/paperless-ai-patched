/**
 * Test script for Path Injection Prevention (SEC-003 Phase 1.2)
 * Tests path sanitization across all services
 */

const { sanitizePath, validateFilename } = require('../services/serviceUtils');
const path = require('path');

console.log('=== Path Injection Prevention Test ===\n');

// Test 1: sanitizePath - Directory Traversal Attacks
console.log('Test 1: Directory Traversal Prevention');
const baseDir = path.resolve('./public/images');

const traversalTests = [
  { input: 'image.png', shouldPass: true, desc: 'Valid filename' },
  { input: '123.png', shouldPass: true, desc: 'Valid numeric filename' },
  { input: '../../../etc/passwd', shouldPass: false, desc: 'Parent directory traversal' },
  { input: '..\\..\\windows\\system32\\config\\sam', shouldPass: false, desc: 'Windows path traversal' },
  { input: 'subdir/image.png', shouldPass: true, desc: 'Subdirectory (if within base)' },
  { input: '/etc/passwd', shouldPass: false, desc: 'Absolute path (not allowed)' },
  { input: 'image\0.png', shouldPass: false, desc: 'Null byte injection' },
  { input: './../image.png', shouldPass: false, desc: 'Relative parent reference' },
  { input: 'C:\\Users\\test.png', shouldPass: false, desc: 'Windows absolute path' },
];

traversalTests.forEach(({ input, shouldPass, desc }) => {
  const result = sanitizePath(input, baseDir, { allowedExtensions: ['.png'] });
  
  if (shouldPass && result.valid) {
    console.log(`✅ PASS: "${input}" - ${desc}`);
    console.log(`   → Sanitized to: ${result.sanitizedPath}`);
  } else if (!shouldPass && !result.valid) {
    console.log(`✅ PASS: "${input}" - ${desc}`);
    console.log(`   → Blocked: ${result.error}`);
  } else if (shouldPass && !result.valid) {
    console.log(`❌ FAIL: "${input}" - ${desc}`);
    console.log(`   → Should have passed but was blocked: ${result.error}`);
  } else {
    console.log(`❌ FAIL: "${input}" - ${desc}`);
    console.log(`   → Should have been blocked but passed`);
  }
});

console.log('');

// Test 2: File Extension Restrictions
console.log('Test 2: File Extension Validation');
const extensionTests = [
  { input: 'document.png', ext: ['.png'], shouldPass: true },
  { input: 'document.jpg', ext: ['.png'], shouldPass: false },
  { input: 'script.exe', ext: ['.png', '.jpg'], shouldPass: false },
  { input: 'malicious.php', ext: ['.png'], shouldPass: false },
  { input: 'image.PNG', ext: ['.png'], shouldPass: true, desc: 'Case insensitive' },
];

extensionTests.forEach(({ input, ext, shouldPass, desc }) => {
  const result = sanitizePath(input, baseDir, { allowedExtensions: ext });
  const description = desc || `Extension ${ext.join(', ')}`;
  
  if (shouldPass && result.valid) {
    console.log(`✅ PASS: "${input}" - ${description}`);
  } else if (!shouldPass && !result.valid) {
    console.log(`✅ PASS: "${input}" - Blocked (${description}): ${result.error}`);
  } else {
    console.log(`❌ FAIL: "${input}" - ${description} - Unexpected result`);
  }
});

console.log('');

// Test 3: validateFilename - Filename-only Validation
console.log('Test 3: Filename Validation (No Paths)');
const filenameTests = [
  { input: 'document.log', shouldPass: true },
  { input: 'app-2024-01-09.txt', shouldPass: true },
  { input: '../logs/app.log', shouldPass: false, desc: 'Contains path separator' },
  { input: 'log\\app.log', shouldPass: false, desc: 'Contains Windows separator' },
  { input: '.hidden', shouldPass: false, desc: 'Hidden file' },
  { input: '..', shouldPass: false, desc: 'Parent directory reference' },
  { input: 'file\0.log', shouldPass: false, desc: 'Null byte' },
  { input: 'a'.repeat(300), shouldPass: false, desc: 'Exceeds max length' },
];

filenameTests.forEach(({ input, shouldPass, desc }) => {
  const result = validateFilename(input, { allowedExtensions: ['.log', '.txt', '.html'] });
  const description = desc || input;
  
  if (shouldPass && result.valid) {
    console.log(`✅ PASS: "${input.substring(0, 50)}" - ${description}`);
  } else if (!shouldPass && !result.valid) {
    console.log(`✅ PASS: "${input.substring(0, 50)}" - Blocked (${description}): ${result.error}`);
  } else {
    console.log(`❌ FAIL: "${input.substring(0, 50)}" - ${description} - Unexpected result`);
  }
});

console.log('');

// Test 4: Real-world Attack Scenarios
console.log('Test 4: Real-world Attack Scenarios');
const attackScenarios = [
  {
    name: 'AWS credentials theft',
    input: '../../../../root/.aws/credentials',
    baseDir: './public/images',
  },
  {
    name: 'SSH key theft',
    input: '../../.ssh/id_rsa',
    baseDir: './logs',
  },
  {
    name: 'Database access',
    input: '../../../data/documents.db',
    baseDir: './public/images',
  },
  {
    name: 'Environment file access',
    input: '../../data/.env',
    baseDir: './public/images',
  },
];

attackScenarios.forEach(({ name, input, baseDir: base }) => {
  const resolvedBase = path.resolve(base);
  const result = sanitizePath(input, resolvedBase);
  
  if (!result.valid) {
    console.log(`✅ PASS: Blocked "${name}" attack`);
    console.log(`   → Path: ${input}`);
    console.log(`   → Reason: ${result.error}`);
  } else {
    console.log(`❌ FAIL: "${name}" attack was NOT blocked!`);
    console.log(`   → Would resolve to: ${result.sanitizedPath}`);
  }
});

console.log('');

// Test 5: Logger Service Path Validation
console.log('Test 5: Logger Service Integration');
try {
  const Logger = require('../services/loggerService');
  
  // Test valid logger
  try {
    const validLogger = new Logger({
      logFile: 'test.log',
      logDir: 'logs'
    });
    console.log('✅ PASS: Valid logger configuration accepted');
  } catch (error) {
    console.log(`❌ FAIL: Valid logger rejected: ${error.message}`);
  }
  
  // Test invalid filename
  try {
    const invalidLogger = new Logger({
      logFile: '../../../etc/passwd',
      logDir: 'logs'
    });
    console.log('❌ FAIL: Path traversal in logFile was NOT blocked');
  } catch (error) {
    console.log(`✅ PASS: Path traversal in logFile blocked: ${error.message}`);
  }
  
  // Test invalid extension
  try {
    const badExtLogger = new Logger({
      logFile: 'malicious.exe',
      logDir: 'logs'
    });
    console.log('❌ FAIL: Invalid log file extension was NOT blocked');
  } catch (error) {
    console.log(`✅ PASS: Invalid extension blocked: ${error.message}`);
  }
  
} catch (error) {
  console.log(`⚠️ WARNING: Could not test Logger service: ${error.message}`);
}

console.log('');
console.log('=== Test Complete ===');
console.log('All path injection attack vectors should be blocked.');
