import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchArchiveTimeline, fetchHomeFeed } from '../api/blog';
import SidebarSection from '../components/SidebarSection';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { getCachedSiteStats, updateCachedSiteStats } from '../utils/siteStats';

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

function ArchivePage() {
  const [feed, setFeed] = useState(null);
  const [headerStats, setHeaderStats] = useState(() => getCachedSiteStats());
  const [archiveData, setArchiveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadPayload() {
      setLoading(true);
      setError('');
      try {
        const [feedPayload, archivePayload] = await Promise.all([
          fetchHomeFeed({ page_num: 1, page_size: 1 }),
          fetchArchiveTimeline(),
        ]);
        if (active) {
          setFeed(feedPayload);
          const nextStats = updateCachedSiteStats(feedPayload?.site_stats);
          if (nextStats) {
            setHeaderStats(nextStats);
          }
          setArchiveData(archivePayload.archive_timeline || []);
        }
      } catch (exp) {
        if (active) {
          setError(exp.message || '归档加载失败');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPayload();
    return () => {
      active = false;
    };
  }, []);

  const archiveTotal = useMemo(
    () => archiveData.reduce((total, item) => total + Number(item.article_count || 0), 0),
    [archiveData],
  );

  return (
    <div className="page-shell">
      <SiteHeader
        articleCount={headerStats?.articleCount}
        readCount={headerStats?.readCount}
      />

      <main className="layout">
        <section className="content-area">
          <section className="panel archive-panel">
            <div className="section-head section-head--page">
              <h2>文章归档</h2>
              <p>{archiveTotal} 篇文章</p>
            </div>

            {loading && <p className="state-tip">正在加载归档...</p>}
            {error && !loading && <p className="state-tip state-tip--error">{error}</p>}

            {!loading && !error && archiveData.length === 0 && <p className="state-tip">暂无归档数据。</p>}

            {!loading && !error && archiveData.length > 0 && (
              <div className="archive-groups">
                {archiveData.map((group) => (
                  <section key={group.label} id={group.label} className="archive-month-block">
                    <h3>
                      {group.year}年{group.month}月 <small>({group.article_count})</small>
                    </h3>
                    <ul className="archive-entry-list">
                      {(group.articles || []).map((item) => (
                        <li key={item.blog_id}>
                          <span className="archive-entry-date">{item.publish_day}</span>
                          <Link to={`/articles/${item.blog_id}`}>{item.title}</Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </section>
        </section>

        <aside className="sidebar">
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

      <SiteFooter />
    </div>
  );
}

export default ArchivePage;
