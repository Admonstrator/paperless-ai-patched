// services/documentsService.js
const paperlessService = require('./paperlessService');

class DocumentsService {
  constructor() {
    // No local cache needed - using centralized cache in paperlessService
  }

  async getTagNames(tagIds = []) {
    const uniqueTagIds = [...new Set((Array.isArray(tagIds) ? tagIds : []).map(id => Number(id)).filter(Number.isInteger))];
    if (uniqueTagIds.length === 0) {
      return {};
    }

    const tagEntries = await Promise.all(uniqueTagIds.map(async (tagId) => {
      const tagName = await paperlessService.getTagNameById(tagId);
      return [tagId, tagName || 'Unknown'];
    }));

    return Object.fromEntries(tagEntries);
  }

  async getCorrespondentNames(correspondentIds = []) {
    const uniqueCorrespondentIds = [...new Set((Array.isArray(correspondentIds) ? correspondentIds : []).map(id => Number(id)).filter(Number.isInteger))];
    if (uniqueCorrespondentIds.length === 0) {
      return {};
    }

    const correspondentEntries = await Promise.all(uniqueCorrespondentIds.map(async (correspondentId) => {
      const correspondent = await paperlessService.getCorrespondentNameById(correspondentId);
      return [correspondentId, correspondent?.name || 'Unknown'];
    }));

    return Object.fromEntries(correspondentEntries);
  }

  async normalizeChatDocuments(documents = []) {
    const correspondentIds = documents
      .map((document) => Number(document.correspondent))
      .filter(Number.isInteger);

    const correspondentNames = await this.getCorrespondentNames(correspondentIds);

    return documents.map((document) => {
      const correspondentId = Number(document.correspondent);
      const correspondentName = Number.isInteger(correspondentId)
        ? (correspondentNames[correspondentId] || '')
        : '';

      return {
        id: document.id,
        title: document.title || `Document ${document.id}`,
        correspondent: correspondentName,
        correspondentId: Number.isInteger(correspondentId) ? correspondentId : null,
        created: document.created || null
      };
    });
  }

  filterChatDocumentsByQuery(documents = [], normalizedQuery = '') {
    if (!normalizedQuery) {
      return documents;
    }

    return documents.filter((document) => {
      const title = String(document.title || '').toLowerCase();
      const id = String(document.id || '').toLowerCase();
      const correspondent = String(document.correspondent || '').toLowerCase();

      return title.includes(normalizedQuery)
        || id.includes(normalizedQuery)
        || correspondent.includes(normalizedQuery);
    });
  }

  async getDocumentsWithMetadata() {
    const documents = await paperlessService.getRecentDocumentsWithMetadata(16);

    const tagIds = documents.flatMap((document) => Array.isArray(document.tags) ? document.tags : []);
    const correspondentIds = documents
      .map((document) => Number(document.correspondent))
      .filter(Number.isInteger);

    const [tagNames, correspondentNames] = await Promise.all([
      this.getTagNames(tagIds),
      this.getCorrespondentNames(correspondentIds)
    ]);

    const paperlessUrl = await paperlessService.getPublicBaseUrl();

    return {
      documents,
      tagNames,
      correspondentNames,
      paperlessUrl
    };
  }

  async searchDocumentsForChat({ query = '', limit = 25 } = {}) {
    const safeLimit = Number.isInteger(Number(limit)) ? Math.max(1, Math.min(Number(limit), 100)) : 25;
    const normalizedQuery = typeof query === 'string' ? query.trim().toLowerCase() : '';

    const documents = await paperlessService.searchDocumentsForChat({
      query,
      limit: safeLimit
    });

    const normalizedDocuments = await this.normalizeChatDocuments(documents);

    if (!normalizedQuery) {
      return normalizedDocuments.slice(0, safeLimit);
    }

    const filteredDocuments = this.filterChatDocumentsByQuery(normalizedDocuments, normalizedQuery);

    if (filteredDocuments.length > 0) {
      return filteredDocuments.slice(0, safeLimit);
    }

    // Fallback pass: query-less fetch lets us still match by id/correspondent locally.
    const fallbackDocuments = await paperlessService.searchDocumentsForChat({ query: '', limit: 100 });
    const normalizedFallbackDocuments = await this.normalizeChatDocuments(fallbackDocuments);
    const fallbackMatches = this.filterChatDocumentsByQuery(normalizedFallbackDocuments, normalizedQuery);

    return fallbackMatches.slice(0, safeLimit);
  }
}

module.exports = new DocumentsService();