const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { OpenAI } = require('openai');
const config = require('../config/config');
const AzureOpenAI = require('openai').AzureOpenAI;
const { validateApiUrl } = require('./serviceUtils');

const CUSTOM_PROVIDER_FALLBACK_API_KEY = 'no-auth-required';

class SetupService {
  constructor() {
    this.envPath = path.join(process.cwd(), 'data', '.env');
    this.runtimeOverridesPath = path.join(process.cwd(), 'data', 'runtime-overrides.json');
    this.configured = null; // Variable to store the configuration status
  }

  isLegacyConfigSourceMode() {
    return String(process.env.CONFIG_SOURCE_MODE || 'runtime-first').trim().toLowerCase() === 'legacy';
  }

  getRuntimeConfigurationSnapshot() {
    return {
      PAPERLESS_API_URL: process.env.PAPERLESS_API_URL || '',
      AI_PROVIDER: process.env.AI_PROVIDER || '',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
      OLLAMA_API_URL: process.env.OLLAMA_API_URL || '',
      OLLAMA_MODEL: process.env.OLLAMA_MODEL || '',
      AZURE_ENDPOINT: process.env.AZURE_ENDPOINT || '',
      AZURE_API_KEY: process.env.AZURE_API_KEY || '',
      AZURE_DEPLOYMENT_NAME: process.env.AZURE_DEPLOYMENT_NAME || '',
      CUSTOM_BASE_URL: process.env.CUSTOM_BASE_URL || '',
      CUSTOM_MODEL: process.env.CUSTOM_MODEL || ''
    };
  }

  normalizeEnvironmentValue(value) {
    if (value == null) {
      return '';
    }

    if (Array.isArray(value)) {
      return value.map((entry) => String(entry ?? '').trim()).filter(Boolean).join(',');
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  encodeEnvValue(value) {
    // Quote values to prevent newline/equals injection in KEY=value format.
    return JSON.stringify(this.normalizeEnvironmentValue(value));
  }

  decodeEnvValue(value) {
    const trimmed = String(value ?? '').trim();
    if (!trimmed) {
      return '';
    }

    // Support values written as JSON-quoted strings.
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      try {
        const decoded = JSON.parse(trimmed);
        return decoded == null ? '' : String(decoded);
      } catch (_error) {
        return trimmed;
      }
    }

    // Compatibility with single-quoted env values.
    if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
      return trimmed.slice(1, -1);
    }

    return trimmed;
  }

  getSetupUrlValidationOptions() {
    const allowLocalhost = ['true', '1', 'yes', 'on'].includes(
      String(process.env.PAPERLESS_AI_SETUP_ALLOW_LOCALHOST || '').trim().toLowerCase()
    );

    return {
      allowPrivateIPs: true,
      allowLocalhost
    };
  }

  async loadRuntimeOverrides() {
    try {
      const content = await fs.readFile(this.runtimeOverridesPath, 'utf8');
      const parsed = JSON.parse(content);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error loading runtime overrides:', error.message);
      }
      return {};
    }
  }

  filterProtectedInjectedConfig(configValues) {
    return Object.fromEntries(
      Object.entries(configValues || {}).filter(
        ([key]) => !config.isProtectedRuntimeEnvKey(key)
      )
    );
  }

  async saveRuntimeOverrides(configValues) {
    try {
      const dataDir = path.dirname(this.runtimeOverridesPath);
      await fs.mkdir(dataDir, { recursive: true });

      const persistentConfig = this.filterProtectedInjectedConfig(configValues);
      const normalizedConfig = Object.fromEntries(
        Object.entries(persistentConfig).map(([key, value]) => [key, value == null ? '' : String(value)])
      );

      await fs.writeFile(this.runtimeOverridesPath, JSON.stringify(normalizedConfig, null, 2));
    } catch (error) {
      console.error('Error saving runtime overrides:', error.message);
      throw error;
    }
  }

  async clearRuntimeOverrides() {
    try {
      await fs.unlink(this.runtimeOverridesPath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      }
      console.error('Error clearing runtime overrides:', error.message);
      throw error;
    }
  }

  async loadConfig() {
    const runtimeOverrides = this.filterProtectedInjectedConfig(await this.loadRuntimeOverrides());

    if (!this.isLegacyConfigSourceMode()) {
      return Object.keys(runtimeOverrides).length > 0 ? runtimeOverrides : null;
    }

    try {
      const envContent = await fs.readFile(this.envPath, 'utf8');
      const configValues = {};
      envContent.split('\n').forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) {
          return;
        }

        const separatorIndex = trimmedLine.indexOf('=');
        if (separatorIndex <= 0) {
          return;
        }

        const key = trimmedLine.slice(0, separatorIndex).trim();
        const value = trimmedLine.slice(separatorIndex + 1);
        if (!key) {
          return;
        }

        configValues[key] = this.decodeEnvValue(value);
      });
      return this.filterProtectedInjectedConfig({
        ...configValues,
        ...runtimeOverrides
      });
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error loading config:', error.message);
      }

      if (Object.keys(runtimeOverrides).length > 0) {
        return runtimeOverrides;
      }

      return null;
    }
  }

  async validatePaperlessConfig(url, token) {
    try {
      // Validate URL to prevent SSRF attacks
      // Allow private IPs since Paperless-ngx is typically deployed in a private network
      const urlValidation = await validateApiUrl(url, this.getSetupUrlValidationOptions());
      if (!urlValidation.valid) {
        console.error('Paperless URL validation error:', urlValidation.error);
        return false;
      }

      console.log('Validating Paperless config for:', url + '/api/documents/');
      const response = await axios.get(`${url}/api/documents/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      return response.status === 200;
    } catch (error) {
      console.error('Paperless validation error:', error.message);
      return false;
    }
  }

  async validateApiPermissions(url, token) {
    // Validate URL first to prevent SSRF
    const urlValidation = await validateApiUrl(url, this.getSetupUrlValidationOptions());
    if (!urlValidation.valid) {
      console.error('API URL validation error:', urlValidation.error);
      return { success: false, message: `URL validation failed: ${urlValidation.error}` };
    }

    for (const endpoint of ['correspondents', 'tags', 'documents', 'document_types', 'custom_fields', 'users']) {
      try {
        console.log(`Validating API permissions for ${url}/api/${endpoint}/`);
        const response = await axios.get(`${url}/api/${endpoint}/`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        console.log(`API permissions validated for ${endpoint}, ${response.status}`);
        if (response.status !== 200) {
          console.error(`API permissions validation failed for ${endpoint}`);
          return { success: false, message: `API permissions validation failed for endpoint '/api/${endpoint}/'` };
        }
      } catch (error) {
        console.error(`API permissions validation failed for ${endpoint}:`, error.message);
        return { success: false, message: `API permissions validation failed for endpoint '/api/${endpoint}/'` };
      }
    }
    return { success: true, message: 'API permissions validated successfully' };
}


  async validateOpenAIConfig(apiKey) {
    if (config.CONFIGURED === false) {
      try {
        const openai = new OpenAI({ apiKey });
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "Test" }],
        });
        const now = new Date();
        const timestamp = now.toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
        console.log(`[DEBUG] [${timestamp}] OpenAI request sent`);
        return response.choices && response.choices.length > 0;
      } catch (error) {
        console.error('OpenAI validation error:', error.message);
        return false;
      }
    }else{
      return true;
    }
  }

  async validateCustomConfig(url, apiKey, model) {
    // Validate URL to prevent SSRF attacks
    // Allow private IPs since custom AI services may be hosted internally
    const urlValidation = await validateApiUrl(url, this.getSetupUrlValidationOptions());
    if (!urlValidation.valid) {
      console.error('Custom AI URL validation error:', urlValidation.error);
      return false;
    }

    const config = {
      baseURL: url,
      // OpenAI-compatible SDKs expect an apiKey option even for endpoints without auth.
      apiKey: apiKey || CUSTOM_PROVIDER_FALLBACK_API_KEY,
      model: model
    };
    console.log('Custom AI config:', {
      baseURL: config.baseURL,
      apiKey: config.apiKey ? '[REDACTED]' : '',
      model: config.model
    });
    try {
      const openai = new OpenAI({ 
        apiKey: config.apiKey, 
        baseURL: config.baseURL,
      });
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: "Test" }],
        model: config.model,
      });
      return completion.choices && completion.choices.length > 0;
    } catch (error) {
      console.error('Custom AI validation error:', error.message);
      return false;
    }
  }



  async validateOllamaConfig(url, model) {
    try {
      // Validate URL to prevent SSRF attacks
      // Allow private IPs since Ollama is typically hosted locally
      const urlValidation = await validateApiUrl(url, this.getSetupUrlValidationOptions());
      if (!urlValidation.valid) {
        console.error('Ollama URL validation error:', urlValidation.error);
        return false;
      }

      const response = await axios.post(`${url}/api/generate`, {
        model: model || 'llama3.2',
        prompt: 'Test',
        stream: false
      });
      return response.data && response.data.response;
    } catch (error) {
      console.error('Ollama validation error:', error.message);
      return false;
    }
  }

  async validateAzureConfig(apiKey, endpoint, deploymentName, apiVersion) {
    console.log('Endpoint: ', endpoint);
    
    // Validate Azure endpoint URL to prevent SSRF attacks
    if (endpoint) {
      const urlValidation = await validateApiUrl(endpoint, { allowPrivateIPs: false });
      if (!urlValidation.valid) {
        console.error('Azure endpoint URL validation error:', urlValidation.error);
        return false;
      }
    }

    if (config.CONFIGURED === false) {
      try {
        const openai = new AzureOpenAI({ apiKey: apiKey,
                endpoint: endpoint,
                deploymentName: deploymentName,
                apiVersion: apiVersion });
        const response = await openai.chat.completions.create({
          model: deploymentName,
          messages: [{ role: "user", content: "Test" }],
        });
        const now = new Date();
        const timestamp = now.toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
        console.log(`[DEBUG] [${timestamp}] OpenAI request sent`);
        return response.choices && response.choices.length > 0;
      } catch (error) {
        console.error('OpenAI validation error:', error.message);
        return false;
      }
    }else{
      return true;
    }
  }

  async validateConfig(config) {
    // Validate Paperless config
    const paperlessApiUrl = (config.PAPERLESS_API_URL || '').replace(/\/+$/, '').replace(/\/api$/, '');
    const paperlessValid = await this.validatePaperlessConfig(
      paperlessApiUrl,
      config.PAPERLESS_API_TOKEN
    );
    
    if (!paperlessValid) {
      throw new Error('Invalid Paperless configuration');
    }

    // Validate AI provider config
    const aiProvider = config.AI_PROVIDER || 'openai';

    console.log('AI provider:', aiProvider);
    
    if (aiProvider === 'openai') {
      const openaiValid = await this.validateOpenAIConfig(config.OPENAI_API_KEY);
      if (!openaiValid) {
        throw new Error('Invalid OpenAI configuration');
      }
    } else if (aiProvider === 'ollama') {
      const ollamaValid = await this.validateOllamaConfig(
        config.OLLAMA_API_URL || 'http://localhost:11434',
        config.OLLAMA_MODEL
      );
      if (!ollamaValid) {
        throw new Error('Invalid Ollama configuration');
      }
    } else if (aiProvider === 'custom') {
      const customValid = await this.validateCustomConfig(
        config.CUSTOM_BASE_URL,
        config.CUSTOM_API_KEY,
        config.CUSTOM_MODEL
      );
      if (!customValid) {
        throw new Error('Invalid Custom AI configuration');
      }
    } else if (aiProvider === 'azure') {
      const azureValid = await this.validateAzureConfig(
        config.AZURE_API_KEY,
        config.AZURE_ENDPOINT,
        config.AZURE_DEPLOYMENT_NAME,
        config.AZURE_API_VERSION
      );
      if (!azureValid) {
        throw new Error('Invalid Azure configuration');
      }
    }


    return true;
  }

  async saveConfig(configValues, options = {}) {
    try {
      // Validate the new configuration before saving unless explicitly skipped
      if (!options.skipValidation) {
        await this.validateConfig(configValues);
      }

      const JSON_STANDARD_PROMPT = `
        Return the result EXCLUSIVELY as a JSON object. The Tags and Title MUST be in the language that is used in the document.:
        
        {
          "title": "xxxxx",
          "correspondent": "xxxxxxxx",
          "tags": ["Tag1", "Tag2", "Tag3", "Tag4"],
          "document_date": "YYYY-MM-DD",
          "language": "en/de/es/..."
        }`;

      // Ensure data directory exists
      const dataDir = path.dirname(this.envPath);
      await fs.mkdir(dataDir, { recursive: true });

      const persistentConfig = this.filterProtectedInjectedConfig(configValues);

      if (this.isLegacyConfigSourceMode()) {
        const envContent = Object.entries(persistentConfig)
          .map(([key, value]) => `${key}=${this.encodeEnvValue(value)}`)
          .join('\n');

        await fs.writeFile(this.envPath, envContent);
      }

      await this.saveRuntimeOverrides(configValues);
      
      // Reload environment variables
      Object.entries(persistentConfig).forEach(([key, value]) => {
        process.env[key] = this.normalizeEnvironmentValue(value);
      });
    } catch (error) {
      console.error('Error saving config:', error.message);
      throw error;
    }
  }

  hasRequiredConfiguration(config) {
    if (!config || typeof config !== 'object') {
      return false;
    }

    const paperlessApiUrl = String(config.PAPERLESS_API_URL || '').trim();
    const aiProvider = String(config.AI_PROVIDER || '').trim().toLowerCase();
    if (!paperlessApiUrl || !aiProvider) {
      return false;
    }

    if (aiProvider === 'openai') {
      return Boolean(String(config.OPENAI_API_KEY || '').trim());
    }

    if (aiProvider === 'ollama') {
      return Boolean(String(config.OLLAMA_API_URL || '').trim()) && Boolean(String(config.OLLAMA_MODEL || '').trim());
    }

    if (aiProvider === 'azure') {
      return Boolean(String(config.AZURE_ENDPOINT || '').trim())
        && Boolean(String(config.AZURE_API_KEY || '').trim())
        && Boolean(String(config.AZURE_DEPLOYMENT_NAME || '').trim());
    }

    if (aiProvider === 'custom') {
      return Boolean(String(config.CUSTOM_BASE_URL || '').trim()) && Boolean(String(config.CUSTOM_MODEL || '').trim());
    }

    return false;
  }

  async isDatabaseHealthy() {
    try {
      // Attempt a non-intrusive read from the users table to validate database health
      const documentModel = require('../models/document.js');
      const users = await documentModel.getUsers();
      // If we can query without error, database is healthy
      return Array.isArray(users);
    } catch (error) {
      console.error('[SECURITY] Database health check failed:', error.message);
      return false;
    }
  }

  async getSetupState() {
    try {
      if (this.isLegacyConfigSourceMode()) {
        // Legacy mode depends on data/.env as the persisted source.
        try {
          await fs.access(this.envPath, fs.constants.F_OK);
        } catch {
          return 'first-run';
        }
      }

      // Runtime-first mode derives configuration from runtime env + overrides.
      const config = await this.loadConfig();
      const effectiveConfig = {
        ...this.getRuntimeConfigurationSnapshot(),
        ...(config || {})
      };
      const isConfigComplete = this.hasRequiredConfiguration(effectiveConfig);

      if (!isConfigComplete) {
        return 'partial';
      }

      // Configuration is complete, check database health
      const dbHealthy = await this.isDatabaseHealthy();

      if (!dbHealthy) {
        console.warn('[SECURITY] Setup state: degraded (config exists, database unhealthy)');
        return 'degraded';
      }

      // All checks passed
      return 'configured';
    } catch (error) {
      console.error('[SECURITY] Error determining setup state:', error.message);
      // Conservative: treat unexpected errors as degraded
      return 'degraded';
    }
  }

  async isConfigured() {
    if (this.configured !== null) {
      return this.configured;
    }

    try {
      if (this.isLegacyConfigSourceMode()) {
        try {
          await fs.access(this.envPath, fs.constants.F_OK);
        } catch (_err) {
          console.log('No .env file found. Starting setup process...');
          this.configured = false;
          return false;
        }
      }

      const config = await this.loadConfig();
      const effectiveConfig = {
        ...this.getRuntimeConfigurationSnapshot(),
        ...(config || {})
      };
      if (!this.hasRequiredConfiguration(effectiveConfig)) {
        console.log('Required configuration is incomplete. Starting setup process...');
        this.configured = false;
        return false;
      }

      this.configured = true;
      return true;
    } catch (error) {
      console.error('Error checking initial configuration:', error.message);
      this.configured = false;
      return false;
    }
  }
}

module.exports = new SetupService();
