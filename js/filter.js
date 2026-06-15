export function filterAthletes(athletes, query) {
  const term = query.trim().toLowerCase();
  if (!term) {
    return athletes;
  }

  return athletes.filter((athlete) => {
    const name = (athlete.name || '').toLowerCase();
    const number = String(athlete.number || '');
    const team = (athlete.team || '').toLowerCase();

    return (
      name.includes(term) ||
      number.includes(term) ||
      team.includes(term)
    );
  });
}

export function filterCategories(categories, query) {
  const filtered = {};

  for (const [key, athletes] of Object.entries(categories)) {
    filtered[key] = filterAthletes(athletes, query);
  }

  return filtered;
}
