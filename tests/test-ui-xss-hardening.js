const fs = require('fs');
const path = require('path');

function assertIncludes(content, snippet, message) {
  if (!content.includes(snippet)) {
    throw new Error(message);
  }
}

function assertNotIncludes(content, snippet, message) {
  if (content.includes(snippet)) {
    throw new Error(message);
  }
}

function run() {
  console.log('\n=== UI XSS Hardening Checks ===');

  const chatPath = path.join(process.cwd(), 'public', 'js', 'chat.js');
  const ragPath = path.join(process.cwd(), 'views', 'partials', 'scripts', 'rag-scripts.ejs');
  const settingsPath = path.join(process.cwd(), 'views', 'settings.ejs');

  const chatContent = fs.readFileSync(chatPath, 'utf8');
  const ragContent = fs.readFileSync(ragPath, 'utf8');
  const settingsContent = fs.readFileSync(settingsPath, 'utf8');

  assertIncludes(
    chatContent,
    'const safeMarkdown = escapeHtml(markdown);',
    'Chat streaming path must escape markdown before marked.parse()'
  );
  assertIncludes(
    chatContent,
    'const safeMessageContent = escapeHtml(String(messageContent ?? \'\'));',
    'Chat non-stream path must escape assistant message before marked.parse()'
  );

  assertIncludes(
    ragContent,
    'const safeMessage = escapeHtml(message);',
    'RAG assistant answer must be escaped before HTML formatting'
  );
  assertIncludes(
    ragContent,
    'const safeLabel = escapeHtml(label);',
    'RAG status badge label must be escaped'
  );
  assertIncludes(
    ragContent,
    'const safeValue = escapeHtml(value);',
    'RAG status badge value must be escaped'
  );

  assertNotIncludes(
    settingsContent,
    'data-api-key="<%= config.API_KEY %>"',
    'Settings page must not expose API key in SSR data attribute'
  );
  assertNotIncludes(
    settingsContent,
    'title="<%= config.API_KEY %>"',
    'Settings page must not expose API key in SSR title attribute'
  );

  console.log('✅ UI XSS hardening checks passed');
}

if (require.main === module) {
  try {
    run();
    process.exit(0);
  } catch (error) {
    console.error('❌ UI XSS hardening checks failed:', error.message);
    process.exit(1);
  }
}

module.exports = { run };
