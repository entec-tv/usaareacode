/**
 * ENTEC — Universal File & Text Decoder for Bulk Phone Extractor
 *
 * Handles:
 * 1. Microsoft Excel Workbooks (.xlsx, .xls, .ods) via SheetJS with smart column mapping
 * 2. Microsoft Word Documents (.docx, .doc) via XML text chunk extraction
 * 3. Delimited CSV/TSV files with delimiter detection & Arabic/English column recognition
 * 4. Multi-encoding text/CSV decoding (UTF-8, UTF-16 LE/BE, Windows-1256 Arabic ANSI from Excel)
 * 5. Eastern Arabic-Indic numerals conversion (٠-٩ -> 0-9)
 */

import {
  smartParseCSV,
  detectCSVColumns,
  csvRowsToText,
  normalizeEasternArabicNumerals,
} from "./lead-extractor";

export { normalizeEasternArabicNumerals };

/**
 * Extracts plain text from a Word (.docx / .doc) binary buffer.
 */
export function extractDocText(arrayBuffer: ArrayBuffer): string {
  try {
    const decoder = new TextDecoder("utf-8", { fatal: false });
    const raw = decoder.decode(new Uint8Array(arrayBuffer));
    const xmlChunks: string[] = [];
    const tagRE = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
    let m: RegExpExecArray | null;

    while ((m = tagRE.exec(raw)) !== null) {
      const text = m[1];
      if (text && text.trim()) xmlChunks.push(text);
    }

    if (xmlChunks.length > 3) {
      return xmlChunks.join(" ").replace(/\s+/g, " ");
    }

    // Fallback: extract printable ASCII + Arabic text fragments
    const printRE = /[\x20-\x7E\u0600-\u06FF\u00C0-\u024F]{4,}/g;
    const matches = raw.match(printRE);
    return matches ? matches.join("\n") : "";
  } catch (e) {
    console.warn("Failed to extract docx text:", e);
    return "";
  }
}

/**
 * Parses any uploaded file (Excel, Word, CSV, TXT, LOG) into structured plain text.
 */
export async function parseUploadedFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const fname = file.name.toLowerCase();

  // 1. Check for Word documents (.docx, .doc)
  if (fname.endsWith(".docx") || fname.endsWith(".doc")) {
    const docText = extractDocText(buffer);
    if (docText.trim()) return docText;
  }

  // 2. Check for Excel Workbooks (.xlsx, .xls, .ods)
  const isZip =
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04;

  const isCfb =
    bytes.length >= 4 &&
    bytes[0] === 0xd0 &&
    bytes[1] === 0xcf &&
    bytes[2] === 0x11 &&
    bytes[3] === 0xe0;

  const isExcelExt = /\.(xlsx|xls|ods|fods)$/i.test(fname);

  if (isZip || isCfb || isExcelExt) {
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(buffer, { type: "array" });
      const allTextChunks: string[] = [];

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        if (worksheet) {
          // Attempt smart column mapping
          const aoa: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });
          const strAoa: string[][] = aoa.map((r) => r.map((c) => String(c ?? "")));
          const colMap = detectCSVColumns(strAoa);

          if (colMap && colMap.phoneCol >= 0) {
            allTextChunks.push(csvRowsToText(strAoa, colMap));
          } else {
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            if (csv && csv.trim()) {
              allTextChunks.push(csv);
            }
          }
        }
      }

      if (allTextChunks.length > 0) {
        return allTextChunks.join("\n\n");
      }
    } catch (err) {
      console.warn("SheetJS parse attempted but fell through:", err);
    }
  }

  // 3. Delimited CSV text handling
  const decodedText = decodeTextBuffer(buffer);
  if (fname.endsWith(".csv") || fname.endsWith(".tsv") || fname.endsWith(".tab")) {
    const rows = smartParseCSV(decodedText);
    const colMap = detectCSVColumns(rows);
    if (colMap && colMap.phoneCol >= 0) {
      return csvRowsToText(rows, colMap);
    }
  }

  return decodedText;
}

/**
 * Decodes an ArrayBuffer using the correct charset.
 * Checks BOMs, tries strict UTF-8, and falls back to Windows-1256 (standard Arabic Excel ANSI).
 */
export function decodeTextBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  // Check UTF-16 LE BOM (FF FE)
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(buffer);
  }

  // Check UTF-16 BE BOM (FE FF)
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(buffer);
  }

  // Check UTF-8 BOM (EF BB BF)
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder("utf-8").decode(buffer.slice(3));
  }

  // Try strict UTF-8. If it fails (e.g. contains Windows-1256 Arabic bytes), it throws
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    // Fallback to Windows-1256 (standard Arabic Windows/Excel encoding)
    try {
      return new TextDecoder("windows-1256").decode(buffer);
    } catch {
      try {
        return new TextDecoder("iso-8859-6").decode(buffer);
      } catch {
        return new TextDecoder("utf-8").decode(buffer);
      }
    }
  }
}
