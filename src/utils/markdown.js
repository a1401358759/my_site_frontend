import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js/lib/common';

marked.setOptions({
  breaks: true,
  gfm: true,
});

marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    },
  })
);

function toPlainText(html) {
  return (html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(text) {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncateText(text, limit) {
  const normalized = (text || '').trim();
  if (!normalized) {
    return '';
  }
  if (normalized.length <= limit) {
    return normalized;
  }
  return `${normalized.slice(0, limit)}...`;
}

export function renderContentHtml(content, editor) {
  const source = content || '';
  if (Number(editor) === 2) {
    return marked.parse(source);
  }
  return source;
}

export function renderSummaryHtml(content, editor, limit = 320) {
  if (Number(editor) === 2) {
    let source = truncateText(content || '', limit);
    const fenceCount = (source.match(/```/g) || []).length;
    if (fenceCount % 2 === 1) {
      source += '\n```';
    }
    return marked.parse(source || '暂无摘要');
  }

  const plainText = truncateText(toPlainText(content), limit);
  return `<p>${escapeHtml(plainText || '暂无摘要')}</p>`;
}
