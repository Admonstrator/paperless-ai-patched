const assert = require('assert');
const Module = require('module');

const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent, isMain) {
  if (request === 'axios') {
    return { create: () => ({}) };
  }

  if (request === 'dotenv') {
    return { config: () => ({}) };
  }

  if (request === 'date-fns') {
    return {
      parse: () => new Date(),
      isValid: () => true,
      parseISO: (value) => new Date(value),
      format: () => ''
    };
  }

  if (request === 'tiktoken') {
    return {
      encoding_for_model: () => ({
        encode: (text) => new Array(Math.ceil(String(text || '').length / 4)).fill(0),
        free: () => {}
      })
    };
  }

  return originalLoad.call(this, request, parent, isMain);
};

const paperlessService = require('../services/paperlessService');
Module._load = originalLoad;

async function run() {
  const originalEnv = process.env.RESTRICT_TO_EXISTING_DOCUMENT_TYPES;
  const originalInitialize = paperlessService.initialize;
  const originalClient = paperlessService.client;
  const originalSearchForExistingDocumentType = paperlessService.searchForExistingDocumentType;

  try {
    paperlessService.initialize = () => {};

    // Scenario 1: Restriction enabled via options => must not create new document type.
    let postCalled = false;
    paperlessService.client = {
      post: async () => {
        postCalled = true;
        return { data: { id: 999, name: 'ShouldNotBeCreated' } };
      },
      get: async () => ({ data: { results: [] } })
    };
    paperlessService.searchForExistingDocumentType = async () => null;

    const restrictedByOptions = await paperlessService.getOrCreateDocumentType('Book', {
      restrictToExistingDocumentTypes: true
    });

    assert.strictEqual(restrictedByOptions, null, 'Expected null when restriction is enabled via options');
    assert.strictEqual(postCalled, false, 'Should not call POST when restriction is enabled');

    // Scenario 2: Restriction disabled => may create new document type.
    postCalled = false;
    paperlessService.client.post = async () => {
      postCalled = true;
      return { data: { id: 38, name: 'Book' } };
    };

    const unrestricted = await paperlessService.getOrCreateDocumentType('Book', {
      restrictToExistingDocumentTypes: false
    });

    assert.ok(unrestricted, 'Expected created document type object');
    assert.strictEqual(unrestricted.id, 38, 'Expected created document type ID from mock');
    assert.strictEqual(postCalled, true, 'Expected POST call when restriction is disabled');

    // Scenario 3: Restriction from env fallback => must not create.
    process.env.RESTRICT_TO_EXISTING_DOCUMENT_TYPES = 'yes';
    postCalled = false;

    const restrictedByEnv = await paperlessService.getOrCreateDocumentType('Information');

    assert.strictEqual(restrictedByEnv, null, 'Expected null when restriction is enabled via env fallback');
    assert.strictEqual(postCalled, false, 'Should not call POST when env restriction is enabled');

    console.log('✅ test-document-type-restriction passed');
  } finally {
    if (originalEnv === undefined) {
      delete process.env.RESTRICT_TO_EXISTING_DOCUMENT_TYPES;
    } else {
      process.env.RESTRICT_TO_EXISTING_DOCUMENT_TYPES = originalEnv;
    }

    paperlessService.initialize = originalInitialize;
    paperlessService.client = originalClient;
    paperlessService.searchForExistingDocumentType = originalSearchForExistingDocumentType;
  }
}

run().catch((error) => {
  console.error('❌ test-document-type-restriction failed:', error);
  process.exit(1);
});
