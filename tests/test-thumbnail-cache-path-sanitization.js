/**
 * Unit tests for getThumbnailCachePath() sanitization
 *
 * Validates that directory traversal attempts and invalid IDs are rejected,
 * and that normal numeric IDs resolve correctly.
 *
 * Usage: node tests/test-thumbnail-cache-path-sanitization.js
 */

const assert = require('assert');
const path = require('path');

// We need process.cwd() to stay stable for path assertions
const { getThumbnailCachePath } = require('../services/thumbnailCachePaths');

const EXPECTED_BASE = path.join(process.cwd(), 'data', 'thumb-cache');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`[OK] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

// --- Valid inputs ---

test('numeric ID resolves to correct path', () => {
  const result = getThumbnailCachePath(42);
  assert.strictEqual(result, path.join(EXPECTED_BASE, '42.png'));
});

test('numeric string ID resolves to correct path', () => {
  const result = getThumbnailCachePath('123');
  assert.strictEqual(result, path.join(EXPECTED_BASE, '123.png'));
});

test('ID with hyphen/underscore resolves correctly', () => {
  const result = getThumbnailCachePath('doc_1-A');
  assert.strictEqual(result, path.join(EXPECTED_BASE, 'doc_1-A.png'));
});

// --- Path traversal attempts ---

test('path traversal ../../etc/passwd is stripped to safe name', () => {
  const result = getThumbnailCachePath('../../etc/passwd');
  // All non-allowed chars stripped → "etcpasswd"
  assert.strictEqual(result, path.join(EXPECTED_BASE, 'etcpasswd.png'));
  assert(!result.includes('..'), 'result must not contain ".."');
});

test('Windows-style traversal ..\\..\\windows\\system32 is stripped', () => {
  const result = getThumbnailCachePath('..\\..\\windows\\system32');
  assert(!result.includes('..'), 'result must not contain ".."');
  assert(!result.includes('\\'), 'result must not contain backslashes');
});

test('null-byte injection is stripped', () => {
  const result = getThumbnailCachePath('123\x00../../etc/shadow');
  assert.strictEqual(result, path.join(EXPECTED_BASE, '123etcshadow.png'));
});

// --- Invalid inputs that must throw ---

test('null throws', () => {
  assert.throws(() => getThumbnailCachePath(null), /Invalid document ID/);
});

test('undefined throws', () => {
  assert.throws(() => getThumbnailCachePath(undefined), /Invalid document ID/);
});

test('empty string throws', () => {
  assert.throws(() => getThumbnailCachePath(''), /Invalid document ID/);
});

test('dots-only ("..") throws after sanitization', () => {
  assert.throws(() => getThumbnailCachePath('..'), /Invalid document ID/);
});

test('slashes-only ("///") throws after sanitization', () => {
  assert.throws(() => getThumbnailCachePath('///'), /Invalid document ID/);
});

test('special chars only ("@#$%") throws after sanitization', () => {
  assert.throws(() => getThumbnailCachePath('@#$%'), /Invalid document ID/);
});

// --- Summary ---

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
