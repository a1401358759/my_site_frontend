import { describe, expect, it } from 'vitest';

import { renderContentHtml, renderSummaryHtml } from './markdown';

describe('renderContentHtml', () => {
  it('renders markdown content when editor is markdown', () => {
    const html = renderContentHtml('### 标题\n**加粗** 文本', 2);

    expect(html).toContain('<h3>标题</h3>');
    expect(html).toContain('<strong>加粗</strong>');
  });

  it('keeps rich text html unchanged when editor is rich text', () => {
    const html = renderContentHtml('<p><strong>富文本</strong></p>', 1);

    expect(html).toBe('<p><strong>富文本</strong></p>');
  });

  it('adds syntax highlight classes for markdown code fence', () => {
    const html = renderContentHtml('```python\nprint("hello")\n```', 2);

    expect(html).toContain('class="hljs language-python"');
  });

  it('truncates long markdown summaries before rendering', () => {
    const longMarkdown = `## 标题\n\n${'a'.repeat(500)}`;
    const html = renderSummaryHtml(longMarkdown, 2, 120);

    expect(html).toContain('...');
    expect(html).not.toContain('a'.repeat(300));
  });
});
