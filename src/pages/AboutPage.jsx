import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchHomeFeed } from '../api/blog';
import SidebarSection from '../components/SidebarSection';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { getCachedSiteStats, updateCachedSiteStats } from '../utils/siteStats';

const SITE_START_TIME = new Date('2018-02-01T00:00:00+08:00').getTime();

function formatRuntime(nowMs) {
  const diff = Math.max(0, nowMs - SITE_START_TIME);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days} 天 ${String(hours).padStart(2, '0')} 小时 ${String(minutes).padStart(2, '0')} 分 ${String(seconds).padStart(2, '0')} 秒`;
}

function AboutPage() {
  const [feed, setFeed] = useState(null);
  const [headerStats, setHeaderStats] = useState(() => getCachedSiteStats());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [runtimeText, setRuntimeText] = useState(formatRuntime(Date.now()));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRuntimeText(formatRuntime(Date.now()));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

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
          setError(exp.message || '页面加载失败');
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
          <section className="panel about-panel">
            <div className="section-head section-head--page">
              <h2>关于本站</h2>
              <p>杨学峰博客</p>
            </div>
            <blockquote>
              <p>
                1. 博客基于 Python + Django + MySQL + Redis 构建，项目地址：
                <a href="https://github.com/a1401358759/my_site" target="_blank" rel="noreferrer">
                  GitHub
                </a>
                。
              </p>
              <p>2. 主要记录工作与学习中的实战经验，也欢迎交流与指正。</p>
              <p>3. 本站自 2018-02-01 起稳定运行，已持续运行 {runtimeText}。</p>
            </blockquote>
          </section>

          <section className="panel about-panel">
            <div className="section-head section-head--page">
              <h2>关于我</h2>
              <p>Python 开发者</p>
            </div>
            <blockquote>
              <p>1. 长期从事后端研发，对工程化、性能优化和技术写作有持续兴趣。</p>
              <p>
                2. 业余时间会维护博客、打游戏、看电影，也会整理一些效率工具与实践记录。
              </p>
            </blockquote>
          </section>

          <section className="panel about-panel">
            <div className="section-head section-head--page">
              <h2>联系我</h2>
              <p>欢迎沟通</p>
            </div>
            <ul className="about-contact-list">
              <li>
                博客：
                <a href="https://www.yangsihan.com" target="_blank" rel="noreferrer">
                  杨学峰博客
                </a>
              </li>
              <li>
                邮箱：<a href="mailto:13552974161@163.com">13552974161@163.com</a>
              </li>
              <li>
                GitHub：
                <a href="https://github.com/a1401358759" target="_blank" rel="noreferrer">
                  a1401358759
                </a>
              </li>
              <li>QQ：1401358759</li>
              <li>微信：yangxuefengwx</li>
            </ul>
          </section>

          {loading && <p className="state-tip">正在加载页面数据...</p>}
          {error && !loading && <p className="state-tip state-tip--error">{error}</p>}
        </section>

        <aside className="sidebar">
          <SidebarSection title="热门文章">
            <ul className="simple-list">
              {(feed?.popular_articles || []).map((item) => (
                <li key={item.blog_id}>
                  <Link to={`/articles/${item.blog_id}`}>{item.title}</Link>
                </li>
              ))}
            </ul>
          </SidebarSection>

          <SidebarSection title="友情链接">
            <ul className="simple-list">
              {(feed?.link_list || []).slice(0, 8).map((item) => (
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

export default AboutPage;
