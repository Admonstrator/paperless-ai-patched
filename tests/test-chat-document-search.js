const assert = require('assert');
const paperlessService = require('../services/paperlessService');

function createMockClient(documents) {
  return {
    get: async (_url, options = {}) => {
      const params = options.params || {};

      let filtered = [...documents];

      const includeTagIds = String(params.tags__id__in || '')
        .split(',')
        .map(id => Number(id.trim()))
        .filter(Number.isInteger);

      if (includeTagIds.length > 0) {
        const includeSet = new Set(includeTagIds);
        filtered = filtered.filter(doc =>
          Array.isArray(doc.tags) && doc.tags.some(tagId => includeSet.has(Number(tagId)))
        );
      }

      if (params.query) {
        const term = String(params.query).toLowerCase();
        filtered = filtered.filter(doc =>
          String(doc.title || '').toLowerCase().includes(term)
          || String(doc.id).includes(term)
        );
      }

      if (params.ordering === '-created') {
        filtered.sort((a, b) => String(b.created || '').localeCompare(String(a.created || '')));
      }

      const page = Math.max(1, Number(params.page || 1));
      const pageSize = Math.max(1, Number(params.page_size || 100));
      const offset = (page - 1) * pageSize;
      const paged = filtered.slice(offset, offset + pageSize);
      const next = offset + pageSize < filtered.length ? `?page=${page + 1}` : null;

      return {
        data: {
          results: paged,
          next
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

  paperlessService.ensureTagCache = async () => {};
  paperlessService.findExistingTag = async (name) => {
    const normalized = String(name || '').toLowerCase();
    if (normalized === 'include') return { id: 10, name: 'include' };
    if (normalized === 'exclude') return { id: 20, name: 'exclude' };
    return null;
  };

  try {
    const docs = [
      { id: 1, title: 'Invoice Alpha', correspondent: 3, created: '2026-03-02', tags: [10] },
      { id: 2, title: 'Invoice Beta', correspondent: 4, created: '2026-03-03', tags: [10, 20] },
      { id: 3, title: 'Report', correspondent: 5, created: '2026-03-01', tags: [10] },
      { id: 4, title: 'Invoice Gamma', correspondent: 7, created: '2026-03-04', tags: [20] },
      { id: 5, title: 'Invoice Delta', correspondent: 8, created: '2026-03-05', tags: [10] }
    ];

    process.env.PROCESS_PREDEFINED_DOCUMENTS = 'yes';
    process.env.TAGS = 'include';
    process.env.IGNORE_TAGS = 'exclude';

    paperlessService.client = createMockClient(docs);

    const searchResult = await paperlessService.searchDocumentsForChat({ query: 'invoice', limit: 2 });

    assert.deepStrictEqual(
      searchResult.map(doc => doc.id),
      [5, 1],
      'Search should respect include/exclude tag filters, ordering, and limit'
    );

    const unboundedLimitResult = await paperlessService.searchDocumentsForChat({ query: '', limit: 1000 });
    assert.ok(unboundedLimitResult.length <= 100, 'Search limit must be capped at 100');

    console.log('✅ test-chat-document-search passed');
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
  console.error('❌ test-chat-document-search failed:', error);
  process.exit(1);
});
