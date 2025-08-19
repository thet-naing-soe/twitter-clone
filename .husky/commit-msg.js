#!/usr/bin/env node
const { execSync } = require('child_process');

const msgPath = process.argv[2];

if (!msgPath) {
  console.error('No commit message file provided');
  process.exit(1);
}

try {
  execSync(`npx commitlint --edit "${msgPath}"`, { stdio: 'inherit' });
} catch (error) {
  process.exit(1);
}
