const assert = require('assert');
const paperlessService = require('../services/paperlessService');

function createCountClient() {
  let calls = 0;
  return {
    getCalls: () => calls,
    get: async (_url, options = {}) => {
      calls += 1;
      const params = options.params || {};

      if (params.tags__id__none) {
        return { data: { count: 7 } };
      }

      return { data: { count: 10 } };
    }
  };
}

async function run() {
  const originalEnv = {
    PROCESS_PREDEFINED_DOCUMENTS: process.env.PROCESS_PREDEFINED_DOCUMENTS,
    TAGS: process.env.TAGS,
    IGNORE_TAGS: process.env.IGNORE_TAGS
  };

  const originalClient = paperlessService.client;
  const originalResolveTagIdsByName = paperlessService.resolveTagIdsByName;
  const originalCache = paperlessService._effectiveCountCache;
  const originalSupportsNone = paperlessService._supportsTagsIdNone;

  try {
    process.env.PROCESS_PREDEFINED_DOCUMENTS = 'no';
    process.env.TAGS = '';
    process.env.IGNORE_TAGS = 'exclude';

    const client = createCountClient();
    paperlessService.client = client;
    paperlessService._effectiveCountCache = null;
    paperlessService._supportsTagsIdNone = null;
    paperlessService.resolveTagIdsByName = async () => [20];

    const firstCount = await paperlessService.getEffectiveDocumentCount();
    const secondCount = await paperlessService.getEffectiveDocumentCount();

    assert.strictEqual(firstCount, 7, 'First count should use filtered count endpoint');
    assert.strictEqual(secondCount, 7, 'Second count should return cached value');
    assert.strictEqual(client.getCalls(), 1, 'Second call should not trigger another API request');

    console.log('✅ test-effective-document-count-cache passed');
  } finally {
    process.env.PROCESS_PREDEFINED_DOCUMENTS = originalEnv.PROCESS_PREDEFINED_DOCUMENTS;
    process.env.TAGS = originalEnv.TAGS;
    process.env.IGNORE_TAGS = originalEnv.IGNORE_TAGS;

    paperlessService.client = originalClient;
    paperlessService.resolveTagIdsByName = originalResolveTagIdsByName;
    paperlessService._effectiveCountCache = originalCache;
    paperlessService._supportsTagsIdNone = originalSupportsNone;
  }
}

run().catch(error => {
  console.error('❌ test-effective-document-count-cache failed:', error);
  process.exit(1);
});
