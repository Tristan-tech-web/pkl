import ExcelJS from "exceljs";
import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";
import { parseCsv } from "@/lib/csv";

export type Parsed =
  | { kind: "table"; rows: string[][]; sheet: string }
  | { kind: "text"; text: string }
  | { kind: "binary" };

export const MAX_ROWS = 6000;
const MAX_COLS = 60;

const cellText = (v: ExcelJS.CellValue): string => {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "object") {
    if ("richText" in v) return v.richText.map((t) => t.text).join("");
    if ("result" in v) return cellText(v.result as ExcelJS.CellValue);
    if ("text" in v) return String(v.text);
    if ("hyperlink" in v) return String(v.hyperlink);
    return "";
  }
  return String(v).trim();
};

export async function parseBuffer(name: string, mime: string | null, buf: Buffer): Promise<Parsed> {
  const lower = name.toLowerCase();
  if (lower.endsWith(".xlsx") || mime?.includes("spreadsheetml")) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf as unknown as ArrayBuffer);
    for (const ws of wb.worksheets) {
      const rows: string[][] = [];
      ws.eachRow({ includeEmpty: false }, (row) => {
        if (rows.length >= MAX_ROWS) return;
        const cells: string[] = [];
        for (let c = 1; c <= Math.min(MAX_COLS, ws.columnCount); c++) cells.push(cellText(row.getCell(c).value));
        rows.push(cells);
      });
      if (rows.length > 0) return { kind: "table", rows, sheet: ws.name };
    }
    return { kind: "text", text: "" };
  }
  if (lower.endsWith(".csv") || lower.endsWith(".tsv") || mime === "text/csv") {
    const rows = parseCsv(buf.toString("utf8")).slice(0, MAX_ROWS).map((r) => r.slice(0, MAX_COLS));
    return { kind: "table", rows, sheet: "csv" };
  }
  if (lower.endsWith(".txt") || lower.endsWith(".md") || mime?.startsWith("text/")) return { kind: "text", text: buf.toString("utf8") };
  if (lower.endsWith(".docx") || mime?.includes("wordprocessingml")) return { kind: "text", text: (await mammoth.extractRawText({ buffer: buf })).value };
  if (lower.endsWith(".pdf") || mime === "application/pdf") {
    try {
      const pdf = await getDocumentProxy(new Uint8Array(buf));
      const { text } = await extractText(pdf, { mergePages: true });
      return { kind: "text", text: String(text) };
    } catch {
      return { kind: "binary" };
    }
  }
  return { kind: "binary" };
}

export const aiAttachableMime = (name: string, mime: string | null): string | null => {
  const l = name.toLowerCase();
  if (l.endsWith(".pdf") || mime === "application/pdf") return "application/pdf";
  if (l.endsWith(".png")) return "image/png";
  if (l.endsWith(".jpg") || l.endsWith(".jpeg")) return "image/jpeg";
  if (l.endsWith(".webp")) return "image/webp";
  return null;
};
