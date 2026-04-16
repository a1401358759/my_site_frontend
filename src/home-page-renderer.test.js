import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const homePageSource = readFileSync(new URL('./pages/HomePage.jsx', import.meta.url), 'utf8');

describe('HomePage renderer source', () => {
  it('uses summary renderer with article content and editor', () => {
    expect(homePageSource).toMatch(/renderSummaryHtml\(item\.content\s*\|\|\s*item\.summary\s*\|\|\s*'暂无摘要',\s*item\.editor\)/);
    expect(homePageSource).not.toMatch(/summary_html/);
  });
});
