// services/ragService.js
const axios = require('axios');
const config = require('../config/config');
const AIServiceFactory = require('./aiServiceFactory');
const paperlessService = require('./paperlessService');

const DEFAULT_TIMEOUT = 30000;

class RagService {
  constructor() {
    this.baseUrl = process.env.RAG_SERVICE_URL || 'http://localhost:8000';
    this.aiStatusCache = null;
    this.aiStatusCacheTs = 0;
    this.aiStatusTtlMs = Number(process.env.RAG_AI_STATUS_TTL_MS || 300000);
  }

  _getClient() {
    return axios.create({ timeout: DEFAULT_TIMEOUT });
  }

  /**
   * Check if the RAG service is available and ready
   * @returns {Promise<{status: string, index_ready: boolean, data_loaded: boolean}>}
   */
  async checkStatus() {
    try {
      const client = await this._getClient();
      const response = await client.get(`${this.baseUrl}/status`);
      return response.data;
    } catch (error) {
      console.error('Error checking RAG service status:', error.message);
      return {
        server_up: false,
        data_loaded: false,
        index_ready: false,
        error: error.message
      };
    }
  }

  /**
   * Search for documents matching a query
   * @param {string} query - The search query
   * @param {Object} filters - Optional filters for search
   * @returns {Promise<Array>} - Array of search results
   */
  async search(query, filters = {}) {
    try {
      const client = await this._getClient();
      const response = await client.post(`${this.baseUrl}/search`, {
        query,
        ...filters
      });
      return response.data;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }

  /**
   * Ask a question about documents and get an AI-generated answer in the same language as the question
   * @param {string} question - The question to ask
   * @returns {Promise<{answer: string, sources: Array}>} - AI response and source documents
   */
  async askQuestion(question) {
    try {
      const client = await this._getClient();
      // 1. Get context from the RAG service
      const response = await client.post(`${this.baseUrl}/context`, { 
        question,
        max_sources: 5
      });
      
      const { context, sources: originalSources } = response.data;
      
      // 2. Fetch full content for each source document using doc_id
      let enhancedContext = context;
      let sources = originalSources;
      const failedDocIds = [];
      const MAX_CONTEXT_TOKENS = 8000;
      const CHARS_PER_TOKEN = 4;
      const maxContextChars = MAX_CONTEXT_TOKENS * CHARS_PER_TOKEN;
      
      if (sources && sources.length > 0) {
        // Fetch full document content for each source
        const fullDocContents = await Promise.all(
          sources.map(async (source) => {
            if (source.doc_id) {
              try {
                const fullContent = await paperlessService.getDocumentContent(source.doc_id);
                return { docId: source.doc_id, title: source.title, content: fullContent, success: true };
              } catch (error) {
                console.error(`Error fetching content for document ${source.doc_id}:`, error.message);
                failedDocIds.push(source.doc_id);
                return { docId: source.doc_id, title: source.title, content: null, success: false };
              }
            }
            return null;
          })
        );
        
        // Build enhanced context with token limit
        let totalChars = context.length;
        const includedDocs = [];
        
        for (const doc of fullDocContents) {
          if (!doc || !doc.content) continue;
          
          const docText = `Full document content for ${doc.title || 'Document ' + doc.docId}:\n${doc.content}`;
          
          // Check if adding this document would exceed the limit
          if (totalChars + docText.length > maxContextChars) {
            // Try to fit a truncated version
            const remainingChars = maxContextChars - totalChars - 50; // 50 for the wrapper text
            if (remainingChars > 500) {
              const truncatedText = `Full document content for ${doc.title || 'Document ' + doc.docId}:\n${doc.content.substring(0, remainingChars)}...\n[truncated]`;
              includedDocs.push(truncatedText);
              totalChars += truncatedText.length;
            }
            break; // No more docs can fit
          }
          
          includedDocs.push(docText);
          totalChars += docText.length;
        }
        
        if (includedDocs.length > 0) {
          enhancedContext = context + '\n\n' + includedDocs.join('\n\n');
        }
        
        // Update sources to only include successfully fetched docs
        sources = sources.filter(s => !failedDocIds.includes(s.doc_id));
      }
      
      // 3. Use AI service to generate an answer based on the enhanced context
      const aiService = AIServiceFactory.getService();
      
      // Create a language-agnostic prompt that works in any language
      const prompt = `
        You are a helpful assistant that answers questions about documents.

        Answer the following question precisely, based on the provided documents:

        Question: ${question}

        Context from relevant documents:
        ${enhancedContext}

        Important instructions:
        - Use ONLY information from the provided documents
        - If the answer is not contained in the documents, respond: "This information is not contained in the documents." (in the same language as the question)
        - Avoid assumptions or speculation beyond the given context
        - Answer in the same language as the question was asked
        - Do not mention document numbers or source references, answer as if it were a natural conversation
        `;

      let answer;
      try {
        answer = await aiService.generateText(prompt);
      } catch (error) {
        console.error('Error generating answer with AI service:', error);
        answer = "An error occurred while generating an answer. Please try again later.";
      }
      
      return {
        answer,
        sources
      };
    } catch (error) {
      console.error('Error in askQuestion:', error);
      throw new Error("An error occurred while processing your question. Please try again later.");
    }
  }

  /**
   * Start indexing documents in the RAG service
   * @param {boolean} force - Whether to force refresh from source
   * @returns {Promise<Object>} - Indexing status
   */
  async indexDocuments(force = false) {
    try {
      const client = await this._getClient();
      const response = await client.post(`${this.baseUrl}/indexing/start`, { 
        force, 
        background: true 
      });
      return response.data;
    } catch (error) {
      console.error('Error indexing documents:', error);
      throw error;
    }
  }

  /**
   * Check if the RAG service needs document updates
   * @returns {Promise<{needs_update: boolean, message: string}>}
   */
  async checkForUpdates() {
    try {
      const client = await this._getClient();
      const response = await client.post(`${this.baseUrl}/indexing/check`);
      return response.data;
    } catch (error) {
      console.error('Error checking for updates:', error);
      throw error;
    }
  }

  /**
   * Get current indexing status
   * @returns {Promise<Object>} - Current indexing status
   */
  async getIndexingStatus() {
    try {
      const client = await this._getClient();
      const response = await client.get(`${this.baseUrl}/indexing/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting indexing status:', error);
      throw error;
    }
  }

  /**
   * Initialize the RAG service
   * @param {boolean} force - Whether to force initialization
   * @returns {Promise<Object>} - Initialization status
   */
  async initialize(force = false) {
    try {
      const client = await this._getClient();
      const response = await client.post(`${this.baseUrl}/initialize`, { force });
      return response.data;
    } catch (error) {
      console.error('Error initializing RAG service:', error);
      throw error;
    }
  }

  /**
   * Force clear model cache and re-download models
   * @returns {Promise<Object>} - Model refresh status
   */
  async redownloadModels() {
    try {
      const client = await this._getClient();
      const response = await client.post(`${this.baseUrl}/models/redownload`, {
        background: true
      });
      return response.data;
    } catch (error) {
      console.error('Error triggering model re-download:', error);
      throw error;
    }
  }

  /**
   * Schedule a restart of the Python RAG service process.
   * @param {{reason?: string, delaySeconds?: number}} options
   * @returns {Promise<Object>}
   */
  async restartPythonService(options = {}) {
    const { reason = 'config_save', delaySeconds = 0.75 } = options;

    try {
      const client = await this._getClient();
      const response = await client.post(
        `${this.baseUrl}/system/restart`,
        {
          reason,
          delay_seconds: delaySeconds
        },
        {
          timeout: 3000
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error scheduling Python RAG service restart:', error.message || error);
      throw error;
    }
  }

  /**
   * Get AI status
   * @returns {Promise<{status: string}>}
   */
  async getAIStatus({ force = false } = {}) {
    const now = Date.now();
    const hasFreshCache =
      !force &&
      this.aiStatusCache &&
      now - this.aiStatusCacheTs < this.aiStatusTtlMs;

    // Avoid expensive provider ping calls on each UI polling interval.
    if (hasFreshCache) {
      return this.aiStatusCache;
    }

    try {
      const aiService = AIServiceFactory.getService();
      const status = await aiService.checkStatus();
      this.aiStatusCache = status || { status: 'unknown' };
      this.aiStatusCacheTs = now;
      return this.aiStatusCache;
    } catch (error) {
      console.error('Error checking AI service status:', error);
      if (this.aiStatusCache) {
        return this.aiStatusCache;
      }

      return { status: 'error', error: error.message || 'AI status unavailable' };
    }
  }
}


module.exports = new RagService();
