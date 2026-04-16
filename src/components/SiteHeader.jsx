import { Link, NavLink } from 'react-router-dom';

function SiteHeader({ articleCount, readCount, rightText = '' }) {
  const hasStats = Number.isFinite(articleCount) && Number.isFinite(readCount);
  const showRightTextOnly = Boolean(rightText) && !hasStats;
  const safeArticleCount = hasStats ? articleCount : '--';
  const safeReadCount = hasStats ? readCount : '--';

  return (
    <header className="site-header">
      <div className="site-header__brand">
        <Link className="brand-mark" to="/" aria-label="返回首页">
          <img src="/logo.png" alt="logo" />
        </Link>
        <div>
          <Link className="brand-title" to="/">
            杨学峰博客
          </Link>
          <p className="brand-subtitle">TECH JOURNAL</p>
        </div>
        <span className="runtime-pill">
          <i />
          SYSTEM ONLINE
        </span>
      </div>

      <nav className="site-nav" aria-label="主导航">
        <NavLink to="/" end>
          首页
        </NavLink>
        <NavLink to="/archive">归档</NavLink>
        <NavLink to="/links">友联</NavLink>
        <NavLink to="/about">关于</NavLink>
      </nav>

      <div className="site-header__right">
        {showRightTextOnly ? (
          <span>{rightText}</span>
        ) : (
          <>
            <span className="site-stat-pill">
              <strong>{safeArticleCount}</strong>
              <small>POSTS</small>
            </span>
            <span className="site-stat-pill">
              <strong>{safeReadCount}</strong>
              <small>READS</small>
            </span>
          </>
        )}
      </div>
    </header>
  );
}

export default SiteHeader;
