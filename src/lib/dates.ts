/**
 * Calendar-date helpers shared by the search criteria (URL query string) and
 * the components that edit them.
 *
 * A rental window is a calendar date, not an instant: "2026-08-06" means that
 * day in the port, wherever the visitor's browser happens to be. The native
 * `Date` conversions do not respect that — `new Date("2026-08-06")` parses as
 * UTC midnight (the previous day west of Greenwich) and `toISOString()` shifts
 * a local midnight back into UTC. Both round-trips are done here from the local
 * date parts instead, so a date survives the URL unchanged in every timezone.
 */

/** Local-date counterpart of `new Date(isoDate)`. */
export function parseISODate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);

  return new Date(year, month - 1, day);
}

/** Local-date counterpart of `date.toISOString().slice(0, 10)`. */
export function toISODate(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

/** Renders an ISO calendar date as `dd/MM/yyyy` without going through `Date`. */
export function formatISODate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");

  return `${day}/${month}/${year}`;
}

/** Strips the time component so two dates from different sources compare. */
export function toLocalMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
