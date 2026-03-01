//settings.js
// Theme Management
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.initialize();
    }

    initialize() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const icon = this.themeToggle.querySelector('i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
}

class SettingsTabsManager {
    constructor() {
        this.buttons = Array.from(document.querySelectorAll('.settings-tab-button'));
        this.contents = Array.from(document.querySelectorAll('.settings-tab-content'));
        this.initialize();
    }

    initialize() {
        if (this.buttons.length === 0 || this.contents.length === 0) {
            return;
        }

        this.buttons.forEach((button) => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                this.activateTab(tabId);
            });
        });
    }

    activateTab(tabId) {
        this.buttons.forEach((button) => {
            const isActive = button.dataset.tab === tabId;
            button.classList.toggle('active', isActive);
            button.classList.toggle('border-blue-500', isActive);
            button.classList.toggle('border-transparent', !isActive);
        });

        this.contents.forEach((content) => {
            const isActive = content.id === tabId;
            content.classList.toggle('hidden', !isActive);
        });
    }
}

class FormManager {
    constructor() {
        this.form = document.getElementById('setupForm');
        this.aiProvider = document.getElementById('aiProvider');
        this.tokenLimit = document.getElementById('tokenLimit'); 
        this.responseTokens = document.getElementById('responseTokens'); 
        this.showTags = document.getElementById('showTags');
        this.aiProcessedTag = document.getElementById('aiProcessedTag');
        this.usePromptTags = document.getElementById('usePromptTags');
        this.systemPrompt = document.getElementById('systemPrompt');
        this.systemPromptBtn = document.getElementById('systemPromptBtn');
        this.disableAutomaticProcessing = document.getElementById('disableAutomaticProcessing');
        this.initialize();
    }

    initialize() {
        this.toggleProviderSettings();
        this.toggleTagsInput();
        this.handleDisableAutomaticProcessing();
        
        if (this.aiProvider) this.aiProvider.addEventListener('change', () => this.toggleProviderSettings());
        if (this.tokenLimit) this.tokenLimit.addEventListener('input', () => this.validateTokenLimit()); 
        if (this.responseTokens) this.responseTokens.addEventListener('input', () => this.validateResponseTokens()); 
        if (this.showTags) this.showTags.addEventListener('change', () => this.toggleTagsInput());
        if (this.aiProcessedTag) this.aiProcessedTag.addEventListener('change', () => this.toggleAiTagInput());
        if (this.usePromptTags) this.usePromptTags.addEventListener('change', () => this.togglePromptTagsInput());
        if (this.disableAutomaticProcessing) this.disableAutomaticProcessing.addEventListener('change', () => this.handleDisableAutomaticProcessing());
        
        this.initializePasswordToggles();

        if (this.usePromptTags && this.usePromptTags.value === 'yes') {
            this.disablePromptElements();
        }
        
        this.toggleAiTagInput();
        this.togglePromptTagsInput();
    }

    validateTokenLimit() {
        const value = parseInt(this.tokenLimit.value, 10);
        if (isNaN(value) || value < 1) {
            this.tokenLimit.setCustomValidity('Token Limit must be a positive integer.');
        } else {
            this.tokenLimit.setCustomValidity('');
        }
    }

    validateResponseTokens() {
        const value = parseInt(this.responseTokens.value, 10);
        if (isNaN(value) || value < 0) {
            this.responseTokens.setCustomValidity('Response tokens must be a non-negative integer.');
        } else {
            this.responseTokens.setCustomValidity('');
        }
    }

    handleDisableAutomaticProcessing() {
        if (!this.form || !this.disableAutomaticProcessing) {
            return;
        }

        // Create a hidden input if it doesn't exist
        let hiddenInput = document.getElementById('disableAutomaticProcessingValue');
        if (!hiddenInput) {
            hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.id = 'disableAutomaticProcessingValue';
            hiddenInput.name = 'disableAutomaticProcessing';
            this.form.appendChild(hiddenInput);
        }
        
        // Update the hidden input value based on checkbox state
        hiddenInput.value = this.disableAutomaticProcessing.checked ? 'yes' : 'no';
    }

    toggleProviderSettings() {
        if (!this.aiProvider) {
            return;
        }

        const provider = this.aiProvider.value;
        const openaiSettings = document.getElementById('openaiSettings');
        const ollamaSettings = document.getElementById('ollamaSettings');
        const customSettings = document.getElementById('customSettings');
        const azureSettings = document.getElementById('azureSettings');

        // Get all provider-specific fields
        const openaiKey = document.getElementById('openaiKey');
        const ollamaUrl = document.getElementById('ollamaUrl');
        const ollamaModel = document.getElementById('ollamaModel');
        const customBaseUrl = document.getElementById('customBaseUrl');
        const customApiKey = document.getElementById('customApiKey');
        const customModel = document.getElementById('customModel');
        const azureApiKey = document.getElementById('azureApiKey');
        const azureEndpoint = document.getElementById('azureEndpoint');
        const azureDeploymentName = document.getElementById('azureDeploymentName');
        const azureApiVersion = document.getElementById('azureApiVersion');

        // Restriction settings
        const restrictToExistingTags = document.getElementById('restrictToExistingTags');
        const restrictToExistingCorrespondents = document.getElementById('restrictToExistingCorrespondents');

        // External API settings
        const externalApiEnabled = document.getElementById('externalApiEnabled');
        const externalApiSettings = document.getElementById('externalApiSettings');
        const externalApiUrl = document.getElementById('externalApiUrl');
        const externalApiMethod = document.getElementById('externalApiMethod');
        const externalApiHeaders = document.getElementById('externalApiHeaders');
        const externalApiBody = document.getElementById('externalApiBody');
        const externalApiTimeout = document.getElementById('externalApiTimeout');
        const externalApiTransformationTemplate = document.getElementById('externalApiTransformationTemplate');
        
        
        if (!openaiSettings || !ollamaSettings || !customSettings || !azureSettings) {
            return;
        }

        // Hide all settings sections first
        openaiSettings.classList.add('hidden');
        ollamaSettings.classList.add('hidden');
        customSettings.classList.add('hidden');
        azureSettings.classList.add('hidden');
        
        // Reset all required fields
        openaiKey.required = false;
        ollamaUrl.required = false;
        ollamaModel.required = false;
        customBaseUrl.required = false;
        customApiKey.required = false;
        customModel.required = false;
        azureApiKey.required = false;
        azureEndpoint.required = false;
        azureDeploymentName.required = false;
        azureApiVersion.required = false;
        
        // Show and set required fields based on selected provider
        switch (provider) {
            case 'openai':
                openaiSettings.classList.remove('hidden');
                break;
            case 'ollama':
                ollamaSettings.classList.remove('hidden');
                ollamaUrl.required = true;
                ollamaModel.required = true;
                break;
            case 'custom':
                customSettings.classList.remove('hidden');
                customBaseUrl.required = true;
                customModel.required = true;
                break;
            case 'azure':
                azureSettings.classList.remove('hidden');
                azureEndpoint.required = true;
                azureDeploymentName.required = true;
                azureApiVersion.required = true;
                break;
        }
    }

    // Rest of the class methods remain the same
    toggleTagsInput() {
        if (!this.showTags) {
            return;
        }

        const showTags = this.showTags.value;
        const tagsInputSection = document.getElementById('tagsInputSection');
        const tagsInput = document.getElementById('tags');
        
        if (showTags === 'yes') {
            tagsInputSection.classList.remove('hidden');
        } else {
            if (tagsInput) tagsInput.value = '';
            tagsInputSection.classList.add('hidden');
        }
    }

    toggleAiTagInput() {
        if (!this.aiProcessedTag) {
            return;
        }

        const showAiTag = this.aiProcessedTag.value;
        const aiTagNameSection = document.getElementById('aiTagNameSection');
        
        if (showAiTag === 'yes') {
            aiTagNameSection.classList.remove('hidden');
        } else {
            aiTagNameSection.classList.add('hidden');
        }
    }

    togglePromptTagsInput() {
        if (!this.usePromptTags) {
            return;
        }

        const usePromptTags = this.usePromptTags.value;
        const promptTagsSection = document.getElementById('promptTagsSection');
        
        if (usePromptTags === 'yes') {
            promptTagsSection.classList.remove('hidden');
            this.disablePromptElements();
        } else {
            promptTagsSection.classList.add('hidden');
            this.enablePromptElements();
        }
    }

    disablePromptElements() {
        if (!this.systemPrompt || !this.systemPromptBtn) {
            return;
        }
        this.systemPrompt.disabled = true;
        this.systemPromptBtn.disabled = true;
        this.systemPrompt.classList.add('opacity-50', 'cursor-not-allowed');
        this.systemPromptBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }

    enablePromptElements() {
        if (!this.systemPrompt || !this.systemPromptBtn) {
            return;
        }
        this.systemPrompt.disabled = false;
        this.systemPromptBtn.disabled = false;
        this.systemPrompt.classList.remove('opacity-50', 'cursor-not-allowed');
        this.systemPromptBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    initializePasswordToggles() {
        document.querySelectorAll('[data-input]').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const inputId = e.currentTarget.dataset.input;
                this.togglePassword(inputId);
            });
        });
    }

    togglePassword(inputId) {
        const input = document.getElementById(inputId);
        const icon = input.nextElementSibling.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

// Tags Management
class TagsManager {
    constructor(
        tagInputId,
        tagsContainerId,
        tagsHiddenInputId
    ) {
        this.tagInput = document.getElementById(tagInputId); //'tagInput'
        this.tagsContainer = document.getElementById(tagsContainerId); // tagsContainer
        this.tagsHiddenInput = document.getElementById(tagsHiddenInputId); // tagsHiddenInput
        this.addTagButton = this.tagInput?.closest('.space-y-2')?.querySelector('button');
        
        if (this.tagInput && this.tagsContainer && this.addTagButton) {
            this.initialize();
            
            // Initialize existing tags with proper event handlers
            this.initializeExistingTags();
        }
    }

    initialize() {
        if (this.addTagButton) {
            this.addTagButton.addEventListener('click', () => this.addTag());
        }
        
        if (this.tagInput) {
            this.tagInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addTag();
                }
            });
        }
    }

    initializeExistingTags() {
        const existingTags = this.tagsContainer.querySelectorAll('.bg-blue-100');
        existingTags.forEach(tagElement => {
            const removeButton = tagElement.querySelector('button');
            if (removeButton) {
                this.initializeTagRemoval(removeButton);
            }
        });
    }

    initializeTagRemoval(button) {
        button.addEventListener('click', async () => {
            const result = await Swal.fire({
                title: 'Remove Tag',
                text: 'Are you sure you want to remove this tag?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, remove it',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                customClass: {
                    container: 'my-swal'
                }
            });

            if (result.isConfirmed) {
                const tagElement = button.closest('.bg-blue-100');
                if (tagElement) {
                    tagElement.remove();
                    this.updateHiddenInput();
                }
            }
        });
    }

    async addTag() {
        if (!this.tagInput) return;

        const tagText = this.tagInput.value.trim();
        const specialChars = /[,;:\n\r\\/]/;
        
        if (specialChars.test(tagText)) {
            await Swal.fire({
                title: 'Invalid Characters',
                text: 'Tags cannot contain commas, semi-colons, colons, or line breaks.',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
                customClass: {
                    container: 'my-swal'
                }
            });
            return;
        }

        if (tagText) {
            const tag = this.createTagElement(tagText);
            this.tagsContainer.appendChild(tag);
            this.updateHiddenInput();
            this.tagInput.value = '';
        }
    }

    createTagElement(text) {
        const tag = document.createElement('div');
        tag.className = 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2 animate-fade-in';
        
        const tagText = document.createElement('span');
        tagText.textContent = text;
        
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'hover:text-blue-600';
        removeButton.innerHTML = '<i class="fas fa-times"></i>';
        
        this.initializeTagRemoval(removeButton);

        tag.appendChild(tagText);
        tag.appendChild(removeButton);
        
        return tag;
    }

    updateHiddenInput() {
        if (!this.tagsHiddenInput || !this.tagsContainer) return;
        
        const tags = Array.from(this.tagsContainer.querySelectorAll('.bg-blue-100 span'))
            .map(span => span.textContent.trim())
            .filter(tag => tag); // Remove any empty tags
            
        this.tagsHiddenInput.value = tags.join(',');
    }
}

// Prompt Management
class PromptManager {
    constructor() {
        this.systemPrompt = document.getElementById('systemPrompt');
        this.exampleButton = document.getElementById('systemPromptBtn');
        this.initialize();
    }

    initialize() {
        this.exampleButton.addEventListener('click', () => this.prefillExample());
    }

    prefillExample() {
        const examplePrompt = `You are a personalized document analyzer. Your task is to analyze documents and extract relevant information.

Analyze the document content and extract the following information into a structured JSON object:

1. title: Create a concise, meaningful title for the document
2. correspondent: Identify the sender/institution but do not include addresses
3. tags: Select up to 4 relevant thematic tags
4. document_date: Extract the document date (format: YYYY-MM-DD)
5. document_type: Determine a precise type that classifies the document (e.g. Invoice, Contract, Employer, Information and so on)
6. language: Determine the document language (e.g. "de" or "en")
      
Important rules for the analysis:

For tags:
- FIRST check the existing tags before suggesting new ones
- Use only relevant categories
- Maximum 4 tags per document, less if sufficient (at least 1)
- Avoid generic or too specific tags
- Use only the most important information for tag creation
- The output language is the one used in the document! IMPORTANT!

For the title:
- Short and concise, NO ADDRESSES
- Contains the most important identification features
- For invoices/orders, mention invoice/order number if available
- The output language is the one used in the document! IMPORTANT!

For the correspondent:
- Identify the sender or institution
  When generating the correspondent, always create the shortest possible form of the company name (e.g. "Amazon" instead of "Amazon EU SARL, German branch")

For the document date:
- Extract the date of the document
- Use the format YYYY-MM-DD
- If multiple dates are present, use the most relevant one

For the language:
- Determine the document language
- Use language codes like "de" for German or "en" for English
- If the language is not clear, use "und" as a placeholder`;

        this.systemPrompt.value = examplePrompt;
    }
}

function initializeCoreSettings() {
    const themeManager = new ThemeManager();
    const settingsTabsManager = new SettingsTabsManager();
    const formManager = new FormManager();
    const tagsManager = new TagsManager('tagInput', 'tagsContainer', 'tags');
    const ignoreTagsManager = new TagsManager('ignoreTagInput', 'ignoreTagsContainer', 'ignoreTags');
    const promptTagsManager = new TagsManager('promptTagInput', 'promptTagsContainer', 'promptTags');
    const promptManager = new PromptManager();
}

function initializeFormHandlers() {
    // Clear Tag Cache Button Handler
    const clearTagCacheBtn = document.getElementById('clearTagCacheBtn');
    if (clearTagCacheBtn) {
        clearTagCacheBtn.addEventListener('click', async () => {
            const btn = clearTagCacheBtn;
            const icon = document.getElementById('clearCacheIcon');
            const originalHTML = btn.innerHTML;
            
            try {
                // Disable button and show loading state
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Clearing Cache...';
                
                const response = await fetch('/api/settings/clear-tag-cache', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Cache Cleared!',
                        text: result.message || 'Tag cache has been cleared successfully.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    throw new Error(result.error || 'Failed to clear cache');
                }
            } catch (error) {
                console.error('Error clearing tag cache:', error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to clear tag cache. Please try again.'
                });
            } finally {
                // Restore button state
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }
        });
    }

    // Form submission handler
    const setupForm = document.getElementById('setupForm');
    if (!setupForm) {
        return;
    }
    setupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = setupForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        try {

            const formData = new FormData(setupForm);
            //remove from formData.systemPrompt all ` chars
            if (formData.get('systemPrompt')) {
                formData.set('systemPrompt', formData.get('systemPrompt').replace(/`/g, ''));
            }
            const response = await fetch('/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            const result = await response.json();

            if (result.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: result.message,
                    timer: 2000,
                    showConfirmButton: false
                });

                if (result.restart) {
                    let countdown = 5;
                    const alert = Swal.fire({
                        title: 'Restarting...',
                        text: `Application will restart in ${countdown} seconds`,
                        icon: 'info',
                        showConfirmButton: false,
                        allowOutsideClick: false
                    });

                    const countdownInterval = setInterval(() => {
                        countdown--;
                        if (countdown < 0) {
                            clearInterval(countdownInterval);
                            window.location.reload();
                        } else {
                            Swal.update({
                                text: `Application will restart in ${countdown} seconds`
                            });
                        }
                    }, 1000);
                }
            } else {
                throw new Error(result.error || 'An unknown error occurred');
            }
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message
            });
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

function normalizeSystemPromptNewlines() {
    const systemPromptTextarea = document.getElementById('systemPrompt');
    if (systemPromptTextarea) {
        systemPromptTextarea.value = systemPromptTextarea.value.replace(/\\n/g, '\n');
    }
}

class URLValidator {
    constructor() {
        this.urlInput = document.getElementById('paperlessUrl');
        this.isShowingError = false;
        this.initialize();
    }

    initialize() {
        this.urlInput.addEventListener('blur', () => this.validateURL());
    }

    async validateURL() {
        if (this.isShowingError) return;

        try {
            if (!this.urlInput.value) return;
            const url = new URL(this.urlInput.value);

            if (!['http:', 'https:'].includes(url.protocol)) {
                throw new Error('The URL must start with http:// or https://');
            }

            // Prüfe auf zusätzliche Pfade oder Parameter
            if (url.pathname !== '/' || url.search || url.hash) {
                throw new Error('The URL must not contain any paths, parameters, or trailing slashes after the port.');
            }

            // Automatische Formatierung der URL
            const formattedUrl = `${url.protocol}//${url.hostname}${url.port ? ':' + url.port : ''}`;
            if (this.urlInput.value !== formattedUrl) {
                this.urlInput.value = formattedUrl;
            }

        } catch (error) {
            this.isShowingError = true;
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Invalid URL',
                text: error.message,
                showCancelButton: true,
                confirmButtonText: 'Confirm anyway',
                cancelButtonText: 'Fix it',
                customClass: {
                    container: 'z-50'
                }
            });

            this.isShowingError = false;
            if (result.isDismissed) {
                this.sanitizeURL();
            }
        }
    }

    sanitizeURL() {
        try {
            if (!this.urlInput.value) return;
            const url = new URL(this.urlInput.value);
            this.urlInput.value = `${url.protocol}//${url.hostname}${url.port ? ':' + url.port : ''}`;
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid URL',
                text: 'Please enter a valid URL. ( http[s]://your-paperless-instance:8000 )',
                customClass: {
                    container: 'z-50'
                }
            });
        }
    }
}

const TOOLTIP_CARD_STYLES = 'background:#ffffff;color:#111827;border:1px solid #d1d5db;border-radius:8px;';
const REGISTERED_TOOLTIP_INSTANCES = [];
let tooltipResizeListenerAttached = false;

function getSettingsTooltipPlacement() {
    return window.innerWidth < 768 ? 'bottom' : 'right';
}

function createReadableTooltipContent(innerHtml, padding = '10px 12px') {
    return `<div style="${TOOLTIP_CARD_STYLES}padding:${padding};line-height:1.45;">${innerHtml}</div>`;
}

function getReadableTooltipOptions(overrides = {}) {
    return {
        allowHTML: true,
        placement: getSettingsTooltipPlacement(),
        interactive: true,
        theme: 'light-border',
        touch: 'hold',
        appendTo: () => document.body,
        ...overrides
    };
}

function normalizeTooltipInstances(instances) {
    if (!instances) {
        return [];
    }

    if (Array.isArray(instances)) {
        return instances.filter((instance) => instance && typeof instance.setProps === 'function');
    }

    return typeof instances.setProps === 'function' ? [instances] : [];
}

function refreshAllTooltipPlacements() {
    const placement = getSettingsTooltipPlacement();
    REGISTERED_TOOLTIP_INSTANCES.forEach((instance) => {
        instance.setProps({ placement });
    });
}

function registerTooltipInstances(instances) {
    const normalizedInstances = normalizeTooltipInstances(instances);
    if (normalizedInstances.length === 0) {
        return;
    }

    normalizedInstances.forEach((instance) => {
        if (!REGISTERED_TOOLTIP_INSTANCES.includes(instance)) {
            REGISTERED_TOOLTIP_INSTANCES.push(instance);
        }
    });

    if (!tooltipResizeListenerAttached) {
        window.addEventListener('resize', refreshAllTooltipPlacements);
        tooltipResizeListenerAttached = true;
    }
}

// Tooltip System
class TooltipManager {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.tooltipInstance = tippy('#urlHelp', getReadableTooltipOptions({
            content: this.getTooltipContent(),
            maxWidth: 450,
            trigger: 'mouseenter click',
            zIndex: 40,
        }));
        registerTooltipInstances(this.tooltipInstance);
    }

    getTooltipContent() {
        return createReadableTooltipContent(`
                <h3 style="font-size:16px;font-weight:700;margin-bottom:8px;">API URL Configuration</h3>
                
                <div style="margin-bottom:10px;">
                    <p>The URL should follow this format:</p>
                    <code style="display:block;padding:8px;background:#f3f4f6;border-radius:6px;color:#111827;">
                        http://your-host:8000
                    </code>
                </div>
                
                <div style="margin-bottom:10px;">
                    <p style="font-weight:600;">Important Notes:</p>
                    <ul style="padding-left:18px;margin-top:4px;">
                        <li>Must start with <u>http://</u> or <u>https://</u></li>
                        <li>Contains <strong>host/IP</strong> and optionally a <strong>port</strong></li>
                        <li>No additional paths or parameters</li>
                    </ul>
                </div>

                <div style="margin-bottom:10px;">
                    <p style="font-weight:600;">Docker Network Configuration:</p>
                    <ul style="padding-left:18px;margin-top:4px;">
                        <li>Using <strong>localhost</strong> or <strong>127.0.0.1</strong> won't work in Docker bridge mode</li>
                        <li>Use your machine's local IP (e.g., <code>192.168.1.x</code>) instead</li>
                        <li>Or use the Docker container name if both services are in the same network</li>
                    </ul>
                </div>

                <div style="margin-bottom:10px;">
                    <p style="font-weight:600;">Examples:</p>
                    <ul style="list-style:none;padding-left:0;margin-top:4px;">
                        <li>🔸 Local IP: <code>http://192.168.1.100:8000</code></li>
                        <li>🔸 Container: <code>http://paperless-ngx:8000</code></li>
                        <li>🔸 Remote: <code>http://paperless.domain.com</code></li>
                    </ul>
                </div>

                <p style="font-size:12px;font-style:italic;margin-top:8px;">The /api endpoint will be added automatically.</p>
        `, '12px');
    }
}

class SettingsHintManager {
    getHintTriggerClasses() {
        return [
            'inline-flex',
            'items-center',
            'justify-center',
            'ml-2',
            'text-blue-700',
            'hover:text-blue-900',
            'focus:outline-none',
            'focus:ring-2',
            'focus:ring-blue-600',
            'rounded-full',
            'transition-colors'
        ];
    }

    constructor() {
        this.initialize();
    }

    initialize() {
        const hintRows = Array.from(document.querySelectorAll('#setupForm p.text-xs.text-gray-500'));
        const tooltipTargets = [];

        hintRows.forEach((hint) => {
            const container = hint.closest('.space-y-2') || hint.parentElement;
            if (!container) {
                return;
            }

            const label = container.querySelector('label');
            if (!label) {
                return;
            }

            if (label.querySelector('.setting-hint-trigger')) {
                hint.classList.add('hidden');
                return;
            }

            const trigger = document.createElement('button');
            trigger.type = 'button';
            trigger.className = `setting-hint-trigger ${this.getHintTriggerClasses().join(' ')}`;
            trigger.setAttribute('aria-label', 'Show setting hint');
            trigger.style.width = '1.125rem';
            trigger.style.height = '1.125rem';
            trigger.style.minWidth = '1.125rem';
            trigger.style.minHeight = '1.125rem';
            trigger.innerHTML = '<i class="fas fa-circle-question" style="font-size:0.875rem;line-height:1;"></i>';
            trigger.dataset.hintContent = hint.innerHTML;

            if (!label.classList.contains('flex')) {
                label.classList.add('flex', 'items-center');
            }

            label.appendChild(trigger);
            hint.classList.add('hidden');
            tooltipTargets.push(trigger);
        });

        if (tooltipTargets.length > 0) {
            const hintTooltipInstances = tippy(tooltipTargets, getReadableTooltipOptions({
                maxWidth: 360,
                content(reference) {
                    return createReadableTooltipContent(reference.dataset.hintContent || '', '8px 10px');
                }
            }));
            registerTooltipInstances(hintTooltipInstances);
        }

        this.initializeTagCacheHint();
    }

    initializeTagCacheHint() {
        const tagCacheTTLHelp = document.getElementById('tagCacheTTLHelp');
        if (!tagCacheTTLHelp) {
            return;
        }

        const urlHelp = document.getElementById('urlHelp');
        if (urlHelp) {
            urlHelp.classList.remove('text-gray-400', 'hover:text-gray-600');
            urlHelp.classList.add(...this.getHintTriggerClasses());
            urlHelp.style.width = '1.125rem';
            urlHelp.style.height = '1.125rem';
            urlHelp.style.minWidth = '1.125rem';
            urlHelp.style.minHeight = '1.125rem';

            const urlHelpIcon = urlHelp.querySelector('i');
            if (urlHelpIcon) {
                urlHelpIcon.style.fontSize = '0.875rem';
                urlHelpIcon.style.lineHeight = '1';
            }
        }

        tagCacheTTLHelp.classList.remove('text-gray-400', 'hover:text-gray-600');
        tagCacheTTLHelp.classList.add(...this.getHintTriggerClasses());
        tagCacheTTLHelp.style.width = '1.125rem';
        tagCacheTTLHelp.style.height = '1.125rem';
        tagCacheTTLHelp.style.minWidth = '1.125rem';
        tagCacheTTLHelp.style.minHeight = '1.125rem';

        const tagCacheIcon = tagCacheTTLHelp.querySelector('i');
        if (tagCacheIcon) {
            tagCacheIcon.style.fontSize = '0.875rem';
            tagCacheIcon.style.lineHeight = '1';
        }

        const tagCacheTooltipInstance = tippy(tagCacheTTLHelp, getReadableTooltipOptions({
            maxWidth: 420,
            content: createReadableTooltipContent(`
                    <p style="margin-bottom:8px;">Controls how long tags are cached before refreshing from Paperless-ngx.</p>
                    <ul style="padding-left:18px; margin:0 0 8px 0;">
                        <li><strong>60-180s:</strong> fresher data, more API calls</li>
                        <li><strong>300s (recommended):</strong> balanced</li>
                        <li><strong>600-3600s:</strong> fewer API calls, slower visibility of new tags</li>
                    </ul>
                    <p style="font-size:12px;">Good cache settings can reduce Paperless tag API calls significantly during batch processing.</p>
            `)
        }));
        registerTooltipInstances(tagCacheTooltipInstance);
    }
}

function initializeTooltipAndValidation() {
    const urlValidator = new URLValidator();
    const tooltipManager = new TooltipManager();
    const settingsHintManager = new SettingsHintManager();
}


// Custom Fields Management
function initializeCustomFieldsManagement() {
    // External API settings toggle
    const externalApiEnabled = document.getElementById('externalApiEnabled');
    const externalApiSettings = document.getElementById('externalApiSettings');
    
    if (externalApiEnabled && externalApiSettings) {
        externalApiEnabled.addEventListener('change', function() {
            if (this.checked) {
                externalApiSettings.classList.remove('hidden');
            } else {
                externalApiSettings.classList.add('hidden');
            }
        });
    }
    
    const fieldsList = document.getElementById('customFieldsList');
    if (fieldsList) {
        // Initialize Sortable
        new Sortable(fieldsList, {
            animation: 150,
            handle: '.cursor-move',
            onEnd: updateCustomFieldsJson
        });

        // Add initial theme classes based on current theme
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDarkMode) {
            updateThemeClasses(true);
        }
    }

    // Initialize type selection
    const typeSelect = document.getElementById('newFieldType');
    if (typeSelect) {
        typeSelect.addEventListener('change', toggleCurrencySelect);
        // Initial currency select visibility
        toggleCurrencySelect();
    }

    // Initialize name input
    const nameInput = document.getElementById('newFieldName');
    if (nameInput) {
        nameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addCustomField();
            }
        });
    }

    // Observer for theme changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'data-theme') {
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                updateThemeClasses(isDark);
            }
        });
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
}

document.addEventListener('DOMContentLoaded', () => {
    normalizeSystemPromptNewlines();
    initializeCoreSettings();
    initializeFormHandlers();
    initializeTooltipAndValidation();
    initializeCustomFieldsManagement();
});

function updateThemeClasses(isDark) {
    // Update custom field items
    const items = document.querySelectorAll('.custom-field-item');
    items.forEach(item => {
        // Background and border
        item.classList.toggle('bg-white', !isDark);
        item.classList.toggle('bg-gray-800', isDark);
        item.classList.toggle('border-gray-200', !isDark);
        item.classList.toggle('border-gray-700', isDark);

        // Text colors
        const title = item.querySelector('p.font-medium');
        if (title) {
            title.classList.toggle('text-gray-900', !isDark);
            title.classList.toggle('text-gray-100', isDark);
        }

        const subtitle = item.querySelector('p.text-sm');
        if (subtitle) {
            subtitle.classList.toggle('text-gray-500', !isDark);
            subtitle.classList.toggle('text-gray-400', isDark);
        }
    });

    // Update form inputs and selects
    const inputs = document.querySelectorAll('input:not([type="hidden"]), select');
    inputs.forEach(input => {
        input.classList.toggle('bg-white', !isDark);
        input.classList.toggle('bg-gray-800', isDark);
        input.classList.toggle('text-gray-900', !isDark);
        input.classList.toggle('text-gray-100', isDark);
        input.classList.toggle('border-gray-300', !isDark);
        input.classList.toggle('border-gray-600', isDark);
    });
}

function toggleCurrencySelect() {
    const fieldType = document.getElementById('newFieldType').value;
    const currencySelect = document.getElementById('currencyCode');
    
    if (fieldType === 'monetary') {
        currencySelect.classList.remove('hidden');
    } else {
        currencySelect.classList.add('hidden');
    }
}

function updateCustomFieldsJson() {
    const fieldItems = document.querySelectorAll('.custom-field-item');
    const fields = Array.from(fieldItems).map(item => {
        const fieldName = item.querySelector('p.font-medium').textContent;
        const typeText = item.querySelector('p.text-sm').textContent;
        const data_type = typeText.split('Type: ')[1].split(' ')[0];
        const currency = typeText.includes('(') ? typeText.split('(')[1].split(')')[0] : null;
        
        const field = {
            value: fieldName,
            data_type: data_type
        };
        
        if (currency) {
            field.currency = currency;
        }
        
        return field;
    });
    
    document.getElementById('customFieldsJson').value = JSON.stringify({
        custom_fields: fields
    });
}

function createFieldElement(fieldName, data_type, currency = null) {
    const div = document.createElement('div');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    div.className = `custom-field-item flex items-center gap-2 p-3 rounded-lg border hover:border-blue-500 transition-colors ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`;
    
    let typeDisplay = `Type: ${data_type}`;
    if (data_type === 'monetary' && currency) {
        typeDisplay += ` (${currency})`;
    }
    
    div.innerHTML = `
        <div class="cursor-move text-gray-400">
            <i class="fas fa-grip-vertical"></i>
        </div>
        <div class="flex-1">
            <p class="font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}">${fieldName}</p>
            <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}">${typeDisplay}</p>
        </div>
        <button type="button" 
                onclick="removeCustomField(this)"
                class="text-gray-400 hover:text-red-500 transition-colors">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    return div;
}

function addCustomField() {
    const nameInput = document.getElementById('newFieldName');
    const typeSelect = document.getElementById('newFieldType');
    const currencySelect = document.getElementById('currencyCode');
    const fieldsList = document.getElementById('customFieldsList');
    
    const fieldName = nameInput.value.trim();
    const data_type = typeSelect.value;
    const currency = data_type === 'monetary' ? currencySelect.value : null;
    
    if (!fieldName) {
        Swal.fire({
            icon: 'warning',
            title: 'Invalid Field Name',
            text: 'Please enter a field name'
        });
        return;
    }
    
    // Check for duplicates
    const existingFields = Array.from(fieldsList.querySelectorAll('p.font-medium'))
        .map(p => p.textContent);
    
    if (existingFields.includes(fieldName)) {
        Swal.fire({
            icon: 'warning',
            title: 'Duplicate Field',
            text: 'A field with this name already exists'
        });
        return;
    }
    
    const fieldElement = createFieldElement(fieldName, data_type, currency);
    fieldsList.appendChild(fieldElement);
    
    // Reset inputs
    nameInput.value = '';
    
    // Update hidden input
    updateCustomFieldsJson();
}

function removeCustomField(button) {
    const fieldItem = button.closest('.custom-field-item');
    Swal.fire({
        title: 'Delete Field?',
        text: 'Are you sure you want to delete this custom field?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            fieldItem.remove();
            updateCustomFieldsJson();
        }
    });
}

// Clear Tag Cache Button Handler (PERF-002)
// duplicate clearTagCache handler removed (handled in main submit/event block above)
