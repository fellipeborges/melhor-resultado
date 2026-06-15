export function parseAgeGroupLabel(code) {
  if (!code || typeof code !== 'string') {
    return '—';
  }

  const trimmed = code.trim().toUpperCase();
  const match = trimmed.match(/^[FM](\d{2})(\d{2})$/);

  if (!match) {
    return trimmed;
  }

  const start = parseInt(match[1], 10);
  const end = parseInt(match[2], 10);
  return `${start} a ${end}`;
}

export function getAgeGroupSortKey(code) {
  if (!code) {
    return 9999;
  }

  const match = code.trim().toUpperCase().match(/^[FM](\d{2})/);
  return match ? parseInt(match[1], 10) : 9999;
}

export function groupByAgeGroup(athletes) {
  const groups = new Map();

  for (const athlete of athletes) {
    const code = athlete.ageGroupCode || '';
    if (!groups.has(code)) {
      groups.set(code, []);
    }
    groups.get(code).push(athlete);
  }

  return [...groups.entries()]
    .sort(([codeA], [codeB]) => getAgeGroupSortKey(codeA) - getAgeGroupSortKey(codeB))
    .map(([code, items]) => ({
      code,
      label: parseAgeGroupLabel(code),
      athletes: items,
    }));
}
