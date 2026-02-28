/**
 * OCR fallback classifier regression test.
 *
 * Verifies that AI error messages indicating invalid/insufficient content
 * trigger OCR queue fallback decision logic.
 *
 * Usage:
 *   node tests/test-ocr-fallback-ai-errors.js
 */

const assert = require('assert');
const { shouldQueueForOcrOnAiError } = require('../services/serviceUtils');

function run() {
  const positiveCases = [
    'Insufficient content for AI analysis',
    'Invalid response structure: missing tags array or correspondent string',
    'Invalid JSON response from API',
    'Invalid API response structure'
  ];

  const negativeCases = [
    '',
    null,
    undefined,
    'Network timeout while contacting provider',
    'Rate limit exceeded',
    'Unauthorized: invalid API key'
  ];

  console.log('\n🧪 OCR fallback classifier test');
  console.log('='.repeat(60));

  for (const message of positiveCases) {
    const result = shouldQueueForOcrOnAiError(message);
    console.log(`✅ should queue: "${message}" -> ${result}`);
    assert.strictEqual(result, true, `Expected TRUE for message: ${message}`);
  }

  for (const message of negativeCases) {
    const result = shouldQueueForOcrOnAiError(message);
    console.log(`✅ should not queue: "${message}" -> ${result}`);
    assert.strictEqual(result, false, `Expected FALSE for message: ${message}`);
  }

  console.log('\n🎉 All assertions passed');
}

if (require.main === module) {
  run();
}

module.exports = { run };
