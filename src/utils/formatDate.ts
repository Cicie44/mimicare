/** Formats an ISO date string ("2026-06-15" or full timestamp) as "Jun 15, 2026". */
export function formatDate(dateStr: string): string {
  const date = dateStr.includes("T") ? new Date(dateStr) : new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
