let cachedSiteStats = null;

function normalizeSiteStats(raw) {
  const articleCount = Number(raw?.article_count);
  const readCount = Number(raw?.read_count);

  if (!Number.isFinite(articleCount) || !Number.isFinite(readCount)) {
    return null;
  }

  return {
    articleCount,
    readCount,
  };
}

export function getCachedSiteStats() {
  return cachedSiteStats;
}

export function updateCachedSiteStats(raw) {
  const normalized = normalizeSiteStats(raw);
  if (!normalized) {
    return null;
  }
  cachedSiteStats = normalized;
  return normalized;
}
