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
