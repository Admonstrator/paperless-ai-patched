#!/usr/bin/env node
'use strict';
/**
 * Regenerates OPENAPI/openapi.json from swagger JSDoc annotations.
 * Temporarily removes the bundled spec so swagger.js triggers regeneration.
 */
const fs   = require('fs');
const path = require('path');

const specPath = path.join(__dirname, '..', 'OPENAPI', 'openapi.json');

// Back up and temporarily remove so swagger.js calls swaggerJSDoc()
let backup = null;
if (fs.existsSync(specPath)) {
  backup = fs.readFileSync(specPath);
  fs.unlinkSync(specPath);
}

let spec;
try {
  // Clear require cache so the module runs fresh
  Object.keys(require.cache).forEach(k => { if (k.includes('swagger')) delete require.cache[k]; });
  spec = require('../swagger');
} catch (err) {
  // Restore backup on error
  if (backup) fs.writeFileSync(specPath, backup);
  throw err;
}

fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

const found = !!(spec.paths && spec.paths['/api/settings/reconcile-history']);
console.log('OpenAPI spec regenerated. reconcile-history in spec:', found);
process.exit(found ? 0 : 1);


process.exit(found ? 0 : 1);
