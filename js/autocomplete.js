const MAX_SUGGESTIONS = 10;

function isValidTeam(team) {
  const trimmed = (team || '').trim();
  return trimmed.length > 0 && trimmed !== '—' && trimmed !== '-';
}

export function buildSearchTerms(categories) {
  const names = new Set();
  const teams = new Set();

  for (const athletes of Object.values(categories)) {
    for (const athlete of athletes) {
      const name = (athlete.name || '').trim();
      if (name) {
        names.add(name);
      }
      if (isValidTeam(athlete.team)) {
        teams.add(athlete.team.trim());
      }
    }
  }

  const nameTerms = [...names]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .map((value) => ({ value, type: 'name' }));

  const teamTerms = [...teams]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .map((value) => ({ value, type: 'team' }));

  return [...nameTerms, ...teamTerms];
}

export function filterSearchTerms(terms, query, limit = MAX_SUGGESTIONS) {
  const term = query.trim().toLowerCase();
  if (!term) {
    return [];
  }

  const matches = terms.filter((item) => item.value.toLowerCase().includes(term));

  matches.sort((a, b) => {
    const aStarts = a.value.toLowerCase().startsWith(term);
    const bStarts = b.value.toLowerCase().startsWith(term);
    if (aStarts !== bStarts) {
      return aStarts ? -1 : 1;
    }
    if (a.type !== b.type) {
      return a.type === 'name' ? -1 : 1;
    }
    return a.value.localeCompare(b.value, 'pt-BR');
  });

  return matches.slice(0, limit);
}

export function createSearchAutocomplete(input, list, { getTerms, onSelect }) {
  let activeIndex = -1;
  let visibleItems = [];

  function hideList() {
    list.hidden = true;
    list.innerHTML = '';
    visibleItems = [];
    activeIndex = -1;
    input.setAttribute('aria-expanded', 'false');
  }

  function renderList(items) {
    visibleItems = items;
    activeIndex = -1;

    if (items.length === 0) {
      hideList();
      return;
    }

    list.innerHTML = items
      .map(
        (item, index) => `
          <li
            class="search-autocomplete__item"
            role="option"
            id="search-suggestion-${index}"
            data-index="${index}"
            aria-selected="false"
          >
            <span class="search-autocomplete__value">${escapeHtml(item.value)}</span>
            <span class="search-autocomplete__type">${item.type === 'name' ? 'Nome' : 'Equipe'}</span>
          </li>
        `
      )
      .join('');

    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function refresh() {
    renderList(filterSearchTerms(getTerms(), input.value));
  }

  function setActiveIndex(index) {
    const options = list.querySelectorAll('[role="option"]');
    options.forEach((option, i) => {
      const isActive = i === index;
      option.classList.toggle('search-autocomplete__item--active', isActive);
      option.setAttribute('aria-selected', String(isActive));
    });
    activeIndex = index;

    if (index >= 0 && options[index]) {
      input.setAttribute('aria-activedescendant', options[index].id);
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  function selectItem(index) {
    const item = visibleItems[index];
    if (!item) {
      return;
    }

    input.value = item.value;
    hideList();
    onSelect(item.value);
  }

  input.addEventListener('input', refresh);

  input.addEventListener('focus', refresh);

  input.addEventListener('blur', () => {
    setTimeout(hideList, 150);
  });

  input.addEventListener('keydown', (event) => {
    if (list.hidden) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(Math.min(activeIndex + 1, visibleItems.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(Math.max(activeIndex - 1, 0));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectItem(activeIndex);
    } else if (event.key === 'Escape') {
      hideList();
    }
  });

  list.addEventListener('mousedown', (event) => {
    event.preventDefault();
  });

  list.addEventListener('click', (event) => {
    const item = event.target.closest('[data-index]');
    if (!item) {
      return;
    }
    selectItem(Number(item.dataset.index));
  });

  return {
    refresh,
    clear: hideList,
  };
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
