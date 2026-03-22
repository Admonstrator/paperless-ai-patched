let currentDocumentId = null;
let chatDocumentOmnibox = null;

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
                            const safeMarkdown = escapeHtml(markdown);
                            messageDiv.innerHTML = marked.parse(safeMarkdown);
                            
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
        
        const safeMessageContent = escapeHtml(String(messageContent ?? ''));
        messageDiv.innerHTML = marked.parse(safeMessageContent);
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

function getDocumentTitle(doc) {
    return doc?.title || `Document ${doc?.id || ''}`;
}

function setSelectedDocument(doc, startChat = true) {
    const hiddenSelect = document.getElementById('documentSelect');
    const searchInput = document.getElementById('documentSearchInput');
    if (!hiddenSelect || !searchInput || !doc) return;

    hiddenSelect.value = String(doc.id);
    searchInput.value = getDocumentTitle(doc);
    searchInput.dataset.selectedDocumentId = String(doc.id);

    if (startChat) {
        initializeChat(doc.id);
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

    chatDocumentOmnibox = window.createDocumentOmnibox({
        preset: 'chat',
        inputId: 'documentSearchInput',
        resultsId: 'documentSearchResults',
        statusId: 'documentSearchStatus',
        hiddenInputId: 'documentSelect',
        limit: 100,
        debounceMs: 250,
        resultItemClass: 'search-result-item',
        resultTitleClass: 'search-result-title',
        resultMetaClass: 'search-result-meta',
        resultPillClass: 'search-result-pill',
        onSelect: (doc) => {
            setSelectedDocument(doc, true);
        }
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