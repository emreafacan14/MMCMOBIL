const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "long",
  year: "numeric",
};

/** "10 Mayıs 2026" style formatting for activation dates. */
export function formatDate(isoDate: string, locale = "tr-TR"): string {
  return new Intl.DateTimeFormat(locale, DATE_OPTIONS).format(
    new Date(isoDate),
  );
}
