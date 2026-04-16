import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchHomeFeed } from '../api/blog';
import CalendarWidget from '../components/CalendarWidget';
import SidebarSection from '../components/SidebarSection';
import SiteHeader from '../components/SiteHeader';
import { getCachedSiteStats, updateCachedSiteStats } from '../utils/siteStats';
import { renderSummaryHtml } from '../utils/markdown';

const INITIAL_QUERY = {
  page_num: 1,
  page_size: 8,
  keyword: '',
  tag: '',
  classification: '',
  year: '',
  month: '',
};

function buildPageList(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  const pages = [];
  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }
  if (pages[0] !== 1) {
    pages.unshift(1);
  }
  if (pages[pages.length - 1] !== totalPages) {
    pages.push(totalPages);
  }
  return pages;
}

function getRankClass(index) {
  if (index === 0) {
    return 'first-rank';
  }
  if (index === 1) {
    return 'second-rank';
  }
  if (index === 2) {
    return 'third-rank';
  }
  return 'other-rank';
}

function HomePage() {
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [draft, setDraft] = useState(INITIAL_QUERY);
  const [feed, setFeed] = useState(null);
  const [headerStats, setHeaderStats] = useState(() => getCachedSiteStats());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeBanner, setActiveBanner] = useState(0);

  const bannerList = feed?.banner_list || [];

  useEffect(() => {
    setDraft((prev) => ({
      ...prev,
      keyword: query.keyword,
      tag: query.tag,
      classification: query.classification,
    }));
  }, [query.keyword, query.tag, query.classification]);

  useEffect(() => {
    let active = true;
    async function loadFeed() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchHomeFeed(query);
        if (active) {
          setFeed(data);
          const nextStats = updateCachedSiteStats(data?.site_stats);
          if (nextStats) {
            setHeaderStats(nextStats);
          }
        }
      } catch (exp) {
        if (active) {
          setError(exp.message || '加载失败');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadFeed();
    return () => {
      active = false;
    };
  }, [query]);

  useEffect(() => {
    setActiveBanner(0);
  }, [bannerList.length]);

  useEffect(() => {
    if (bannerList.length <= 1) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % bannerList.length);
    }, 4800);
    return () => {
      window.clearInterval(timer);
    };
  }, [bannerList.length]);

  const totalPages = Number(feed?.total_pages || 0);
  const pageNum = Number(query.page_num || 1);
  const pageList = useMemo(() => buildPageList(pageNum, totalPages), [pageNum, totalPages]);
  const activeArchiveLabel =
    query.year && query.month ? `${query.year}-${String(query.month).padStart(2, '0')}` : '';

  const onInputChange = (event) => {
    const { name, value } = event.target;
    setDraft((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSearch = (event) => {
    event.preventDefault();
    setQuery((prev) => ({
      ...prev,
      keyword: draft.keyword,
      tag: draft.tag,
      classification: draft.classification,
      page_num: 1,
    }));
  };

  const onPageChange = (pageNumValue) => {
    if (pageNumValue === pageNum) {
      return;
    }
    setQuery((prev) => ({
      ...prev,
      page_num: pageNumValue,
    }));
  };

  const onQuickFilter = (field, value) => {
    setQuery((prev) => ({
      ...prev,
      [field]: value,
      page_num: 1,
    }));
  };

  const onArchiveFilter = (year, month) => {
    setQuery((prev) => ({
      ...prev,
      year,
      month,
      page_num: 1,
    }));
  };

  const goBanner = (targetIndex) => {
    if (bannerList.length <= 1) {
      return;
    }
    const safeIndex = (targetIndex + bannerList.length) % bannerList.length;
    setActiveBanner(safeIndex);
  };

  return (
    <div className="page-shell">
      <SiteHeader
        articleCount={headerStats?.articleCount}
        readCount={headerStats?.readCount}
      />

      <section className="hero-carousel" aria-label="首页轮播图">
        {bannerList.length > 0 ? (
          bannerList.map((item, index) => {
            const isActive = index === activeBanner;
            const cardStyle = item.path ? { backgroundImage: `url(${item.path})` } : undefined;
            const body = <div className="hero-mask" />;

            return (
              <article key={item.id || `${item.path}-${index}`} className={`hero-slide ${isActive ? 'is-active' : ''}`} style={cardStyle}>
                {item.link ? (
                  <a href={item.link} target="_blank" rel="noreferrer" className="hero-slide-link">
                    {body}
                  </a>
                ) : (
                  <div className="hero-slide-link">{body}</div>
                )}
              </article>
            );
          })
        ) : (
          <article className="hero-slide is-active">
            <div className="hero-mask" />
          </article>
        )}

        {bannerList.length > 1 && (
          <div className="hero-controls">
            <button
              type="button"
              className="hero-nav-btn"
              aria-label="上一张"
              onClick={() => goBanner(activeBanner - 1)}
            >
              ‹
            </button>
            <div className="hero-dots" role="tablist" aria-label="轮播分页">
              {bannerList.map((item, index) => (
                <button
                  key={item.id || `dot-${index}`}
                  type="button"
                  className={index === activeBanner ? 'active' : ''}
                  aria-label={`切换到第 ${index + 1} 张`}
                  onClick={() => goBanner(index)}
                />
              ))}
            </div>
            <button
              type="button"
              className="hero-nav-btn"
              aria-label="下一张"
              onClick={() => goBanner(activeBanner + 1)}
            >
              ›
            </button>
          </div>
        )}
      </section>

      <main className="layout">
        <section className="content-area">
          <form className="filter-form" onSubmit={onSearch}>
            <input
              name="keyword"
              value={draft.keyword}
              onChange={onInputChange}
              placeholder="搜索标题 / 分类 / 标签"
            />
            <select name="classification" value={draft.classification} onChange={onInputChange}>
              <option value="">全部分类</option>
              {(feed?.classification_list || []).map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
            <select name="tag" value={draft.tag} onChange={onInputChange}>
              <option value="">全部标签</option>
              {(feed?.tag_list || []).map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
            <button type="submit" className="filter-submit">
              筛选
            </button>
          </form>

          {loading && <p className="state-tip">正在加载文章...</p>}
          {error && !loading && <p className="state-tip state-tip--error">{error}</p>}

          {!loading && !error && (
            <>
              <div className="section-head">
                <h2>Latest Signals</h2>
                <p>{feed?.total || 0} 条内容</p>
              </div>

              <div className="article-list">
                {(feed?.articles || []).map((item, index) => (
                  <article key={item.blog_id} className="article-card" style={{ '--stagger': index }}>
                    <div className="article-head">
                      <p>
                        {item.publish_time} · {item.author}
                      </p>
                      <span>{item.count} 阅读</span>
                    </div>
                    <h2>
                      <Link to={`/articles/${item.blog_id}`}>{item.title}</Link>
                    </h2>
                    <div
                      className="article-summary"
                      dangerouslySetInnerHTML={{
                        __html: renderSummaryHtml(item.content || item.summary || '暂无摘要', item.editor),
                      }}
                    />
                    <div className="article-foot">
                      <div className="chip-row chip-row--dense chip-row--foot">
                        <button type="button" onClick={() => onQuickFilter('classification', item.classification)}>
                          {item.classification}
                        </button>
                        {item.tags.map((tagName) => (
                          <button key={tagName} type="button" onClick={() => onQuickFilter('tag', tagName)}>
                            {tagName}
                          </button>
                        ))}
                      </div>
                      <Link className="read-more" to={`/articles/${item.blog_id}`}>
                        READ FULL ARTICLE →
                      </Link>
                    </div>
                  </article>
                ))}
                {feed?.articles?.length === 0 && <p className="state-tip">暂无文章数据。</p>}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    type="button"
                    disabled={pageNum <= 1}
                    onClick={() => onPageChange(Math.max(1, pageNum - 1))}
                  >
                    上一页
                  </button>
                  {pageList.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={page === pageNum ? 'active' : ''}
                      onClick={() => onPageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={pageNum >= totalPages}
                    onClick={() => onPageChange(Math.min(totalPages, pageNum + 1))}
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <aside className="sidebar">
          <div className="sidebar-calendar">
            <CalendarWidget />
          </div>

          <SidebarSection title="热门文章">
            <ul className="hot-list">
              {(feed?.popular_articles || []).map((item, index) => (
                <li key={item.blog_id}>
                  <Link to={`/articles/${item.blog_id}`}>
                    <span className={`rank-badge ${getRankClass(index)}`}>{index + 1}</span>
                    <span className="hot-list__title">{item.title}</span>
                    <span className="hot-list__count">({item.count})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </SidebarSection>

          <SidebarSection title="分类">
            <ul className="meta-list">
              {(feed?.classification_list || []).map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => onQuickFilter('classification', item.name)}>
                    <span>{item.name}</span>
                    <span>{item.article_count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </SidebarSection>

          <SidebarSection title="标签">
            <div className="chip-row chip-row--dense">
              {(feed?.tag_list || []).map((item) => (
                <button key={item.id} type="button" onClick={() => onQuickFilter('tag', item.name)}>
                  {item.name}({item.article_count})
                </button>
              ))}
            </div>
          </SidebarSection>

          <SidebarSection title="归档">
            <ul className="meta-list">
              {(feed?.archive_list || []).map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    className={activeArchiveLabel === item.label ? 'active' : ''}
                    onClick={() => onArchiveFilter(item.year, item.month)}
                  >
                    <span>{item.label}</span>
                    <span>{item.article_count}</span>
                  </button>
                </li>
              ))}
            </ul>
            {activeArchiveLabel && (
              <div className="panel-action">
                <button type="button" onClick={() => onArchiveFilter('', '')}>
                  清除归档筛选（{activeArchiveLabel}）
                </button>
              </div>
            )}
          </SidebarSection>

          <SidebarSection title="友情链接">
            <ul className="simple-list">
              {(feed?.link_list || []).map((item) => (
                <li key={item.id}>
                  <a href={item.link} target="_blank" rel="noreferrer">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </SidebarSection>
        </aside>
      </main>
    </div>
  );
}

export default HomePage;
