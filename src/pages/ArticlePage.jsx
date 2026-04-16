import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { createComment, fetchArticleDetail, fetchComments } from '../api/blog';
import SidebarSection from '../components/SidebarSection';
import SiteHeader from '../components/SiteHeader';
import { renderContentHtml } from '../utils/markdown';

function slugifyHeading(text, index) {
  const normalized = (text || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || `section-${index + 1}`;
}

function buildContentWithToc(rawHtml) {
  if (!rawHtml) {
    return { html: '', tocItems: [] };
  }
  if (typeof window === 'undefined') {
    return { html: rawHtml, tocItems: [] };
  }

  const parser = new window.DOMParser();
  const doc = parser.parseFromString(`<div id="article-content-root">${rawHtml}</div>`, 'text/html');
  const root = doc.getElementById('article-content-root');

  if (!root) {
    return { html: rawHtml, tocItems: [] };
  }

  const headings = Array.from(root.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const idSet = new Set();
  const tocItems = headings.map((heading, index) => {
    const level = Number(heading.tagName.slice(1));
    const text = (heading.textContent || '').trim() || `标题 ${index + 1}`;
    let baseId = (heading.getAttribute('id') || '').trim() || slugifyHeading(text, index);
    let nextId = baseId;
    let suffix = 1;
    while (idSet.has(nextId)) {
      suffix += 1;
      nextId = `${baseId}-${suffix}`;
    }
    idSet.add(nextId);
    heading.setAttribute('id', nextId);

    return {
      id: nextId,
      text,
      level,
    };
  });

  return {
    html: root.innerHTML,
    tocItems,
  };
}

function ArticlePage() {
  const { articleId } = useParams();
  const commentTarget = `/articles/${articleId}`;
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(true);
  const [commentError, setCommentError] = useState('');
  const [commentTotal, setCommentTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    website: '',
    content: '',
  });

  useEffect(() => {
    let active = true;
    async function loadDetail() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchArticleDetail(articleId);
        if (active) {
          setPayload(data);
        }
      } catch (exp) {
        if (active) {
          setError(exp.message || '文章加载失败');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadDetail();
    return () => {
      active = false;
    };
  }, [articleId]);

  useEffect(() => {
    let active = true;
    async function loadComments() {
      setCommentLoading(true);
      setCommentError('');
      try {
        const data = await fetchComments(commentTarget, 1, 20);
        if (active) {
          setComments(data.comment_list || []);
          setCommentTotal(Number(data.total || 0));
        }
      } catch (exp) {
        if (active) {
          setCommentError(exp.message || '评论加载失败');
        }
      } finally {
        if (active) {
          setCommentLoading(false);
        }
      }
    }
    loadComments();
    return () => {
      active = false;
    };
  }, [commentTarget]);

  const article = payload?.article;
  const renderedHtml = article ? renderContentHtml(article.content, article.editor) : '';
  const { html: contentHtml, tocItems } = useMemo(
    () => buildContentWithToc(renderedHtml),
    [renderedHtml]
  );

  const onInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmitComment = async (event) => {
    event.preventDefault();
    if (!formData.nickname || !formData.email || !formData.content) {
      setCommentError('昵称、邮箱、评论内容不能为空');
      return;
    }
    setSubmitting(true);
    setCommentError('');
    try {
      await createComment({
        ...formData,
        target: commentTarget,
      });
      const data = await fetchComments(commentTarget, 1, 20);
      setComments(data.comment_list || []);
      setCommentTotal(Number(data.total || 0));
      setFormData((prev) => ({
        ...prev,
        content: '',
      }));
    } catch (exp) {
      setCommentError(exp.message || '评论提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell page-shell--detail">
      <SiteHeader rightText="文章详情" />

      {loading && <p className="state-tip">正在加载文章...</p>}
      {error && !loading && <p className="state-tip state-tip--error">{error}</p>}

      {!loading && !error && article && (
        <main className="detail-layout">
          <section className="detail-main">
            <article className="detail-card">
              <p className="detail-time">
                发表时间：{article.publish_time} · 更新于 {article.last_update}
              </p>
              <h1>{article.title}</h1>
              <p className="detail-author">
                作者：{article.author.name} · 分类：{article.classification.name} · 阅读：{article.count}
              </p>
              <div className="chip-row">
                {article.tags.map((item) => (
                  <span key={item.id}>{item.name}</span>
                ))}
              </div>
              <div className="article-body" dangerouslySetInnerHTML={{ __html: contentHtml }} />
            </article>

            <section className="panel detail-tail">
              <div className="article-neighbor">
                <p>
                  <span>上一篇：</span>
                  {payload.previous_article ? (
                    <Link to={`/articles/${payload.previous_article.blog_id}`}>{payload.previous_article.title}</Link>
                  ) : (
                    <span>没有上一篇</span>
                  )}
                </p>
                <p>
                  <span>下一篇：</span>
                  {payload.next_article ? (
                    <Link to={`/articles/${payload.next_article.blog_id}`}>{payload.next_article.title}</Link>
                  ) : (
                    <span>没有下一篇</span>
                  )}
                </p>
              </div>
            </section>

            <section className="panel comment-panel">
              <h2>评论（{commentTotal}）</h2>
              <form className="comment-form" onSubmit={onSubmitComment}>
                <input
                  name="nickname"
                  value={formData.nickname}
                  onChange={onInputChange}
                  placeholder="昵称 *"
                />
                <input
                  name="email"
                  value={formData.email}
                  onChange={onInputChange}
                  placeholder="邮箱 *"
                />
                <input
                  name="website"
                  value={formData.website}
                  onChange={onInputChange}
                  placeholder="网站（可选）"
                />
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={onInputChange}
                  placeholder="说点什么..."
                />
                <button type="submit" disabled={submitting}>
                  {submitting ? '提交中...' : '提交评论'}
                </button>
              </form>

              {commentLoading && <p className="state-tip">正在加载评论...</p>}
              {commentError && <p className="state-tip state-tip--error">{commentError}</p>}

              {!commentLoading && !commentError && (
                <div className="comment-list">
                  {comments.length === 0 && <p className="state-tip">还没有评论，欢迎抢沙发。</p>}
                  {comments.map((item) => (
                    <article key={item.comment_id} className="comment-item">
                      <div className="comment-item-head">
                        <strong>{item.nickname}</strong>
                        <span>{item.created_time}</span>
                      </div>
                      {(item.country || item.province || item.city) && (
                        <p className="comment-location">
                          {item.country || ''} {item.province || ''} {item.city || ''}
                        </p>
                      )}
                      <div className="comment-body" dangerouslySetInnerHTML={{ __html: item.comment }} />
                    </article>
                  ))}
                </div>
              )}
            </section>
          </section>

          <aside className="sidebar">
            <SidebarSection title="文章目录">
              {tocItems.length > 0 ? (
                <ul className="toc-list">
                  {tocItems.map((item) => (
                    <li key={item.id} className={`level-${Math.min(item.level, 4)}`}>
                      <a href={`#${item.id}`}>{item.text}</a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>当前文章暂无目录。</p>
              )}
            </SidebarSection>

            <SidebarSection title="友情提醒">
              <p>
                {payload.not_update_days >= 180
                  ? `本文最后更新于 ${payload.not_update_days} 天前，文中信息可能已发生变化，请谨慎使用。`
                  : '这篇文章仍保持较新的更新频率。'}
              </p>
            </SidebarSection>

            <SidebarSection title="同分类文章">
              <ul className="simple-list">
                {(payload.related_articles || []).map((item) => (
                  <li key={item.blog_id}>
                    <Link to={`/articles/${item.blog_id}`}>{item.title}</Link>
                  </li>
                ))}
              </ul>
            </SidebarSection>
          </aside>
        </main>
      )}
    </div>
  );
}

export default ArticlePage;
