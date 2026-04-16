import { request } from './client';

export function fetchHomeFeed(params = {}) {
  return request('/api/mysite/v1/home/', { params });
}

export function fetchArchiveTimeline() {
  return request('/api/mysite/v1/archive/');
}

export function fetchArticleDetail(articleId) {
  return request(`/api/mysite/v1/articles/${articleId}/`);
}

export function fetchComments(target, pageNum = 1, pageSize = 20) {
  return request('/api/mysite/v1/comments/', {
    params: {
      target,
      page_num: pageNum,
      page_size: pageSize,
    },
  });
}

export function createComment(payload) {
  return request('/api/mysite/v1/comments/', {
    method: 'POST',
    body: payload,
  });
}
