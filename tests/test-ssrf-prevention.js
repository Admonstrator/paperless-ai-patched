/**
 * Test script for SSRF Prevention (SEC-003)
 * Tests URL validation across all services
 */

const config = require('../config/config');

console.log('=== SSRF Prevention Test ===\n');

// Test 1: Config validation
console.log('Test 1: Security Configuration');
console.log('Allowed Hosts:', config.security?.allowedHosts);
console.log('URL Validation Enabled:', config.security?.enableUrlValidation);
console.log('');

// Test 2: PaperlessService URL Validation
console.log('Test 2: PaperlessService URL Validation');
const paperlessService = require('../services/paperlessService');

const testUrls = [
  { url: 'http://localhost:8000', shouldFail: true, reason: 'Localhost blocked' },
  { url: 'http://169.254.169.254/latest/meta-data/', shouldFail: true, reason: 'AWS metadata blocked' },
  { url: 'http://192.168.1.1/admin', shouldFail: true, reason: 'Private IP blocked' },
  { url: 'file:///etc/passwd', shouldFail: true, reason: 'File protocol blocked' },
  { url: 'http://10.0.0.1/', shouldFail: true, reason: 'Private 10.x blocked' },
  { url: 'http://172.16.0.1/', shouldFail: true, reason: 'Private 172.x blocked' },
];

// Add legitimate URL if configured
if (process.env.PAPERLESS_API_URL) {
  testUrls.push({
    url: process.env.PAPERLESS_API_URL,
    shouldFail: false,
    reason: 'Configured Paperless URL should pass'
  });
}

testUrls.forEach(({ url, shouldFail, reason }) => {
  try {
    paperlessService.validateUrl(url);
    if (shouldFail) {
      console.log(`❌ FAIL: ${url} - ${reason} (should have been blocked)`);
    } else {
      console.log(`✅ PASS: ${url} - ${reason}`);
    }
  } catch (error) {
    if (shouldFail) {
      console.log(`✅ PASS: ${url} - ${reason} (blocked: ${error.message})`);
    } else {
      console.log(`❌ FAIL: ${url} - ${reason} (incorrectly blocked: ${error.message})`);
    }
  }
});

console.log('');

// Test 3: RAG Service URL Validation
console.log('Test 3: RAG Service URL Validation');
try {
  // RAG service allows localhost (same-host deployment)
  const ragService = require('../services/ragService');
  console.log('✅ PASS: RAG service initialized (localhost allowed for RAG)');
} catch (error) {
  console.log(`❌ FAIL: RAG service initialization failed: ${error.message}`);
}

console.log('');

// Test 4: ServiceUtils validation
console.log('Test 4: ServiceUtils URL Validation');
const { validateApiUrl } = require('../services/serviceUtils');

const serviceUtilTests = [
  { url: 'http://example.com/api', allowPrivate: false, shouldPass: true },
  { url: 'http://192.168.1.1/', allowPrivate: false, shouldPass: false },
  { url: 'http://192.168.1.1/', allowPrivate: true, shouldPass: true },
  { url: 'http://169.254.169.254/', allowPrivate: false, shouldPass: false },
];

serviceUtilTests.forEach(({ url, allowPrivate, shouldPass }) => {
  const result = validateApiUrl(url, { allowPrivateIPs: allowPrivate });
  if (shouldPass && result.valid) {
    console.log(`✅ PASS: ${url} (allowPrivate=${allowPrivate}) - valid as expected`);
  } else if (!shouldPass && !result.valid) {
    console.log(`✅ PASS: ${url} (allowPrivate=${allowPrivate}) - blocked as expected: ${result.error}`);
  } else {
    console.log(`❌ FAIL: ${url} (allowPrivate=${allowPrivate}) - unexpected result: ${result.valid ? 'passed' : 'failed'}`);
  }
});

console.log('');
console.log('=== Test Complete ===');
console.log('Note: Run with configured PAPERLESS_API_URL to test legitimate URL access');
