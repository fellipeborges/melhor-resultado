export function normalizeSourceUrl(raw) {
  let trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const glued = trimmed.match(/^[\w/-]+?(https?:\/\/.*)$/i);
  if (glued) {
    trimmed = glued[1];
  }

  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    trimmed = `https://${trimmed.replace(/^\/+/, '')}`;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

export function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    url: params.get('url') || '',
    q: params.get('q') || '',
  };
}

export function setUrlParams({ url, q }) {
  const params = new URLSearchParams();

  if (url) {
    params.set('url', url);
  }
  if (q) {
    params.set('q', q);
  }

  const query = params.toString();
  const newUrl = query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname;

  window.history.replaceState(null, '', newUrl);
}
