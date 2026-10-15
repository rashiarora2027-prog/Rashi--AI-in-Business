/**
 * astronomy-engine maps the "import" condition to ./esm/astronomy.js but never
 * declares "type": "module" next to it. Node therefore parses that file as
 * CommonJS and throws:
 *
 *   SyntaxError: Unexpected token 'export'
 *
 * which takes down the server on the first request that touches a chart.
 * Writing the marker the error message asks for makes Node read that directory
 * as ES modules. Runs automatically after install; safe to run repeatedly.
 *
 * The package's "exports" map hides its own package.json, so the directory is
 * located on disk rather than through module resolution.
 */

import fs from 'fs';
import path from 'path';

function findEsmDir(startDir) {
  let dir = startDir;
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, 'node_modules', 'astronomy-engine', 'esm');
    if (fs.existsSync(path.join(candidate, 'astronomy.js'))) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

try {
  const esmDir = findEsmDir(process.cwd());

  if (!esmDir) {
    console.log('[patch-astronomy] astronomy-engine/esm not found; nothing to do');
    process.exit(0);
  }

  const marker = path.join(esmDir, 'package.json');
  if (fs.existsSync(marker)) {
    const existing = JSON.parse(fs.readFileSync(marker, 'utf8'));
    if (existing.type === 'module') {
      console.log('[patch-astronomy] already patched');
      process.exit(0);
    }
  }

  fs.writeFileSync(marker, JSON.stringify({ type: 'module' }, null, 2) + '\n');
  console.log(`[patch-astronomy] wrote ${marker}`);
} catch (err) {
  // Never fail the install over this.
  console.warn('[patch-astronomy] skipped:', err.message);
}
