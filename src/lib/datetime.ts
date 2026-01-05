export function startOfDayUTC(d: Date) {
  return new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      0, 0, 0, 0
    )
  );
}

export function addDaysUTC(d: Date, days: number) {
  const copy = new Date(d);
  copy.setUTCDate(copy.getUTCDate() + days);
  return startOfDayUTC(copy);
}

export function isoDay(d: Date) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}
