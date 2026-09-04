export type Row = Record<string, string | number | boolean | null | undefined>;

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function toCsv(rows: Row[]): string {
  const first = rows[0];
  if (!first) return "";
  const headers = Object.keys(first);
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join(
    "\n",
  );
}

export function exportCsv(rows: Row[], filename = "entec-export.csv") {
  download(new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" }), filename);
}

export function exportJson(rows: Row[], filename = "entec-export.json") {
  download(
    new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" }),
    filename,
  );
}

export async function exportXlsx(
  rows: Row[],
  filename = "entec-export.xlsx",
  sheet = "ENTEC",
) {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheet);
  XLSX.writeFile(wb, filename);
}

export async function copyTable(rows: Row[]) {
  const first = rows[0];
  if (!first) return;
  const headers = Object.keys(first);
  const text = [
    headers.join("\t"),
    ...rows.map((r) => headers.map((h) => r[h] ?? "").join("\t")),
  ].join("\n");
  await navigator.clipboard.writeText(text);
}
