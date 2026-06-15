import { CATEGORY_KEYS, CATEGORY_LABELS, CATEGORY_SHORT_LABELS } from './config.js';
import { groupByAgeGroup } from './age-group.js';

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getPodiumClass(placement) {
  if (placement === 1) return 'podium--gold';
  if (placement === 2) return 'podium--silver';
  if (placement === 3) return 'podium--bronze';
  return '';
}

function getDisplayPlacement(athlete, useAgeGroupPlacement) {
  if (useAgeGroupPlacement && athlete.ageGroupPlacement != null) {
    return athlete.ageGroupPlacement;
  }
  return athlete.placement;
}

function renderAthleteCards(athletes, highlightQuery, useAgeGroupPlacement = false) {
  if (athletes.length === 0) {
    return '<p class="grid-card__empty">Nenhum atleta encontrado.</p>';
  }

  return athletes
    .map((athlete) => {
      const displayPlacement = getDisplayPlacement(athlete, useAgeGroupPlacement);
      const podium = getPodiumClass(displayPlacement);
      const highlight = highlightQuery ? ' athlete-card--highlight' : '';

      return `
        <article class="athlete-card ${podium}${highlight}">
          <div class="athlete-card__row">
            <span class="athlete-card__placement">${escapeHtml(String(displayPlacement))}º</span>
            <div class="athlete-card__main">
              <span class="athlete-card__name">${escapeHtml(athlete.name)}</span>
              <span class="athlete-card__meta">#${escapeHtml(athlete.number)} · ${escapeHtml(athlete.team || '—')}</span>
            </div>
            <div class="athlete-card__times">
              <span class="athlete-card__net">${escapeHtml(athlete.netTime)}</span>
              <span class="athlete-card__pace">${escapeHtml(athlete.pace)}</span>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderTable(athletes, highlightQuery, useAgeGroupPlacement = false) {
  if (athletes.length === 0) {
    return '<p class="grid-card__empty">Nenhum atleta encontrado.</p>';
  }

  const rows = athletes
    .map((athlete) => {
      const displayPlacement = getDisplayPlacement(athlete, useAgeGroupPlacement);
      const podium = getPodiumClass(displayPlacement);
      const highlight = highlightQuery ? ' row--highlight' : '';

      return `
        <tr class="${podium}${highlight}">
          <td data-label="Colocação">${escapeHtml(String(displayPlacement))}</td>
          <td data-label="Nº">${escapeHtml(athlete.number)}</td>
          <td data-label="Nome">${escapeHtml(athlete.name)}</td>
          <td data-label="Equipe">${escapeHtml(athlete.team || '—')}</td>
          <td data-label="Ritmo">${escapeHtml(athlete.pace)}</td>
          <td data-label="Tempo líquido">${escapeHtml(athlete.netTime)}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <div class="table-wrapper">
      <table class="results-table">
        <thead>
          <tr>
            <th>Colocação</th>
            <th>Nº</th>
            <th>Nome</th>
            <th>Equipe</th>
            <th>Ritmo</th>
            <th>Tempo líquido</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="athlete-cards">${renderAthleteCards(athletes, highlightQuery, useAgeGroupPlacement)}</div>
  `;
}

function sortByAgeGroupPlacement(athletes) {
  return [...athletes].sort((a, b) => {
    const pa = a.ageGroupPlacement ?? Number.MAX_SAFE_INTEGER;
    const pb = b.ageGroupPlacement ?? Number.MAX_SAFE_INTEGER;
    return pa - pb;
  });
}

function renderAgeTabs(categoryKey, ageGroups, state, highlightQuery) {
  if (ageGroups.length === 0) {
    return '<p class="grid-card__empty">Nenhum atleta encontrado.</p>';
  }

  const activeCode =
    state.activeAgeTab && ageGroups.some((g) => g.code === state.activeAgeTab)
      ? state.activeAgeTab
      : ageGroups[0].code;

  const tabs = ageGroups
    .map((group) => {
      const isActive = group.code === activeCode;
      const count = group.athletes.length;

      return `
        <button
          type="button"
          class="tab${isActive ? ' tab--active' : ''}"
          data-action="set-age-tab"
          data-category="${categoryKey}"
          data-age-code="${escapeHtml(group.code)}"
        >
          ${escapeHtml(group.label)} (${count})
        </button>
      `;
    })
    .join('');

  const activeGroup = ageGroups.find((g) => g.code === activeCode) || ageGroups[0];
  const sortedAthletes = sortByAgeGroupPlacement(activeGroup.athletes);

  return `
    <div class="tabs" role="tablist">${tabs}</div>
    <div class="tab-panel">
      ${renderTable(sortedAthletes, highlightQuery, true)}
    </div>
  `;
}

function renderGridCard(categoryKey, athletes, gridState, searchQuery) {
  const state = gridState[categoryKey] || {
    expanded: false,
    viewMode: 'all',
    activeAgeTab: null,
  };

  const count = athletes.length;
  const countLabel = count === 1 ? '1 atleta' : `${count} atletas`;
  const highlightQuery = searchQuery.trim().length > 0;

  if (count === 0 && !highlightQuery) {
    return `
      <section class="grid-card grid-card--empty" data-category="${categoryKey}">
        <header class="grid-card__header">
          <span class="grid-card__count">Sem dados</span>
        </header>
        <p class="grid-card__empty">Nenhum resultado disponível para esta categoria.</p>
      </section>
    `;
  }

  if (count === 0 && highlightQuery) {
    return `
      <section class="grid-card" data-category="${categoryKey}">
        <header class="grid-card__header">
          <span class="grid-card__count">0 atletas</span>
        </header>
        <p class="grid-card__empty">Nenhum atleta encontrado para esta busca.</p>
      </section>
    `;
  }

  const visibleAthletes =
    state.viewMode === 'all' && !state.expanded ? athletes.slice(0, 3) : athletes;

  const ageGroups = groupByAgeGroup(athletes);

  const bodyContent =
    state.viewMode === 'age'
      ? renderAgeTabs(categoryKey, ageGroups, state, highlightQuery)
      : renderTable(visibleAthletes, highlightQuery);

  const showExpandButton =
    state.viewMode === 'all' && athletes.length > 3;

  const expandLabel = state.expanded ? 'Ver menos' : 'Ver todos';

  return `
    <section class="grid-card" data-category="${categoryKey}">
      <header class="grid-card__header">
        <span class="grid-card__count">${countLabel}</span>
      </header>

      <div class="grid-card__toolbar">
        <div class="view-toggle" role="group" aria-label="Modo de visualização">
          <button
            type="button"
            class="view-toggle__btn${state.viewMode === 'all' ? ' view-toggle__btn--active' : ''}"
            data-action="set-view-mode"
            data-category="${categoryKey}"
            data-mode="all"
          >Todos</button>
          <button
            type="button"
            class="view-toggle__btn${state.viewMode === 'age' ? ' view-toggle__btn--active' : ''}"
            data-action="set-view-mode"
            data-category="${categoryKey}"
            data-mode="age"
          ><span class="view-toggle__label view-toggle__label--full">Por faixa etária</span><span class="view-toggle__label view-toggle__label--short">Fx. etária</span></button>
        </div>
      </div>

      <div class="grid-card__body">${bodyContent}</div>

      ${
        showExpandButton
          ? `<button
              type="button"
              class="btn btn--ghost btn--expand"
              data-action="toggle-expand"
              data-category="${categoryKey}"
            >${expandLabel}</button>`
          : ''
      }
    </section>
  `;
}

export function renderSkeleton(container) {
  container.innerHTML = `
    <div class="results-panel">
      <div class="category-tabs category-tabs--loading">
        ${CATEGORY_KEYS.map(() => '<div class="skeleton skeleton--tab"></div>').join('')}
      </div>
      <div class="grid-card grid-card--skeleton">
        <div class="skeleton skeleton--title"></div>
        <div class="skeleton skeleton--line"></div>
        <div class="skeleton skeleton--line"></div>
        <div class="skeleton skeleton--line skeleton--short"></div>
      </div>
    </div>
  `;
}

export function renderAlert(container, message, type = 'error') {
  container.innerHTML = `
    <div class="alert alert--${type}">
      <span class="alert__icon" aria-hidden="true">${type === 'error' ? '⚠' : 'ℹ'}</span>
      <p class="alert__text">${escapeHtml(message)}</p>
    </div>
  `;
}

export function clearAlert(container) {
  container.innerHTML = '';
}

function renderCategoryTabs(filteredCategories, activeCategoryTab) {
  const tabs = CATEGORY_KEYS.map((key) => {
    const isActive = key === activeCategoryTab;
    const count = (filteredCategories[key] || []).length;
    const label = CATEGORY_LABELS[key];
    const shortLabel = CATEGORY_SHORT_LABELS[key];

    return `
      <button
        type="button"
        class="category-tab${isActive ? ' category-tab--active' : ''}"
        role="tab"
        aria-selected="${isActive}"
        data-action="set-category-tab"
        data-category="${key}"
      >
        <span class="category-tab__label category-tab__label--full">${escapeHtml(label)}</span>
        <span class="category-tab__label category-tab__label--short">${escapeHtml(shortLabel)}</span>
        <span class="category-tab__count">${count}</span>
      </button>
    `;
  }).join('');

  return `<nav class="category-tabs" role="tablist">${tabs}</nav>`;
}

export function renderGrids(container, filteredCategories, gridState, searchQuery, activeCategoryTab) {
  const activeKey = CATEGORY_KEYS.includes(activeCategoryTab)
    ? activeCategoryTab
    : CATEGORY_KEYS[0];

  const activeAthletes = filteredCategories[activeKey] || [];

  container.innerHTML = `
    <div class="results-panel">
      ${renderCategoryTabs(filteredCategories, activeKey)}
      <div class="category-panel" role="tabpanel">
        ${renderGridCard(activeKey, activeAthletes, gridState, searchQuery)}
      </div>
    </div>
  `;
}

export function updateEventTitle(titleEl, eventTitle) {
  if (titleEl && eventTitle) {
    titleEl.textContent = eventTitle;
  }
}
