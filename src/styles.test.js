import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');

describe('styles', () => {
  it('keeps summary images inside article cards', () => {
    expect(css).toMatch(/\.article-summary\s+img\s*\{/);
    expect(css).toMatch(/\.article-summary\s+img[\s\S]*max-width:\s*100%/);
    expect(css).toMatch(/\.article-summary\s+img[\s\S]*height:\s*auto/);
  });

  it('keeps read-more vertically centered in article footer', () => {
    expect(css).toMatch(/\.article-foot\s*\{[\s\S]*align-items:\s*center/);
    expect(css).toMatch(/\.article-foot\s+\.read-more\s*\{[\s\S]*align-self:\s*center/);
  });

  it('adds enough space between top divider and title', () => {
    expect(css).toMatch(/\.article-card\s+h2\s*\{[\s\S]*margin:\s*20px\s+0\s+10px/);
  });

  it('uses relaxed spacing for summary blocks', () => {
    expect(css).toMatch(/\.article-summary\s*\{[\s\S]*line-height:\s*1\.9/);
    expect(css).toMatch(/\.article-summary\s+p,[\s\S]*margin:\s*0\s+0\s+12px/);
  });

  it('avoids double border on highlighted code blocks', () => {
    expect(css).toMatch(/\.article-summary\s+\.codehilite\s+pre\s*\{/);
    expect(css).toMatch(/\.article-summary\s+\.codehilite\s+pre[\s\S]*border:\s*none/);
    expect(css).toMatch(/\.article-summary\s+\.codehilite\s+pre[\s\S]*background:\s*transparent/);
  });

  it('does not import remote web fonts', () => {
    expect(css).not.toMatch(/fonts\.googleapis\.com/);
    expect(css).not.toMatch(/@import\s+url\(['"]https?:\/\//);
  });

  it('uses local system font stacks', () => {
    expect(css).toMatch(/--body-font:\s*'PingFang SC'/);
    expect(css).toMatch(/--mono-font:\s*'SFMono-Regular'/);
  });
});
