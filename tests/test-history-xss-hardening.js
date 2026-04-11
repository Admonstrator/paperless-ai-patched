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
  console.log('\n=== History XSS Hardening Checks ===');

  const historyPath = path.join(process.cwd(), 'public', 'js', 'history.js');
  const historyContent = fs.readFileSync(historyPath, 'utf8');

  assertNotIncludes(
    historyContent,
    "onclick=\"window.open('${data.link}')\"",
    'History view button must not use inline window.open handler'
  );
  assertNotIncludes(
    historyContent,
    "onclick=\"window.open('/chat?open=${data.document_id}')\"",
    'History chat button must not use inline window.open handler'
  );

  assertIncludes(
    historyContent,
    'class="history-view-btn',
    'History view button should use dedicated class for safe event binding'
  );
  assertIncludes(
    historyContent,
    'class="history-chat-btn',
    'History chat button should use dedicated class for safe event binding'
  );

  assertIncludes(
    historyContent,
    'this.attachActionButtonListeners();',
    'History DataTable draw callback must reattach action button listeners'
  );
  assertIncludes(
    historyContent,
    'isSafeHistoryLink(link)',
    'History actions must validate links before opening'
  );
  assertIncludes(
    historyContent,
    "if (!/^\\d+$/.test(docId))",
    'History chat action must validate numeric document ids'
  );
  assertIncludes(
    historyContent,
    'encodeURIComponent(docId)',
    'History chat action must URL-encode document ids'
  );

  console.log('✅ History XSS hardening checks passed');
}

if (require.main === module) {
  try {
    run();
    process.exit(0);
  } catch (error) {
    console.error('❌ History XSS hardening checks failed:', error.message);
    process.exit(1);
  }
}

module.exports = { run };