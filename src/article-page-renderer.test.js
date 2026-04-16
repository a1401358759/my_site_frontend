import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const articlePageSource = readFileSync(new URL('./pages/ArticlePage.jsx', import.meta.url), 'utf8');

describe('ArticlePage renderer source', () => {
  it('uses shared frontend renderer for detail content', () => {
    expect(articlePageSource).toMatch(/renderContentHtml\(article\.content,\s*article\.editor\)/);
    expect(articlePageSource).not.toMatch(/content_html/);
  });
});
