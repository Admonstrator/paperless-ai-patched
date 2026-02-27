// services/documentsService.js
const paperlessService = require('./paperlessService');

class DocumentsService {
  constructor() {
    // No local cache needed - using centralized cache in paperlessService
  }

  async getTagNames() {
    // Use centralized tag cache from paperlessService
    const tags = await paperlessService.getTags();
    const tagMap = new Map();
    tags.forEach(tag => {
      tagMap.set(tag.id, tag.name);
    });
    return Object.fromEntries(tagMap);
  }

  async getCorrespondentNames() {
    // Use centralized correspondent data from paperlessService
    const correspondents = await paperlessService.listCorrespondentsNames();
    const corrMap = new Map();
    correspondents.forEach(corr => {
      corrMap.set(corr.id, corr.name);
    });
    return Object.fromEntries(corrMap);
  }

  async getDocumentsWithMetadata() {
    const [documents, tagNames, correspondentNames] = await Promise.all([
      paperlessService.getDocuments(),
      this.getTagNames(),
      this.getCorrespondentNames()
    ]);

    // Sort documents by created date (newest first)
    documents.sort((a, b) => new Date(b.created) - new Date(a.created));

    return {
      documents,
      tagNames,
      correspondentNames,
      paperlessUrl: process.env.PAPERLESS_API_URL.replace('/api', '')
    };
  }
}

module.exports = new DocumentsService();