const assert = require('assert');

const configModulePath = require.resolve('../config/config');
const originalLogLevel = process.env.LOG_LEVEL;

function loadConfigWithLogLevel(logLevel) {
  delete require.cache[configModulePath];

  if (typeof logLevel === 'undefined') {
    delete process.env.LOG_LEVEL;
  } else {
    process.env.LOG_LEVEL = logLevel;
  }

  return require('../config/config');
}

function restoreEnvironment() {
  if (typeof originalLogLevel === 'undefined') {
    delete process.env.LOG_LEVEL;
  } else {
    process.env.LOG_LEVEL = originalLogLevel;
  }

  delete require.cache[configModulePath];
}

try {
  let config = loadConfigWithLogLevel('DEBUG');
  assert.strictEqual(config.logLevel, 'debug', 'Expected DEBUG to normalize to debug');
  assert.strictEqual(process.env.LOG_LEVEL, 'debug', 'Expected process.env.LOG_LEVEL to be normalized to debug');

  config = loadConfigWithLogLevel('warn');
  assert.strictEqual(config.logLevel, 'warn', 'Expected warn to remain warn');

  config = loadConfigWithLogLevel('verbose');
  assert.strictEqual(config.logLevel, 'info', 'Expected invalid LOG_LEVEL to fall back to info');
  assert.strictEqual(process.env.LOG_LEVEL, 'info', 'Expected process.env.LOG_LEVEL to fall back to info');

  config = loadConfigWithLogLevel(undefined);
  assert.strictEqual(config.logLevel, 'info', 'Expected missing LOG_LEVEL to default to info');

  restoreEnvironment();
  console.log('[PASS] LOG_LEVEL configuration parsing and fallback checks passed');
} catch (error) {
  restoreEnvironment();
  console.error('[FAIL] LOG_LEVEL config test failed:', error.message);
  process.exit(1);
}
