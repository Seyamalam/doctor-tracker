const escapeCell = (value: string) =>
  /[",\r\n]/u.test(value) ? `"${value.replaceAll('"', '""')}"` : value;

export const downloadCsv = (
  filename: string,
  header: string[],
  rows: (string | number)[][],
): void => {
  const lines = [header, ...rows].map((row) =>
    row.map((cell) => escapeCell(String(cell))).join(","),
  );
  const blob = new Blob([`\uFEFF${lines.join("\r\n")}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const PAGE_SIZE = 50;

export const fetchAllPages = async <T>(
  fetchPage: (page: number) => Promise<{ data: T[]; totalPages: number }>,
): Promise<T[]> => {
  const first = await fetchPage(1);
  if (first.totalPages <= 1) {
    return first.data;
  }
  const rest = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, i) => fetchPage(i + 2)),
  );
  return [...first.data, ...rest.flatMap((page) => page.data)];
};

export { PAGE_SIZE as EXPORT_PAGE_SIZE };
