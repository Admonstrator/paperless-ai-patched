// public/js/ocr.js – OCR Queue frontend logic

(function () {
    'use strict';

    // ── State ──────────────────────────────────────────────────────────────
    let currentPage = 0;
    const pageSize = 25;
    let totalRecords = 0;
    let paperlessUrl = '';
    let currentSearch = '';
    let currentStatus = '';
    let loadTimeout = null;
    let failedCurrentPage = 0;
    let failedTotalRecords = 0;

    // ── DOM refs ───────────────────────────────────────────────────────────
    const tableBody       = document.getElementById('ocrTableBody');
    const tableInfo       = document.getElementById('tableInfo');
    const prevBtn         = document.getElementById('prevPageBtn');
    const nextBtn         = document.getElementById('nextPageBtn');
    const statusFilter    = document.getElementById('statusFilter');
    const addManualBtn    = document.getElementById('addManualBtn');
    const manualDocId     = document.getElementById('manualDocId');
    const processAllBtn   = document.getElementById('processAllBtn');
    const autoAnalyze     = document.getElementById('autoAnalyzeToggle');
    const failedTableBody = document.getElementById('failedTableBody');
    const failedTableInfo = document.getElementById('failedTableInfo');
    const failedPrevBtn   = document.getElementById('failedPrevPageBtn');
    const failedNextBtn   = document.getElementById('failedNextPageBtn');

    // Progress overlay
    const overlay      = document.getElementById('progressOverlay');
    const progressLog  = document.getElementById('progressLog');
    const progressBar  = document.getElementById('progressBar');
    const progressTitle= document.getElementById('progressTitle');
    const closeBtn     = document.getElementById('progressCloseBtn');
    const doneBtn      = document.getElementById('progressDoneBtn');

    // ── Init ───────────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', function () {
        loadQueue();
        loadFailedQueue();
        loadStats();

        if (statusFilter) statusFilter.addEventListener('change', function () {
            currentStatus = this.value;
            currentPage = 0;
            loadQueue();
        });

        if (addManualBtn) addManualBtn.addEventListener('click', addManual);
        if (manualDocId) manualDocId.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') addManual();
        });

        if (processAllBtn) processAllBtn.addEventListener('click', processAll);
        if (prevBtn) prevBtn.addEventListener('click', function () { if (currentPage > 0) { currentPage--; loadQueue(); } });
        if (nextBtn) nextBtn.addEventListener('click', function () {
            const maxPage = Math.ceil(totalRecords / pageSize) - 1;
            if (currentPage < maxPage) { currentPage++; loadQueue(); }
        });
        if (failedPrevBtn) failedPrevBtn.addEventListener('click', function () {
            if (failedCurrentPage > 0) {
                failedCurrentPage--;
                loadFailedQueue();
            }
        });
        if (failedNextBtn) failedNextBtn.addEventListener('click', function () {
            const maxPage = Math.ceil(failedTotalRecords / pageSize) - 1;
            if (failedCurrentPage < maxPage) {
                failedCurrentPage++;
                loadFailedQueue();
            }
        });

        if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
        if (doneBtn)  doneBtn.addEventListener('click', closeOverlay);
    });

    // ── Load queue ─────────────────────────────────────────────────────────
    function loadQueue() {
        clearTimeout(loadTimeout);
        loadTimeout = setTimeout(_doLoad, 100);
    }

    async function _doLoad() {
        if (!tableBody) return;
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i> Loading…</td></tr>`;

        try {
            const params = new URLSearchParams({
                start: currentPage * pageSize,
                length: pageSize,
                search: currentSearch,
                status: currentStatus
            });
            const resp = await fetch(`/api/ocr/queue?${params}`);
            const data = await resp.json();
            if (!data.success) throw new Error(data.error);

            paperlessUrl = data.paperlessUrl || '';
            totalRecords = data.recordsTotal || 0;
            renderTable(data.data || []);
            updatePagination();
        } catch (err) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-red-500"><i class="fas fa-exclamation-triangle mr-2"></i>${escHtml(err.message)}</td></tr>`;
        }
    }

    // ── Render table ───────────────────────────────────────────────────────
    function formatReasonLabel(reason) {
        if (!reason) {
            return '<i class="fas fa-question-circle mr-1"></i>Unknown';
        }

        const reasonMap = {
            'short_content': '<i class="fas fa-file-slash mr-1"></i>Content too short',
            'short_content_lt_10': '<i class="fas fa-file-slash mr-1"></i>Content too short (&lt; 10 chars)',
            'ai_failed': '<i class="fas fa-robot mr-1"></i>AI analysis failed',
            'ai_insufficient_content': '<i class="fas fa-robot mr-1"></i>AI: insufficient content',
            'ai_invalid_json': '<i class="fas fa-brackets-curly mr-1"></i>AI: invalid JSON response',
            'ai_invalid_response_structure': '<i class="fas fa-diagram-project mr-1"></i>AI: invalid response structure',
            'ai_invalid_api_response_structure': '<i class="fas fa-server mr-1"></i>AI: invalid API response structure',
            'ai_failed_unknown': '<i class="fas fa-triangle-exclamation mr-1"></i>AI failed (unknown)',
            'manual': '<i class="fas fa-hand-pointer mr-1"></i>Manual'
        };

        if (reasonMap[reason]) {
            return reasonMap[reason];
        }

        if (reason.startsWith('short_content_lt_')) {
            const threshold = reason.replace('short_content_lt_', '');
            if (/^\d+$/.test(threshold)) {
                return `<i class="fas fa-file-slash mr-1"></i>Content too short (&lt; ${threshold} chars)`;
            }
        }

        return escHtml(reason);
    }

    function renderTable(items) {
        if (!items.length) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-gray-400"><i class="fas fa-inbox text-2xl mb-2 block"></i>Queue is empty</td></tr>`;
            return;
        }

        tableBody.innerHTML = items.map(item => {
            const docLink = paperlessUrl
                ? `<a href="${paperlessUrl}/documents/${item.document_id}/details" target="_blank" class="text-blue-500 hover:underline font-mono">#${item.document_id}</a>`
                : `<span class="font-mono">#${item.document_id}</span>`;

            const reasonLabel = formatReasonLabel(item.reason);

            const statusHtml = `<span class="status-badge status-${escHtml(item.status)}">${statusIcon(item.status)} ${escHtml(item.status)}</span>`;

            const addedDate = item.added_at ? new Date(item.added_at).toLocaleString() : '–';

            const processBtn = (item.status === 'pending' || item.status === 'failed')
                ? `<button class="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 transition-colors process-btn" data-id="${item.document_id}" title="Send to Mistral OCR"><i class="fas fa-play"></i> Process</button>`
                : '';

            const hasOcrText = !!(item.ocr_text && String(item.ocr_text).trim());
            const analyzeBtn = (item.status === 'done' && hasOcrText)
                ? `<button class="px-3 py-1 bg-violet-500 text-white rounded-lg text-xs hover:bg-violet-600 transition-colors analyze-btn" data-id="${item.document_id}" title="Start AI analysis using existing OCR text"><i class="fas fa-robot"></i> Analyze with AI now</button>`
                : '';

            const infoBtn = hasOcrText
                ? `<button class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 transition-colors info-btn" data-id="${item.document_id}" title="Show OCR output"><i class="fas fa-circle-info"></i></button>`
                : '';

            const removeBtn = item.status !== 'processing'
                ? `<button class="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs hover:bg-red-200 transition-colors remove-btn" data-id="${item.document_id}" title="Remove from queue"><i class="fas fa-trash"></i></button>`
                : '';

            return `<tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700">
                <td class="py-3 px-4">${docLink}</td>
                <td class="py-3 px-4 max-w-xs truncate" title="${escHtml(item.title || '')}">${escHtml(item.title || '–')}</td>
                <td class="py-3 px-4"><span class="reason-badge">${reasonLabel}</span></td>
                <td class="py-3 px-4">${statusHtml}</td>
                <td class="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">${addedDate}</td>
                <td class="py-3 px-4">
                    <div class="flex gap-2">
                        ${processBtn}
                        ${analyzeBtn}
                        ${infoBtn}
                        ${removeBtn}
                    </div>
                </td>
            </tr>`;
        }).join('');

        // Attach button handlers
        tableBody.querySelectorAll('.process-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                processSingle(parseInt(this.dataset.id, 10));
            });
        });
        tableBody.querySelectorAll('.analyze-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                analyzeSingle(parseInt(this.dataset.id, 10));
            });
        });
        tableBody.querySelectorAll('.info-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                showOcrInfo(parseInt(this.dataset.id, 10));
            });
        });
        tableBody.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                removeItem(parseInt(this.dataset.id, 10));
            });
        });
    }

    function statusIcon(status) {
        return {
            'pending':    '<i class="fas fa-hourglass-half"></i>',
            'processing': '<i class="fas fa-spinner fa-spin"></i>',
            'done':       '<i class="fas fa-check"></i>',
            'failed':     '<i class="fas fa-times"></i>'
        }[status] || '';
    }

    // ── Pagination ─────────────────────────────────────────────────────────
    function updatePagination() {
        const start = currentPage * pageSize + 1;
        const end = Math.min((currentPage + 1) * pageSize, totalRecords);
        if (tableInfo) tableInfo.textContent = totalRecords
            ? `Showing ${start}–${end} of ${totalRecords}`
            : 'No results';
        if (prevBtn) prevBtn.disabled = currentPage === 0;
        if (nextBtn) nextBtn.disabled = totalRecords === 0 || end >= totalRecords;
    }

    // ── Stats ──────────────────────────────────────────────────────────────
    async function loadStats() {
        try {
            const resp = await fetch('/api/ocr/stats');
            const data = await resp.json();
            if (!data.success) return;
            const s = data.stats;
            setStatCount('statPendingCount', s.pending);
            setStatCount('statDoneCount', s.done);
            setStatCount('statFailedCount', s.failed);
            setStatCount('statTerminalFailedCount', s.terminalFailed);
        } catch (_) {}
    }

    function setStatCount(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val ?? '0';
    }

    // ── Add manual ─────────────────────────────────────────────────────────
    async function addManual() {
        const docId = manualDocId ? manualDocId.value.trim() : '';
        if (!docId) { showToast('Please enter a document ID', 'error'); return; }

        try {
            addManualBtn.disabled = true;
            const resp = await fetch('/api/ocr/queue/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId: parseInt(docId, 10) })
            });
            const data = await resp.json();
            if (data.success) {
                showToast(data.message || 'Added to queue');
                if (manualDocId) manualDocId.value = '';
                loadQueue();
                loadFailedQueue();
                loadStats();
            } else {
                showToast(data.message || data.error || 'Failed', 'error');
            }
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            addManualBtn.disabled = false;
        }
    }

    // ── Remove item ────────────────────────────────────────────────────────
    async function removeItem(documentId) {
        try {
            const resp = await fetch(`/api/ocr/queue/${documentId}`, { method: 'DELETE' });
            const data = await resp.json();
            showToast(data.success ? 'Removed from queue' : (data.message || 'Failed'), data.success ? 'success' : 'error');
            loadQueue();
            loadFailedQueue();
            loadStats();
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    // ── Process single ─────────────────────────────────────────────────────
    function processSingle(documentId) {
        const autoAnalyzeVal = autoAnalyze ? autoAnalyze.checked : false;
        openOverlay(`Processing Document #${documentId}…`);

        const es = new EventSource(`/api/ocr/process/${documentId}`);
        // SSE doesn't support POST natively; use fetch + ReadableStream instead
        es.close();

        fetchSSE(`/api/ocr/process/${documentId}`, { autoAnalyze: autoAnalyzeVal }, function (done) {
            if (done) {
                loadQueue();
                loadFailedQueue();
                loadStats();
            }
        });
    }

    // ── Process all ────────────────────────────────────────────────────────
    function processAll() {
        const autoAnalyzeVal = autoAnalyze ? autoAnalyze.checked : false;
        openOverlay('Processing All Pending Items…');

        fetchSSE('/api/ocr/process-all', { autoAnalyze: autoAnalyzeVal }, function (done) {
            if (done) {
                loadQueue();
                loadFailedQueue();
                loadStats();
            }
        });
    }

    // ── AI only (existing OCR text) ───────────────────────────────────────
    function analyzeSingle(documentId) {
        openOverlay(`AI Analysis for Document #${documentId}…`);
        fetchSSE(`/api/ocr/analyze/${documentId}`, {}, function (done) {
            if (done) {
                loadQueue();
                loadFailedQueue();
                loadStats();
            }
        });
    }

    // ── Terminal failed queue ─────────────────────────────────────────────
    async function loadFailedQueue() {
        if (!failedTableBody) return;
        failedTableBody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i> Loading…</td></tr>`;

        try {
            const params = new URLSearchParams({
                start: failedCurrentPage * pageSize,
                length: pageSize,
                search: ''
            });
            const resp = await fetch(`/api/failed/queue?${params}`);
            const data = await resp.json();
            if (!data.success) throw new Error(data.error || 'Failed to load failed queue');

            failedTotalRecords = data.recordsTotal || 0;
            if (!paperlessUrl) {
                paperlessUrl = data.paperlessUrl || '';
            }

            renderFailedTable(data.data || []);
            updateFailedPagination();
        } catch (err) {
            failedTableBody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-red-500"><i class="fas fa-exclamation-triangle mr-2"></i>${escHtml(err.message)}</td></tr>`;
        }
    }

    function renderFailedTable(items) {
        if (!failedTableBody) return;

        if (!items.length) {
            failedTableBody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-gray-400"><i class="fas fa-check-circle text-2xl mb-2 block"></i>No terminal failures</td></tr>`;
            return;
        }

        failedTableBody.innerHTML = items.map(item => {
            const docLink = paperlessUrl
                ? `<a href="${paperlessUrl}/documents/${item.document_id}/details" target="_blank" class="text-blue-500 hover:underline font-mono">#${item.document_id}</a>`
                : `<span class="font-mono">#${item.document_id}</span>`;

            const reasonLabel = formatFailedReason(item.failed_reason);
            const sourceLabel = formatFailedSource(item.source);
            const updated = item.updated_at ? new Date(item.updated_at).toLocaleString() : '–';

            return `<tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700">
                <td class="py-3 px-4">${docLink}</td>
                <td class="py-3 px-4 max-w-xs truncate" title="${escHtml(item.title || '')}">${escHtml(item.title || '–')}</td>
                <td class="py-3 px-4"><span class="reason-badge">${reasonLabel}</span></td>
                <td class="py-3 px-4 text-sm">${sourceLabel}</td>
                <td class="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">${updated}</td>
                <td class="py-3 px-4">
                    <button class="px-3 py-1 bg-amber-500 text-white rounded-lg text-xs hover:bg-amber-600 transition-colors failed-reset-btn" data-id="${item.document_id}" title="Reset failed state and allow re-scan">
                        <i class="fas fa-rotate-left"></i> Reset
                    </button>
                </td>
            </tr>`;
        }).join('');

        failedTableBody.querySelectorAll('.failed-reset-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                resetFailedDocument(parseInt(this.dataset.id, 10));
            });
        });
    }

    function formatFailedReason(reason) {
        const map = {
            'ocr_failed': '<i class="fas fa-eye-slash mr-1"></i>OCR failed',
            'ai_failed_after_ocr': '<i class="fas fa-robot mr-1"></i>AI failed after OCR',
            'ai_failed_ocr_disabled': '<i class="fas fa-power-off mr-1"></i>AI failed (OCR disabled)',
            'ai_failed_without_ocr_fallback': '<i class="fas fa-triangle-exclamation mr-1"></i>AI failed (no OCR fallback)',
            'insufficient_content_lt_10': '<i class="fas fa-file-slash mr-1"></i>Insufficient content (&lt; 10 chars)'
        };

        if (map[reason]) return map[reason];
        if (reason && reason.startsWith('insufficient_content_lt_')) {
            const threshold = reason.replace('insufficient_content_lt_', '');
            if (/^\d+$/.test(threshold)) {
                return `<i class="fas fa-file-slash mr-1"></i>Insufficient content (&lt; ${threshold} chars)`;
            }
        }
        return escHtml(reason || 'unknown_failure');
    }

    function formatFailedSource(source) {
        if (source === 'ocr') return '<span class="text-violet-600">OCR</span>';
        if (source === 'ai') return '<span class="text-blue-600">AI</span>';
        return escHtml(source || 'unknown');
    }

    function updateFailedPagination() {
        if (!failedTableInfo) return;

        const start = failedCurrentPage * pageSize + 1;
        const end = Math.min((failedCurrentPage + 1) * pageSize, failedTotalRecords);
        failedTableInfo.textContent = failedTotalRecords
            ? `Showing ${start}–${end} of ${failedTotalRecords}`
            : 'No results';

        if (failedPrevBtn) failedPrevBtn.disabled = failedCurrentPage === 0;
        if (failedNextBtn) failedNextBtn.disabled = failedTotalRecords === 0 || end >= failedTotalRecords;
    }

    async function resetFailedDocument(documentId) {
        try {
            const resp = await fetch(`/api/failed/reset/${documentId}`, { method: 'POST' });
            const data = await resp.json();
            if (data.success) {
                showToast(data.message || 'Document reset successfully');
            } else {
                showToast(data.message || data.error || 'Reset failed', 'error');
            }
            loadQueue();
            loadFailedQueue();
            loadStats();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    // ── OCR output info ───────────────────────────────────────────────────
    async function showOcrInfo(documentId) {
        openOverlay(`OCR Output for Document #${documentId}`);
        setProgress(100);
        try {
            const resp = await fetch(`/api/ocr/queue/${documentId}/text`);
            const data = await resp.json();
            if (!data.success) {
                throw new Error(data.error || 'Could not load OCR output');
            }

            if (!data.hasOcrText) {
                appendLog('error', 'No OCR text available for this document.');
                finalizeOverlay(true);
                return;
            }

            const infoHeader = `Status: ${data.status || 'unknown'} | Reason: ${data.reason || 'unknown'}`;
            appendLog('done', infoHeader);
            appendLog('progress', '────────────────────────────────────────');

            const text = String(data.ocrText || '');
            const preview = text.length > 12000 ? `${text.slice(0, 12000)}\n\n[... truncated ...]` : text;
            appendLog('progress', preview);
            finalizeOverlay();
        } catch (error) {
            appendLog('error', error.message);
            finalizeOverlay(true);
        }
    }

    // ── SSE via fetch (POST) ───────────────────────────────────────────────
    function fetchSSE(url, body, onDone) {
        const steps = ['download', 'ocr', 'writeback', 'ai', 'start', 'progress'];
        const totalSteps = 4;
        let stepsDone = 0;

        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(resp => {
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const reader = resp.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            function read() {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        finalizeOverlay();
                        if (onDone) onDone(true);
                        return;
                    }
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop(); // keep incomplete line
                    for (const line of lines) {
                        if (!line.startsWith('data:')) continue;
                        try {
                            const event = JSON.parse(line.slice(5).trim());
                            handleEvent(event);
                        } catch (_) {}
                    }
                    read();
                }).catch(err => {
                    appendLog('error', `Connection error: ${err.message}`);
                    finalizeOverlay();
                    if (onDone) onDone(false);
                });
            }
            read();

            function handleEvent(ev) {
                const step = ev.step || 'info';
                const msg  = ev.message || '';

                appendLog(step, msg);

                if (['download', 'ocr', 'writeback', 'ai'].includes(step) && msg && !msg.startsWith('[OCR]')) {
                    // count step completions roughly
                    if (!msg.includes('…') && !msg.includes('Sending') && !msg.includes('Writing') && !msg.includes('Starting')) {
                        stepsDone = Math.min(stepsDone + 1, totalSteps);
                        setProgress(Math.round((stepsDone / totalSteps) * 90));
                    }
                }
                if (step === 'done') {
                    setProgress(100);
                    finalizeOverlay();
                    if (onDone) onDone(true);
                }
                if (step === 'error') {
                    finalizeOverlay(true);
                    if (onDone) onDone(false);
                }
            }
        }).catch(err => {
            appendLog('error', err.message);
            finalizeOverlay(true);
            if (onDone) onDone(false);
        });
    }

    // ── Overlay helpers ────────────────────────────────────────────────────
    function openOverlay(title) {
        if (progressTitle) progressTitle.textContent = title;
        if (progressLog)   progressLog.innerHTML = '';
        if (progressBar)   progressBar.style.width = '5%';
        if (closeBtn)      closeBtn.style.display = 'none';
        if (doneBtn)       doneBtn.style.display = 'none';
        if (overlay)       overlay.style.display = 'flex';
    }

    function closeOverlay() {
        if (overlay) overlay.style.display = 'none';
    }

    function finalizeOverlay(isError) {
        if (progressBar) progressBar.style.width = isError ? '100%' : '100%';
        if (progressBar) progressBar.className = isError
            ? 'bg-red-500 h-2 rounded-full transition-all duration-500'
            : 'bg-green-500 h-2 rounded-full transition-all duration-500';
        if (closeBtn) closeBtn.style.display = 'block';
        if (doneBtn)  doneBtn.style.display  = 'block';
    }

    function setProgress(pct) {
        if (progressBar) progressBar.style.width = `${pct}%`;
    }

    function appendLog(step, message) {
        if (!progressLog) return;
        const line = document.createElement('div');
        line.className = `log-line log-${step}`;
        const icons = {
            download:      '⬇ ',
            ocr:           '🔍 ',
            writeback:     '📤 ',
            ai:            '🤖 ',
            done:          '✅ ',
            error:         '❌ ',
            start:         '▶ ',
            progress:      '· ',
            item_download: '  ⬇ ',
            item_ocr:      '  🔍 ',
            item_writeback:'  📤 ',
            item_ai:       '  🤖 ',
            item_done:     '  ✅ ',
            item_error:    '  ❌ '
        };
        line.textContent = (icons[step] || '  ') + message;
        progressLog.appendChild(line);
        progressLog.scrollTop = progressLog.scrollHeight;
    }

    // ── Toast ──────────────────────────────────────────────────────────────
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toastNotification');
        const inner = document.getElementById('toastInner');
        const icon  = document.getElementById('toastIcon');
        const msg   = document.getElementById('toastMessage');
        if (!toast) return;

        inner.className = `${type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3`;
        icon.className  = `fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}`;
        msg.textContent = message;

        toast.classList.remove('hidden');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.add('hidden'), 4000);
    }

    // ── Helpers ────────────────────────────────────────────────────────────
    function escHtml(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

})();
