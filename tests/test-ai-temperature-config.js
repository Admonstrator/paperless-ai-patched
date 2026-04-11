const assert = require('assert');

const configModulePath = require.resolve('../config/config');
const originalEnv = { ...process.env };

function loadConfigWithTemperatures(analysisValue, generationValue) {
  delete require.cache[configModulePath];

  if (typeof analysisValue === 'undefined') {
    delete process.env.AI_TEMPERATURE_ANALYSIS;
  } else {
    process.env.AI_TEMPERATURE_ANALYSIS = String(analysisValue);
  }

  if (typeof generationValue === 'undefined') {
    delete process.env.AI_TEMPERATURE_GENERATION;
  } else {
    process.env.AI_TEMPERATURE_GENERATION = String(generationValue);
  }

  return require('../config/config');
}

function restoreEnvironment() {
  process.env = originalEnv;
  delete require.cache[configModulePath];
}

try {
  let config = loadConfigWithTemperatures(undefined, undefined);
  assert.strictEqual(config.aiTemperatureAnalysis, 0.3, 'Expected default analysis temperature to be 0.3');
  assert.strictEqual(config.aiTemperatureGeneration, 0.7, 'Expected default generation temperature to be 0.7');

  config = loadConfigWithTemperatures('1', '0');
  assert.strictEqual(config.aiTemperatureAnalysis, 1, 'Expected valid analysis temperature to be parsed');
  assert.strictEqual(config.aiTemperatureGeneration, 0, 'Expected valid generation temperature to be parsed');

  config = loadConfigWithTemperatures('2.0', '1.8');
  assert.strictEqual(config.aiTemperatureAnalysis, 2, 'Expected max allowed analysis temperature to be accepted');
  assert.strictEqual(config.aiTemperatureGeneration, 1.8, 'Expected valid decimal generation temperature to be accepted');

  config = loadConfigWithTemperatures('-0.1', '2.1');
  assert.strictEqual(config.aiTemperatureAnalysis, 0.3, 'Expected out-of-range analysis temperature to fall back');
  assert.strictEqual(config.aiTemperatureGeneration, 0.7, 'Expected out-of-range generation temperature to fall back');

  config = loadConfigWithTemperatures('abc', '');
  assert.strictEqual(config.aiTemperatureAnalysis, 0.3, 'Expected invalid analysis temperature to fall back');
  assert.strictEqual(config.aiTemperatureGeneration, 0.7, 'Expected empty generation temperature to fall back');

  restoreEnvironment();
  console.log('[PASS] AI temperature config parsing and fallback checks passed');
} catch (error) {
  restoreEnvironment();
  console.error('[FAIL] AI temperature config test failed:', error.message);
  process.exit(1);
}
