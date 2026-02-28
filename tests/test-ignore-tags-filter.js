const assert = require('assert');
const paperlessService = require('../services/paperlessService');

function createMockClient(documents) {
  return {
    get: async (_url, options = {}) => {
      const includeTagIds = String(options.params?.tags__id__in || '')
        .split(',')
        .map(id => id.trim())
        .filter(Boolean)
        .map(id => Number(id))
        .filter(Number.isInteger);

      let filteredDocuments = documents;
      if (includeTagIds.length > 0) {
        const includeSet = new Set(includeTagIds);
        filteredDocuments = documents.filter(doc =>
          Array.isArray(doc.tags) && doc.tags.some(tagId => includeSet.has(Number(tagId)))
        );
      }

      if (options.params?.count) {
        return { data: { count: filteredDocuments.length } };
      }

      return {
        data: {
          results: filteredDocuments,
          next: null
        }
      };
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
  const originalEnsureTagCache = paperlessService.ensureTagCache;
  const originalFindExistingTag = paperlessService.findExistingTag;

  const tagMap = new Map([
    ['include', { id: 10, name: 'include' }],
    ['exclude', { id: 20, name: 'exclude' }]
  ]);

  paperlessService.ensureTagCache = async () => {};
  paperlessService.findExistingTag = async (name) => tagMap.get(String(name).toLowerCase()) || null;

  try {
    const baseDocuments = [
      { id: 1, tags: [10] },
      { id: 2, tags: [10, 20] },
      { id: 3, tags: [20] },
      { id: 4, tags: [] },
      { id: 5 }
    ];

    process.env.PROCESS_PREDEFINED_DOCUMENTS = 'yes';
    process.env.TAGS = 'include';
    process.env.IGNORE_TAGS = 'exclude';
    paperlessService.client = createMockClient(baseDocuments);

    const includeAndExcludeDocs = await paperlessService.getAllDocuments({ fields: 'id,tags' });
    assert.deepStrictEqual(
      includeAndExcludeDocs.map(doc => doc.id),
      [1],
      'Only include-tagged documents without ignore tags should remain'
    );

    const includeAndExcludeCount = await paperlessService.getEffectiveDocumentCount();
    assert.strictEqual(includeAndExcludeCount, 1, 'Effective count should match include/exclude filtered result');

    process.env.PROCESS_PREDEFINED_DOCUMENTS = 'no';
    process.env.TAGS = '';
    process.env.IGNORE_TAGS = 'exclude';

    const excludeOnlyDocs = await paperlessService.getAllDocuments({ fields: 'id,tags' });
    assert.deepStrictEqual(
      excludeOnlyDocs.map(doc => doc.id),
      [1, 4, 5],
      'Exclude tags should remove matching documents from regular scans'
    );

    process.env.IGNORE_TAGS = '';

    const noExcludeDocs = await paperlessService.getAllDocuments({ fields: 'id,tags' });
    assert.deepStrictEqual(
      noExcludeDocs.map(doc => doc.id),
      [1, 2, 3, 4, 5],
      'Without ignore tags all documents should be returned'
    );

    console.log('✅ test-ignore-tags-filter passed');
  } finally {
    process.env.PROCESS_PREDEFINED_DOCUMENTS = originalEnv.PROCESS_PREDEFINED_DOCUMENTS;
    process.env.TAGS = originalEnv.TAGS;
    process.env.IGNORE_TAGS = originalEnv.IGNORE_TAGS;

    paperlessService.client = originalClient;
    paperlessService.ensureTagCache = originalEnsureTagCache;
    paperlessService.findExistingTag = originalFindExistingTag;
  }
}

run().catch(error => {
  console.error('❌ test-ignore-tags-filter failed:', error);
  process.exit(1);
});
