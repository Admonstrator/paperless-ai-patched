const assert = require('assert');
const documentsService = require('../services/documentsService');
const paperlessService = require('../services/paperlessService');

async function run() {
  const originalSearchDocumentsForChat = paperlessService.searchDocumentsForChat;
  const originalGetCorrespondentNames = documentsService.getCorrespondentNames;

  try {
    paperlessService.searchDocumentsForChat = async ({ query }) => {
      if (query) {
        // Simulate no upstream full-text hit for correspondent-based query.
        return [];
      }

      return [
        { id: 42, title: 'Tax Notice', correspondent: 11, created: '2026-03-04' },
        { id: 77, title: 'Invoice 77', correspondent: 12, created: '2026-03-03' }
      ];
    };

    documentsService.getCorrespondentNames = async () => ({
      11: 'ACME GmbH',
      12: 'Beta Corp'
    });

    const correspondentMatches = await documentsService.searchDocumentsForChat({ query: 'acme', limit: 25 });
    assert.deepStrictEqual(
      correspondentMatches.map(doc => doc.id),
      [42],
      'Fallback pass should allow correspondent-name matches'
    );

    const idMatches = await documentsService.searchDocumentsForChat({ query: '42', limit: 25 });
    assert.deepStrictEqual(
      idMatches.map(doc => doc.id),
      [42],
      'Fallback pass should allow id-based matches'
    );

    console.log('✅ test-chat-documents-service-search passed');
  } finally {
    paperlessService.searchDocumentsForChat = originalSearchDocumentsForChat;
    documentsService.getCorrespondentNames = originalGetCorrespondentNames;
  }
}

run().catch((error) => {
  console.error('❌ test-chat-documents-service-search failed:', error);
  process.exit(1);
});
