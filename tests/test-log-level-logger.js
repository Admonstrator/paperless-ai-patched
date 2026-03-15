const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const Logger = require('../services/loggerService');

function runLoggerCase(logLevel, fileName, emitLogs) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'paperless-ai-logger-'));
  const logPath = path.join(tempDir, fileName);

  const logger = new Logger({
    logDir: tempDir,
    logFile: fileName,
    format: 'txt',
    timestamp: false,
    logLevel
  });

  try {
    emitLogs();
  } finally {
    logger.restore();
  }

  const content = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : '';
  fs.rmSync(tempDir, { recursive: true, force: true });
  return content;
}

try {
  const infoContent = runLoggerCase('info', 'info.log', () => {
    console.debug('debug-hidden');
    console.info('info-visible');
    console.warn('warn-visible');
    console.error('error-visible');
  });

  assert(!infoContent.includes('debug-hidden'), 'Expected debug log to be filtered when LOG_LEVEL=info');
  assert(infoContent.includes('info-visible'), 'Expected info log to be present when LOG_LEVEL=info');
  assert(infoContent.includes('warn-visible'), 'Expected warn log to be present when LOG_LEVEL=info');
  assert(infoContent.includes('error-visible'), 'Expected error log to be present when LOG_LEVEL=info');

  const debugContent = runLoggerCase('debug', 'debug.log', () => {
    console.debug('debug-visible');
  });

  assert(debugContent.includes('debug-visible'), 'Expected debug log to be present when LOG_LEVEL=debug');

  const warnContent = runLoggerCase('warn', 'warn.log', () => {
    console.info('info-hidden');
    console.warn('warn-visible-warn-level');
  });

  assert(!warnContent.includes('info-hidden'), 'Expected info log to be filtered when LOG_LEVEL=warn');
  assert(warnContent.includes('warn-visible-warn-level'), 'Expected warn log to be present when LOG_LEVEL=warn');

  console.log('[PASS] Logger LOG_LEVEL filtering checks passed');
} catch (error) {
  console.error('[FAIL] Logger LOG_LEVEL filtering test failed:', error.message);
  process.exit(1);
}
