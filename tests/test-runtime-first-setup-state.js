const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const setupServiceModulePath = require.resolve('../services/setupService');

const originalCwd = process.cwd();
const originalEnv = { ...process.env };

function resetModule(modulePath) {
  delete require.cache[modulePath];
}

async function main() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'paperless-ai-runtime-first-setup-'));
  const dataDir = path.join(tempDir, 'data');
  fs.mkdirSync(dataDir, { recursive: true });

  process.chdir(tempDir);
  process.env = {
    ...originalEnv,
    CONFIG_SOURCE_MODE: 'runtime-first',
    PAPERLESS_API_URL: 'http://paperless.example/api',
    AI_PROVIDER: 'openai',
    OPENAI_API_KEY: 'test-key'
  };

  resetModule(setupServiceModulePath);
  const setupService = require(setupServiceModulePath);

  const isConfigured = await setupService.isConfigured();
  assert.strictEqual(
    isConfigured,
    true,
    'Expected runtime-first mode to be configured without requiring data/.env'
  );

  const setupState = await setupService.getSetupState();
  assert.notStrictEqual(
    setupState,
    'first-run',
    'Expected runtime-first mode to not report first-run just because data/.env is absent'
  );

  fs.rmSync(tempDir, { recursive: true, force: true });
}

main()
  .then(() => {
    console.log('[PASS] Runtime-first setup detection no longer depends on data/.env presence');
  })
  .catch((error) => {
    console.error('[FAIL] Runtime-first setup state regression failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => {
    process.chdir(originalCwd);
    process.env = originalEnv;
    resetModule(setupServiceModulePath);
  });
