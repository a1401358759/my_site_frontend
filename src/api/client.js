const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

function buildUrl(path, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  const queryText = query.toString();
  return `${API_BASE_URL}${path}${queryText ? `?${queryText}` : ''}`;
}

export async function request(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const params = options.params || {};
  const body = options.body;
  const response = await fetch(buildUrl(path, method === 'GET' ? params : {}), {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new Error(`接口请求失败 (${response.status})`);
  }
  const data = await response.json();
  if (typeof data.code === 'number' && data.code !== 0) {
    throw new Error(data.msg_cn || data.msg || '请求失败');
  }
  return data;
}

export { API_BASE_URL };
