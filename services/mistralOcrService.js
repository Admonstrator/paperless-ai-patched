// services/mistralOcrService.js
//
// Mistral OCR Service – Downloads a document from Paperless-ngx as PDF,
// sends it to the Mistral OCR API (mistral-ocr-latest), and attempts to
// write the extracted markdown text back to Paperless-ngx via PATCH.
// Falls back to storing the OCR text locally in the ocr_queue table when
// the Paperless PATCH endpoint does not allow writing the content field.

const axios = require('axios');
const config = require('../config/config');
const PaperlessService = require('./paperlessService');
const documentModel = require('../models/document');
const AIServiceFactory = require('./aiServiceFactory');

class MistralOcrService {
  constructor() {
    this.apiBase = 'https://api.mistral.ai/v1';
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  get apiKey() {
    return config.mistralOcr?.apiKey || process.env.MISTRAL_API_KEY || '';
  }

  get model() {
    return config.mistralOcr?.model || 'mistral-ocr-latest';
  }

  isEnabled() {
    return config.mistralOcr?.enabled === 'yes';
  }

  // ── Core Methods ─────────────────────────────────────────────────────────

  /**
   * Download document from Paperless-ngx as a base64-encoded PDF/file.
   * @param {number} documentId
   * @returns {Promise<{base64: string, mimeType: string}>}
   */
  async downloadDocumentAsBase64(documentId) {
    PaperlessService.initialize();
    const response = await PaperlessService.client.get(
      `/documents/${documentId}/download/`,
      { responseType: 'arraybuffer' }
    );
    const mimeType = response.headers['content-type'] || 'application/pdf';
    const base64 = Buffer.from(response.data).toString('base64');
    return { base64, mimeType };
  }

  /**
   * Send a base64-encoded document to Mistral OCR and return concatenated markdown.
   * @param {string} base64 - base64-encoded document
   * @param {string} mimeType - MIME type of the document
   * @returns {Promise<string>} - Extracted text as markdown
   */
  async performOcr(base64, mimeType = 'application/pdf') {
    if (!this.apiKey) {
      throw new Error('MISTRAL_API_KEY is not configured');
    }

    const documentUrl = `data:${mimeType};base64,${base64}`;

    const response = await axios.post(
      `${this.apiBase}/ocr`,
      {
        model: this.model,
        document: {
          type: 'document_url',
          document_url: documentUrl
        },
        include_image_base64: false
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000 // 2 minute timeout for large documents
      }
    );

    const pages = response.data?.pages || [];
    if (pages.length === 0) {
      throw new Error('Mistral OCR returned no pages');
    }

    return pages.map(p => p.markdown || '').join('\n\n').trim();
  }

  /**
   * Attempt to write OCR text back to Paperless-ngx via PATCH.
   * Returns true if successful, false if Paperless rejected the write
   * (in which case the caller should store the text locally).
   * @param {number} documentId
   * @param {string} ocrText
   * @returns {Promise<boolean>}
   */
  async writeBackContent(documentId, ocrText) {
    try {
      PaperlessService.initialize();
      await PaperlessService.client.patch(`/documents/${documentId}/`, {
        content: ocrText
      });
      console.log(`[OCR] Successfully wrote OCR text back to Paperless for document ${documentId}`);
      return true;
    } catch (error) {
      const status = error.response?.status;
      console.warn(
        `[OCR] Could not write OCR text to Paperless for document ${documentId} ` +
        `(HTTP ${status || 'unknown'}). Text stored locally only.`
      );
      return false;
    }
  }

  /**
   * Full OCR pipeline for a single queue item.
   * Emits progress events via the optional progressCallback(step, message).
   *
   * Steps: 'download' | 'ocr' | 'writeback' | 'ai' | 'done' | 'error'
   *
   * @param {number} documentId
   * @param {object} opts
   * @param {boolean} [opts.autoAnalyze=false] - Run AI analysis after OCR
   * @param {Function} [opts.progressCallback] - (step, message, data?) => void
   * @returns {Promise<{ocrText: string, wroteBack: boolean, aiAnalysis?: object}>}
   */
  async processQueueItem(documentId, opts = {}) {
    const { autoAnalyze = false, progressCallback = null } = opts;
    const emit = (step, message, data = {}) => {
      if (progressCallback) progressCallback(step, message, data);
    };

    await documentModel.updateOcrQueueStatus(documentId, 'processing');

    try {
      // Step 1: Download
      emit('download', `Downloading document ${documentId} from Paperless-ngx…`);
      let base64, mimeType;
      try {
        ({ base64, mimeType } = await this.downloadDocumentAsBase64(documentId));
      } catch (dlErr) {
        throw new Error(`Download failed: ${dlErr.message}`);
      }
      emit('download', `Download complete (${mimeType}).`);

      // Step 2: OCR
      emit('ocr', 'Sending document to Mistral OCR…');
      let ocrText;
      try {
        ocrText = await this.performOcr(base64, mimeType);
      } catch (ocrErr) {
        throw new Error(`Mistral OCR failed: ${ocrErr.message}`);
      }
      const previewLen = Math.min(ocrText.length, 120);
      emit('ocr', `OCR complete. Extracted ${ocrText.length} characters.`, {
        preview: ocrText.substring(0, previewLen)
      });

      // Step 3: Write back
      emit('writeback', 'Writing OCR text back to Paperless-ngx…');
      const wroteBack = await this.writeBackContent(documentId, ocrText);
      if (wroteBack) {
        emit('writeback', 'OCR text successfully written to Paperless-ngx.');
      } else {
        emit('writeback', 'Paperless-ngx does not allow writing content. OCR text stored locally.');
      }

      // Persist result in queue
      await documentModel.updateOcrQueueStatus(documentId, 'done', ocrText);

      let aiResult = null;
      if (autoAnalyze) {
        emit('ai', 'Starting AI analysis with OCR text…');
        try {
          aiResult = await this._runAiAnalysis(documentId, ocrText);
          emit('ai', 'AI analysis complete.');
        } catch (aiErr) {
          emit('ai', `AI analysis failed: ${aiErr.message}. OCR text is still available.`);
        }
      }

      emit('done', 'Processing finished successfully.');
      return { ocrText, wroteBack, aiAnalysis: aiResult };

    } catch (error) {
      await documentModel.updateOcrQueueStatus(documentId, 'failed');
      emit('error', error.message);
      throw error;
    }
  }

  /**
   * Run AI analysis only, using existing OCR text.
   * Does not trigger any OCR download/API calls.
   *
   * @param {number} documentId
   * @param {string} ocrText
   * @param {Function} [progressCallback] - (step, message, data?) => void
   * @returns {Promise<object>} AI analysis result
   */
  async analyzeFromExistingOcrText(documentId, ocrText, progressCallback = null) {
    const emit = (step, message, data = {}) => {
      if (progressCallback) progressCallback(step, message, data);
    };

    if (typeof ocrText !== 'string' || !ocrText.trim()) {
      throw new Error('No OCR text available for AI analysis');
    }

    emit('ai', `Starting AI analysis for document ${documentId} using stored OCR text…`);
    try {
      const aiResult = await this._runAiAnalysis(documentId, ocrText);
      emit('ai', 'AI analysis complete.');
      emit('done', 'AI-only processing finished successfully.');
      return aiResult;
    } catch (error) {
      emit('error', `AI analysis failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Run AI analysis on a document using OCR text (instead of Paperless content).
   * Mirrors the processDocument / buildUpdateData / saveDocumentChanges flow
   * from server.js but accepts pre-extracted text.
   * @private
   */
  async _runAiAnalysis(documentId, ocrText) {
    const [existingTags, existingCorrespondentList, existingDocumentTypes, originalData] = await Promise.all([
      PaperlessService.getTags(),
      PaperlessService.listCorrespondentsNames(),
      PaperlessService.listDocumentTypesNames(),
      PaperlessService.getDocument(documentId)
    ]);

    const existingTagNames = existingTags.map(t => t.name);
    const correspondentNames = existingCorrespondentList.map(c => c.name);
    const documentTypeNames = existingDocumentTypes.map(d => d.name);

    // Truncate to 50 000 chars as in normal flow
    const contentForAi = ocrText.length > 50000 ? ocrText.substring(0, 50000) : ocrText;

    const aiService = AIServiceFactory.getService();
    const analysis = await aiService.analyzeDocument(
      contentForAi,
      existingTagNames,
      correspondentNames,
      documentTypeNames,
      documentId
    );

    if (analysis.error) {
      throw new Error(analysis.error);
    }

    // Build update data (simplified – reuse paperlessService helpers)
    const updateData = {};
    const { validateCustomFieldValue } = require('./serviceUtils');
    const config = require('../config/config');

    if (config.limitFunctions?.activateTagging !== 'no') {
      const { tagIds } = await PaperlessService.processTags(analysis.document.tags);
      updateData.tags = tagIds;
    }
    if (config.limitFunctions?.activateTitle !== 'no') {
      updateData.title = analysis.document.title || originalData.title;
    }
    updateData.created = analysis.document.document_date || originalData.created;
    if (config.limitFunctions?.activateDocumentType !== 'no' && analysis.document.document_type) {
      const dt = await PaperlessService.getOrCreateDocumentType(analysis.document.document_type);
      if (dt) updateData.document_type = dt.id;
    }
    if (config.limitFunctions?.activateCorrespondents !== 'no' && analysis.document.correspondent) {
      const corr = await PaperlessService.getOrCreateCorrespondent(analysis.document.correspondent);
      if (corr) updateData.correspondent = corr.id;
    }
    if (analysis.document.language) {
      updateData.language = analysis.document.language;
    }

    // Apply updates to Paperless
    await PaperlessService.updateDocument(documentId, updateData);

    // Persist metrics & history
    if (analysis.metrics) {
      await documentModel.addOpenAIMetrics(
        documentId,
        analysis.metrics.promptTokens,
        analysis.metrics.completionTokens,
        analysis.metrics.totalTokens
      );
    }
    await documentModel.addProcessedDocument(documentId, updateData.title || originalData.title);
    await documentModel.addToHistory(
      documentId,
      updateData.tags || [],
      updateData.title || originalData.title,
      analysis.document.correspondent,
      null,
      analysis.document.document_type || null,
      analysis.document.language || null
    );

    return analysis;
  }
}

module.exports = new MistralOcrService();
