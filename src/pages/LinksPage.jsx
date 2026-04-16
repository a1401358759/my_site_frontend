import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchHomeFeed } from '../api/blog';
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

function getDomain(urlText) {
  try {
    const url = new URL(urlText);
    return url.host;
  } catch {
    return urlText || '';
  }
}

function LinksPage() {
  const [feed, setFeed] = useState(null);
  const [headerStats, setHeaderStats] = useState(() => getCachedSiteStats());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadPayload() {
      setLoading(true);
      setError('');
      try {
        const payload = await fetchHomeFeed({ page_num: 1, page_size: 1 });
        if (active) {
          setFeed(payload);
          const nextStats = updateCachedSiteStats(payload?.site_stats);
          if (nextStats) {
            setHeaderStats(nextStats);
          }
        }
      } catch (exp) {
        if (active) {
          setError(exp.message || '友链加载失败');
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

  return (
    <div className="page-shell">
      <SiteHeader
        articleCount={headerStats?.articleCount}
        readCount={headerStats?.readCount}
      />

      <main className="layout">
        <section className="content-area">
          <section className="panel links-hero">
            <div className="section-head section-head--page">
              <h2>友情链接</h2>
              <p>站点互荐 · 技术交流</p>
            </div>
            <p className="links-hero__desc">
              欢迎交换友链，本站倾向收录原创、稳定更新、内容有价值的技术站点。
            </p>
            <div className="links-hero__chips">
              <span>原创优先</span>
              <span>技术优先</span>
              <span>稳定访问</span>
              <span>长期更新</span>
            </div>
          </section>

          <section className="panel links-rule-panel">
            <div className="section-head section-head--page">
              <h2>友链要求</h2>
              <p>申请前请阅读</p>
            </div>
            <div className="links-rule">
              <ul className="links-rule__grid">
                <li className="yes">✓ 原创优先</li>
                <li className="yes">✓ 技术优先</li>
                <li className="no">✗ 经常宕机</li>
                <li className="no">✗ 不合法规</li>
                <li className="no">✗ 擦边球站</li>
              </ul>
              <div className="links-site-meta">
                <p>本站信息</p>
                <p>名称：杨学峰博客</p>
                <p>
                  网址：
                  <a href="https://www.yangsihan.com" target="_blank" rel="noreferrer">
                    https://www.yangsihan.com
                  </a>
                </p>
                <p>图标：https://www.yangsihan.com/static/images/logo.png</p>
                <p>描述：一个 Python 程序员的博客，记录和分享学习与生活中的实践与思考。</p>
              </div>
            </div>
          </section>

          <section className="panel links-panel">
            <div className="section-head section-head--page">
              <h2>已收录友链</h2>
              <p>{feed?.link_list?.length || 0} 个站点</p>
            </div>

            {loading && <p className="state-tip">正在加载友链...</p>}
            {error && !loading && <p className="state-tip state-tip--error">{error}</p>}

            {!loading && !error && (
              <div className="links-grid">
                {(feed?.link_list || []).map((item) => (
                  <a
                    key={item.id}
                    href={item.link || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="friend-card"
                  >
                    <div className="friend-card__topline" />
                    <img src={item.avatar || '/logo.png'} alt={item.name} />
                    <div className="friend-card__body">
                      <h3>{item.name}</h3>
                      <p>{item.desc || '这个朋友比较低调，还没有填写简介。'}</p>
                      <span>{getDomain(item.link)}</span>
                    </div>
                  </a>
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

          <SidebarSection title="归档">
            <ul className="simple-list">
              {(feed?.archive_list || []).slice(0, 10).map((item) => (
                <li key={item.label}>
                  <Link to={`/archive#${item.label}`}>{item.label}</Link>
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

export default LinksPage;
