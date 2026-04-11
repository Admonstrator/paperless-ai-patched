const assert = require('assert');
const axios = require('axios');

function loadRagServiceWithSecret(secret) {
  if (typeof secret === 'string') {
    process.env.RAG_API_SECRET = secret;
  } else {
    delete process.env.RAG_API_SECRET;
  }

  delete require.cache[require.resolve('../services/ragService')];
  return require('../services/ragService');
}

async function run() {
  const originalGet = axios.get;
  const originalPost = axios.post;
  const originalSecret = process.env.RAG_API_SECRET;

  try {
    const capturedWithSecret = [];

    axios.get = async (url, config = {}) => {
      capturedWithSecret.push({ method: 'GET', url, config });
      return { data: { ok: true } };
    };

    axios.post = async (url, data = {}, config = {}) => {
      capturedWithSecret.push({ method: 'POST', url, data, config });
      return { data: { ok: true, context: '', sources: [] } };
    };

    const ragServiceWithSecret = loadRagServiceWithSecret('unit-test-rag-secret');

    await ragServiceWithSecret.checkStatus();
    await ragServiceWithSecret.search('invoice');
    await ragServiceWithSecret.indexDocuments(true);
    await ragServiceWithSecret.checkForUpdates();
    await ragServiceWithSecret.getIndexingStatus();
    await ragServiceWithSecret.initialize(true);
    await ragServiceWithSecret.redownloadModels();
    await ragServiceWithSecret.restartPythonService({ reason: 'test', delaySeconds: 0.1 });

    assert.ok(capturedWithSecret.length >= 8, 'Expected multiple RAG HTTP requests to be captured');

    for (const entry of capturedWithSecret) {
      assert.ok(entry.config, `Missing config for ${entry.method} ${entry.url}`);
      assert.ok(entry.config.headers, `Missing headers for ${entry.method} ${entry.url}`);
      assert.strictEqual(
        entry.config.headers.Authorization,
        'Bearer unit-test-rag-secret',
        `Missing Bearer header for ${entry.method} ${entry.url}`
      );
    }

    const capturedWithoutSecret = [];

    axios.get = async (url, config = {}) => {
      capturedWithoutSecret.push({ method: 'GET', url, config });
      return { data: { ok: true } };
    };

    const ragServiceWithoutSecret = loadRagServiceWithSecret(undefined);
    await ragServiceWithoutSecret.checkStatus();

    assert.strictEqual(capturedWithoutSecret.length, 1, 'Expected exactly one request without secret');
    const noSecretHeaders = capturedWithoutSecret[0].config.headers || {};
    assert.strictEqual(
      noSecretHeaders.Authorization,
      undefined,
      'Authorization header should not be set when RAG_API_SECRET is unset'
    );

    console.log('✅ test-rag-service-auth-header passed');
  } finally {
    axios.get = originalGet;
    axios.post = originalPost;

    if (typeof originalSecret === 'string') {
      process.env.RAG_API_SECRET = originalSecret;
    } else {
      delete process.env.RAG_API_SECRET;
    }

    delete require.cache[require.resolve('../services/ragService')];
  }
}

run().catch(error => {
  console.error('❌ test-rag-service-auth-header failed:', error);
  process.exit(1);
});
