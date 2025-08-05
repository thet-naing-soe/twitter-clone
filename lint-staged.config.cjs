/** @type {import('lint-staged').Config} */

module.exports = {
  // JavaScript / TypeScript
  '**/*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],

  // JSON, CSS, Markdown
  '**/*.{json,css,md,mdx}': ['prettier --write'],

  // Prisma schema files
  '**/*.prisma': ['prettier --write'],
};
