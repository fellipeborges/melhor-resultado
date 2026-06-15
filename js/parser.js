function normalizeHeader(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\./g, '.');
}

function buildColumnMap(headers) {
  const map = {};

  headers.forEach((header, index) => {
    const normalized = normalizeHeader(header);

    if (normalized.startsWith('coloc')) map.coloc = index;
    else if (normalized.startsWith('num')) map.num = index;
    else if (normalized.startsWith('nome')) map.nome = index;
    else if (normalized.startsWith('equipe')) map.equipe = index;
    else if (normalized.includes('cl.fx.et') || normalized.startsWith('clfxet')) map['cl.fx.et'] = index;
    else if (normalized.includes('fx.et') || normalized === 'fxet') map['fx.et'] = index;
    else if (normalized.includes('cl.geral') || normalized.startsWith('clgeral')) map['cl.geral'] = index;
    else if (normalized.startsWith('ritmo')) map.ritmo = index;
    else if (normalized.startsWith('tempo')) map.tempo = index;
    else if (normalized.startsWith('liquido')) map.liquido = index;
  });

  return map;
}

function hasRequiredColumns(columnMap) {
  const hasPlacement =
    columnMap.coloc !== undefined ||
    columnMap['cl.fx.et'] !== undefined ||
    columnMap['cl.geral'] !== undefined;

  const hasNetTime =
    columnMap.liquido !== undefined || columnMap.tempo !== undefined;

  return (
    hasPlacement &&
    columnMap.num !== undefined &&
    columnMap.nome !== undefined &&
    hasNetTime
  );
}

function getCellText(cells, index) {
  if (index === undefined || index >= cells.length) {
    return '';
  }
  return cells[index].textContent.trim();
}

function parseAgeGroupPlacement(raw) {
  if (!raw || raw === '-') {
    return null;
  }
  const value = parseInt(raw, 10);
  return Number.isNaN(value) ? null : value;
}

function parseRow(cells, columnMap) {
  let placementRaw;

  if (columnMap.coloc !== undefined) {
    placementRaw = getCellText(cells, columnMap.coloc);
  } else if (columnMap['cl.geral'] !== undefined) {
    placementRaw = getCellText(cells, columnMap['cl.geral']);
  } else {
    placementRaw = getCellText(cells, columnMap['cl.fx.et']);
  }

  const placement = parseInt(placementRaw, 10);
  const hasGeneralColoc = columnMap.coloc !== undefined;
  const ageGroupPlacement = hasGeneralColoc
    ? parseAgeGroupPlacement(getCellText(cells, columnMap['cl.fx.et']))
    : null;

  const netTime =
    getCellText(cells, columnMap.liquido) ||
    getCellText(cells, columnMap.tempo) ||
    '';

  const pace = getCellText(cells, columnMap.ritmo) || '';

  return {
    placement: Number.isNaN(placement) ? 0 : placement,
    ageGroupPlacement,
    number: getCellText(cells, columnMap.num),
    name: getCellText(cells, columnMap.nome),
    team: getCellText(cells, columnMap.equipe),
    ageGroupCode: getCellText(cells, columnMap['fx.et']),
    pace,
    netTime,
  };
}

function parseTable(table) {
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');

  if (!thead || !tbody) {
    throw new Error('Tabela sem cabeçalho ou corpo.');
  }

  const headerCells = [...thead.querySelectorAll('th')].map((th) => th.textContent);
  const columnMap = buildColumnMap(headerCells);

  if (!hasRequiredColumns(columnMap)) {
    throw new Error('Colunas obrigatórias não encontradas na tabela.');
  }

  const athletes = [];

  for (const row of tbody.querySelectorAll('tr')) {
    const cells = [...row.querySelectorAll('td')];
    if (cells.length === 0) {
      continue;
    }

    const athlete = parseRow(cells, columnMap);
    if (athlete.name || athlete.number) {
      athletes.push(athlete);
    }
  }

  return athletes;
}

function findCategorySections(doc) {
  const sections = [];
  const labels = doc.querySelectorAll('.faixa-etaria');

  for (const label of labels) {
    const labelText = label.textContent.trim();
    if (!labelText) {
      continue;
    }

    let next = label.nextElementSibling;
    while (next && next.tagName !== 'TABLE') {
      next = next.nextElementSibling;
    }

    if (next && next.classList.contains('tabela-resultado')) {
      sections.push({ labelText, table: next });
    }
  }

  return sections;
}

function buildCategoryKey(label, index) {
  return `cat-${index}`;
}

export function parseResults(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const sections = findCategorySections(doc);

  if (sections.length === 0) {
    throw new Error(
      'Estrutura da página não reconhecida. Esta URL não parece ser uma página de resultados compatível.'
    );
  }

  const categoryList = [];
  const categories = {};

  for (const [index, section] of sections.entries()) {
    try {
      const athletes = parseTable(section.table);
      const key = buildCategoryKey(section.labelText, index);

      categoryList.push({ key, label: section.labelText, athletes });
      categories[key] = athletes;
    } catch {
      throw new Error(
        'Estrutura da página não reconhecida. Esta URL não parece ser uma página de resultados compatível.'
      );
    }
  }

  const eventTitle =
    doc.querySelector('h1')?.textContent.trim() || 'Resultados';

  return { eventTitle, categoryList, categories };
}
