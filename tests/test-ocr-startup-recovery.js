const assert = require('assert');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

async function run() {
  const originalCwd = process.cwd();
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'paperless-ocr-recovery-'));

  try {
    process.chdir(tempRoot);

    const documentModel = require('../models/document');
    const mistralOcrService = require('../services/mistralOcrService');

    await documentModel.addToOcrQueue(101, 'Recover me', 'manual');
    await documentModel.addToOcrQueue(202, 'Still active', 'manual');
    await documentModel.addToOcrQueue(303, 'Already failed', 'manual');

    await documentModel.updateOcrQueueStatus(101, 'processing');
    await documentModel.updateOcrQueueStatus(202, 'processing');
    await documentModel.updateOcrQueueStatus(303, 'failed');

    mistralOcrService.activeDocumentIds.clear();
    mistralOcrService.activeDocumentIds.add(202);

    const summary = await mistralOcrService.recoverInterruptedJobs(console);

    assert.strictEqual(summary.recovered, 1, 'one stale processing item should be recovered');
    assert.deepStrictEqual(summary.documentIds, [101], 'only inactive processing items should be recovered');

    const recoveredItem = await documentModel.getOcrQueueItem(101);
    const activeItem = await documentModel.getOcrQueueItem(202);
    const failedItem = await documentModel.getOcrQueueItem(303);

    assert.strictEqual(recoveredItem.status, 'pending', 'stale processing item should be reset to pending');
    assert.strictEqual(recoveredItem.processed_at, null, 'recovered item should clear processed_at');
    assert.strictEqual(activeItem.status, 'processing', 'active runtime item must stay in processing');
    assert.strictEqual(failedItem.status, 'failed', 'non-processing items must not be modified');

    mistralOcrService.activeDocumentIds.clear();

    console.log('PASS test-ocr-startup-recovery');
  } finally {
    process.chdir(originalCwd);

    try {
      const documentModel = require('../models/document');
      await documentModel.closeDatabase();
    } catch (_) {
      // Ignore close failures from partially initialized test state.
    }

    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

run().catch((error) => {
  console.error('FAIL test-ocr-startup-recovery');
  console.error(error);
  process.exit(1);
});