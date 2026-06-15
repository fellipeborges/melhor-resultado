import { fetchResultsPage } from './fetcher.js';
import { parseResults } from './parser.js';
import { filterCategories } from './filter.js';
import { buildSearchTerms, createSearchAutocomplete } from './autocomplete.js';
import { getUrlParams, setUrlParams, normalizeSourceUrl } from './url-params.js';
import {
  renderGrids,
  renderSkeleton,
  renderAlert,
  clearAlert,
} from './renderer.js';

const sourceUrlInput = document.getElementById('source-url');
const searchInput = document.getElementById('search-input');
const searchSuggestions = document.getElementById('search-suggestions');
const btnClearSearch = document.getElementById('btn-clear-search');
const btnProcess = document.getElementById('btn-process');
const alertContainer = document.getElementById('alert-container');
const resultsContainer = document.getElementById('results-container');
const headerTitle = document.querySelector('.header__title');

const state = {
  sourceUrl: '',
  searchQuery: '',
  categoryList: [],
  rawCategories: null,
  gridState: {},
  activeCategoryTab: null,
  isLoading: false,
  searchTerms: [],
};

function applySearchQuery(query) {
  state.searchQuery = query;
  syncUrlParams();
  renderCurrentView();
  updateClearFilterButton();
}

function updateClearFilterButton() {
  btnClearSearch.disabled = searchInput.disabled || !searchInput.value;
}

function clearSearchFilter() {
  searchInput.value = '';
  searchAutocomplete.clear();
  applySearchQuery('');
  searchInput.focus();
}

const searchAutocomplete = createSearchAutocomplete(searchInput, searchSuggestions, {
  getTerms: () => state.searchTerms,
  onSelect: applySearchQuery,
});

function createDefaultGridState(categoryKeys) {
  return Object.fromEntries(
    categoryKeys.map((key) => [
      key,
      { viewMode: 'all', activeAgeTab: null },
    ])
  );
}

function getCategoryKeys() {
  return state.categoryList.map(({ key }) => key);
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function syncUrlParams() {
  setUrlParams({ url: state.sourceUrl, q: state.searchQuery });
}

function setControlsEnabled(hasData) {
  searchInput.disabled = !hasData;
  btnProcess.disabled = state.isLoading;
  updateClearFilterButton();
}

function renderCurrentView() {
  if (!state.rawCategories || state.categoryList.length === 0) {
    resultsContainer.innerHTML = '';
    return;
  }

  const filtered = filterCategories(state.rawCategories, state.searchQuery);
  renderGrids(
    resultsContainer,
    state.categoryList,
    filtered,
    state.gridState,
    state.searchQuery,
    state.activeCategoryTab
  );
}

async function loadResults(url) {
  const normalizedUrl = normalizeSourceUrl(url);
  if (!normalizedUrl) {
    renderAlert(alertContainer, 'Informe uma URL válida para processar.');
    return;
  }

  state.sourceUrl = normalizedUrl;
  sourceUrlInput.value = normalizedUrl;
  state.isLoading = true;
  setControlsEnabled(false);
  clearAlert(alertContainer);
  renderSkeleton(resultsContainer);
  syncUrlParams();

  try {
    const html = await fetchResultsPage(normalizedUrl);
    const { eventTitle, categoryList, categories } = parseResults(html);

    state.categoryList = categoryList;
    state.rawCategories = categories;
    state.searchTerms = buildSearchTerms(categories);
    state.gridState = createDefaultGridState(getCategoryKeys());
    state.activeCategoryTab = categoryList[0]?.key ?? null;
    headerTitle.textContent = eventTitle;

    renderCurrentView();
    setControlsEnabled(true);
  } catch (error) {
    state.categoryList = [];
    state.rawCategories = null;
    state.searchTerms = [];
    state.gridState = {};
    state.activeCategoryTab = null;
    searchAutocomplete.clear();
    resultsContainer.innerHTML = '';
    renderAlert(
      alertContainer,
      error.message || 'Erro ao processar a página de resultados.'
    );
    setControlsEnabled(false);
  } finally {
    state.isLoading = false;
    btnProcess.disabled = false;
  }
}

function handleGridAction(event) {
  const button = event.target.closest('[data-action]');
  if (!button || !state.rawCategories) {
    return;
  }

  const { action, category } = button.dataset;
  const categoryKeys = getCategoryKeys();

  if (action === 'set-category-tab') {
    if (category && categoryKeys.includes(category)) {
      state.activeCategoryTab = category;
      renderCurrentView();
    }
    return;
  }

  if (!category || !state.gridState[category]) {
    return;
  }

  const gridState = state.gridState[category];

  switch (action) {
    case 'set-view-mode':
      gridState.viewMode = button.dataset.mode;
      break;
    case 'set-age-tab':
      gridState.activeAgeTab = button.dataset.ageCode;
      break;
    default:
      return;
  }

  renderCurrentView();
}

const handleSearchInput = debounce(() => {
  applySearchQuery(searchInput.value);
}, 300);

function initFromUrlParams() {
  const params = getUrlParams();

  if (params.url) {
    sourceUrlInput.value = params.url;
  }
  if (params.q) {
    searchInput.value = params.q;
    state.searchQuery = params.q;
  }

  updateClearFilterButton();

  if (params.url) {
    loadResults(params.url);
  }
}

btnProcess.addEventListener('click', () => {
  loadResults(sourceUrlInput.value);
});

sourceUrlInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    loadResults(sourceUrlInput.value);
  }
});

searchInput.addEventListener('input', () => {
  updateClearFilterButton();
  handleSearchInput();
});

btnClearSearch.addEventListener('click', clearSearchFilter);

resultsContainer.addEventListener('click', handleGridAction);

initFromUrlParams();
