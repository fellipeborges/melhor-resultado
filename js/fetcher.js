import { CORS_PROXY, FETCH_TIMEOUT_MS } from './config.js';

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function decodeResponse(response) {
  const buffer = await response.arrayBuffer();

  try {
    return new TextDecoder('windows-1252').decode(buffer);
  } catch {
    return new TextDecoder('latin1').decode(buffer);
  }
}

async function fetchHtml(url) {
  const response = await fetchWithTimeout(url);
  return decodeResponse(response);
}

export async function fetchResultsPage(url) {
  try {
    return await fetchHtml(url);
  } catch (directError) {
    try {
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
      return await fetchHtml(proxyUrl);
    } catch (proxyError) {
      if (directError.name === 'AbortError' || proxyError.name === 'AbortError') {
        throw new Error('Tempo esgotado ao buscar a página. Tente novamente.');
      }
      throw new Error(
        'Não foi possível acessar a página. Verifique a URL ou tente mais tarde.'
      );
    }
  }
}
