const path = require('path');

const THUMBNAIL_CACHE_DIR = path.join(process.cwd(), 'data', 'thumb-cache');
const LEGACY_PUBLIC_THUMBNAIL_CACHE_DIR = path.join(process.cwd(), 'public', 'images');

function getThumbnailCachePath(documentId) {
  if (documentId == null) {
    throw new Error('Invalid document ID for thumbnail cache');
  }
  const sanitized = String(documentId).replace(/[^a-zA-Z0-9_-]/g, '');
  if (!sanitized) {
    throw new Error('Invalid document ID for thumbnail cache');
  }
  return path.join(THUMBNAIL_CACHE_DIR, `${sanitized}.png`);
}

module.exports = {
  THUMBNAIL_CACHE_DIR,
  LEGACY_PUBLIC_THUMBNAIL_CACHE_DIR,
  getThumbnailCachePath
};
