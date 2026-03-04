let currentDocumentId = null;
let searchDebounceTimer = null;
let documentSearchController = null;
let activeSearchResults = [];
let activeSearchIndex = -1;

const CHAT_SEARCH_LIMIT = 25;
const CHAT_SEARCH_DEBOUNCE_MS = 250;

// Initialize marked with options for code highlighting
marked.setOptions({
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true
});

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    setupTextareaAutoResize();
});

async function initializeChat(documentId) {
    try {
        const response = await fetch(`/chat/init/${documentId}`);
        if (!response.ok) throw new Error('Failed to initialize chat');
        const data = await response.json();
        
        document.getElementById('initialState').classList.add('hidden');
        document.getElementById('chatHistory').classList.remove('hidden');
        document.getElementById('messageForm').classList.remove('hidden');
        document.getElementById('documentId').value = documentId;
        document.getElementById('chatHistory').innerHTML = '';
        
        currentDocumentId = documentId;
        
        addMessage('Chat initialized for document: ' + data.documentTitle, false);
    } catch (error) {
        console.error('Error initializing chat:', error);
        showError('Failed to initialize chat');
    }
}

async function sendMessage(message) {
    try {
        const response = await fetch('/chat/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                documentId: currentDocumentId,
                message: message
            })
        });
        
        if (!response.ok) throw new Error('Failed to send message');
        
        // Create message container for streaming response
        const containerDiv = document.createElement('div');
        containerDiv.className = 'message-container assistant';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant';
        containerDiv.appendChild(messageDiv);
        
        document.getElementById('chatHistory').appendChild(containerDiv);
        
        let markdown = '';
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value);
            const lines = text.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.content) {
                            markdown += parsed.content;
                            messageDiv.innerHTML = marked.parse(markdown);
                            
                            // Apply syntax highlighting to any code blocks
                            messageDiv.querySelectorAll('pre code').forEach((block) => {
                                hljs.highlightBlock(block);
                            });
                            
                            // Scroll to bottom
                            const chatHistory = document.getElementById('chatHistory');
                            chatHistory.scrollTop = chatHistory.scrollHeight;
                        }
                    } catch (e) {
                        console.error('Error parsing SSE data:', e);
                    }
                }
            }
        }

        return null; // No need to return response as it's handled in streaming
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

function addMessage(message, isUser = true) {
    const containerDiv = document.createElement('div');
    containerDiv.className = `message-container ${isUser ? 'user' : 'assistant'}`;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
    
    if (isUser) {
        messageDiv.innerHTML = `<p>${escapeHtml(message)}</p>`;
    } else {
        let messageContent = message;
        try {
            if (typeof message === 'string' && message.trim().startsWith('{')) {
                const jsonResponse = JSON.parse(message);
                messageContent = jsonResponse.reply || jsonResponse.message || message;
            }
        } catch (e) {
            console.log('Message is not JSON, using as is');
        }
        
        messageDiv.innerHTML = marked.parse(messageContent);
        messageDiv.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });
    }
    
    containerDiv.appendChild(messageDiv);
    const chatHistory = document.getElementById('chatHistory');
    chatHistory.appendChild(containerDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message-container assistant';
    errorDiv.innerHTML = `
        <div class="message assistant error">
            <p>Error: ${escapeHtml(message)}</p>
        </div>
    `;
    document.getElementById('chatHistory').appendChild(errorDiv);
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function setTheme(theme) {
    const body = document.body;
    const lightIcon = document.getElementById('lightIcon');
    const darkIcon = document.getElementById('darkIcon');
    
    body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    if (lightIcon && darkIcon) {
        if (theme === 'dark') {
            lightIcon.classList.add('hidden');
            darkIcon.classList.remove('hidden');
        } else {
            lightIcon.classList.remove('hidden');
            darkIcon.classList.add('hidden');
        }
    }
}

function setupTextareaAutoResize() {
    const textarea = document.getElementById('messageInput');
    
    function adjustHeight() {
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
    }
    
    textarea.addEventListener('input', adjustHeight);
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            document.getElementById('messageForm').dispatchEvent(new Event('submit'));
        }
    });
}

function setDocumentSearchStatus(message, isError = false) {
    const statusElement = document.getElementById('documentSearchStatus');
    if (!statusElement) return;

    statusElement.textContent = message;
    statusElement.classList.toggle('error', isError);
}

function getDocumentTitle(doc) {
    return doc?.title || `Document ${doc?.id || ''}`;
}

function formatDocumentOptionLabel(doc) {
    return getDocumentTitle(doc);
}

function formatDocumentDate(createdValue) {
    if (!createdValue) {
        return 'Unknown date';
    }

    const parsedDate = new Date(createdValue);
    if (Number.isNaN(parsedDate.getTime())) {
        return String(createdValue).slice(0, 10) || 'Unknown date';
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function createSearchMetaPill(text, type) {
    const pill = document.createElement('span');
    pill.className = `search-result-pill ${type}`;
    pill.textContent = text;
    return pill;
}

function clearSearchResults() {
    const resultsElement = document.getElementById('documentSearchResults');
    if (!resultsElement) return;

    resultsElement.innerHTML = '';
    resultsElement.classList.add('hidden');
    activeSearchResults = [];
    activeSearchIndex = -1;
}

function updateActiveResultHighlight() {
    const resultsElement = document.getElementById('documentSearchResults');
    if (!resultsElement) return;

    const resultItems = resultsElement.querySelectorAll('.search-result-item');
    resultItems.forEach((item, index) => {
        item.classList.toggle('active', index === activeSearchIndex);
    });
}

function setSelectedDocument(doc, startChat = true) {
    const hiddenSelect = document.getElementById('documentSelect');
    const searchInput = document.getElementById('documentSearchInput');
    if (!hiddenSelect || !searchInput || !doc) return;

    hiddenSelect.value = String(doc.id);
    searchInput.value = formatDocumentOptionLabel(doc);
    searchInput.dataset.selectedDocumentId = String(doc.id);
    clearSearchResults();
    setDocumentSearchStatus(`Selected: ${getDocumentTitle(doc)}`);

    if (startChat) {
        initializeChat(doc.id);
    }
}

function renderSearchResults(documents = []) {
    const resultsElement = document.getElementById('documentSearchResults');
    if (!resultsElement) return;

    resultsElement.innerHTML = '';
    activeSearchResults = documents;
    activeSearchIndex = -1;

    if (documents.length === 0) {
        resultsElement.classList.add('hidden');
        return;
    }

    documents.forEach((doc, index) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'search-result-item';
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', 'false');
        item.dataset.index = String(index);

        const titleElement = document.createElement('div');
        titleElement.className = 'search-result-title';
        titleElement.textContent = getDocumentTitle(doc);

        const metaRow = document.createElement('div');
        metaRow.className = 'search-result-meta';

        const correspondentLabel = doc?.correspondent || 'No correspondent';
        const dateLabel = formatDocumentDate(doc?.created);
        const idLabel = `ID ${doc?.id || '-'}`;
        metaRow.appendChild(createSearchMetaPill(correspondentLabel, 'correspondent'));
        metaRow.appendChild(createSearchMetaPill(dateLabel, 'date'));
        metaRow.appendChild(createSearchMetaPill(idLabel, 'id'));

        item.appendChild(titleElement);
        item.appendChild(metaRow);

        item.addEventListener('mousedown', (event) => {
            event.preventDefault();
            setSelectedDocument(doc, true);
        });

        resultsElement.appendChild(item);
    });

    resultsElement.classList.remove('hidden');
}

function selectActiveResult() {
    if (activeSearchIndex >= 0 && activeSearchIndex < activeSearchResults.length) {
        setSelectedDocument(activeSearchResults[activeSearchIndex], true);
        return true;
    }

    if (activeSearchResults.length === 1) {
        setSelectedDocument(activeSearchResults[0], true);
        return true;
    }

    return false;
}

async function loadChatDocuments(searchTerm = '', options = {}) {
    const { showResults = true } = options;

    if (documentSearchController) {
        documentSearchController.abort();
    }

    documentSearchController = new AbortController();
    const params = new URLSearchParams({
        q: searchTerm,
        limit: String(CHAT_SEARCH_LIMIT)
    });

    setDocumentSearchStatus('Searching documents...');

    try {
        const response = await fetch(`/api/chat/documents?${params.toString()}`, {
            method: 'GET',
            signal: documentSearchController.signal
        });

        if (!response.ok) {
            throw new Error('Failed to fetch chat documents');
        }

        const payload = await response.json();
        const documents = Array.isArray(payload?.data?.documents) ? payload.data.documents : [];

        if (showResults) {
            renderSearchResults(documents);
        }

        if (documents.length === 0) {
            if (showResults) {
                clearSearchResults();
            }
            setDocumentSearchStatus('No matching documents found.');
        } else {
            setDocumentSearchStatus(`Currently ${documents.length} document${documents.length === 1 ? '' : 's'} available`);
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            return;
        }

        console.error('Error loading chat documents:', error);
        if (showResults) {
            clearSearchResults();
        }
        setDocumentSearchStatus('Could not load documents. Please try again.', true);
    }
}

function initializeDocumentSearch() {
    const searchInput = document.getElementById('documentSearchInput');
    const hiddenSelect = document.getElementById('documentSelect');

    if (!searchInput || !hiddenSelect) return;

    const initialDocumentId = searchInput.dataset.openDocumentId || hiddenSelect.value || '';
    const initialDocumentTitle = searchInput.value.trim();

    if (initialDocumentId && initialDocumentTitle) {
        hiddenSelect.value = initialDocumentId;
        searchInput.dataset.selectedDocumentId = initialDocumentId;
    }

    loadChatDocuments('', { showResults: false });

    searchInput.addEventListener('focus', () => {
        loadChatDocuments(searchInput.value.trim(), { showResults: true });
    });

    searchInput.addEventListener('input', () => {
        hiddenSelect.value = '';
        searchInput.dataset.selectedDocumentId = '';
        clearTimeout(searchDebounceTimer);

        searchDebounceTimer = setTimeout(() => {
            const query = searchInput.value.trim();
            loadChatDocuments(query, { showResults: true });
        }, CHAT_SEARCH_DEBOUNCE_MS);
    });

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (activeSearchResults.length === 0) return;
            activeSearchIndex = Math.min(activeSearchIndex + 1, activeSearchResults.length - 1);
            updateActiveResultHighlight();
            return;
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (activeSearchResults.length === 0) return;
            activeSearchIndex = Math.max(activeSearchIndex - 1, 0);
            updateActiveResultHighlight();
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            selectActiveResult();
            return;
        }

        if (event.key === 'Escape') {
            clearSearchResults();
        }
    });

    searchInput.addEventListener('blur', () => {
        window.setTimeout(() => {
            clearSearchResults();
        }, 120);
    });

    if (initialDocumentId) {
        initializeChat(initialDocumentId);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    initializeDocumentSearch();
});

document.getElementById('messageForm').querySelector('.send-button').addEventListener('click', async (e) => {
    await submitForm();
})

document.getElementById('messageInput').addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        await submitForm();
    }
});

async function submitForm() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    try {
        // Show user message immediately
        addMessage(message, true);
        
        // Clear input and reset height
        messageInput.value = '';
        messageInput.style.height = 'auto';
        
        // Send message and handle streaming response
        await sendMessage(message);
    } catch {
        showError('Failed to send message');
    }
}