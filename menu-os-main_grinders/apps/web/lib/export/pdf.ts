import PDFDocument from "pdfkit";

export interface PdfSection {
  heading: string;
  kind: "summary" | "table";
  summary?: { label: string; value: string }[];
  table?: { columns: string[]; rows: (string | number)[][] };
}

const MARGIN = 50;

/**
 * A plain, real PDF built from real data via pdfkit (no headless browser needed).
 * Deliberately unstyled beyond clean typography/spacing — this is a financial
 * document, not a marketing page.
 */
export function buildReportPdf(params: { title: string; subtitle: string; sections: PdfSection[] }): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).font("Helvetica-Bold").fillColor("#13131A").text(params.title);
    doc.moveDown(0.15);
    doc.fontSize(11).font("Helvetica").fillColor("#666").text(params.subtitle);
    doc.moveDown(1);

    for (const section of params.sections) {
      ensureSpace(doc, 60);
      doc.fontSize(13).font("Helvetica-Bold").fillColor("#13131A").text(section.heading);
      doc.moveDown(0.5);

      if (section.kind === "summary" && section.summary) {
        for (const item of section.summary) {
          ensureSpace(doc, 20);
          const y = doc.y;
          doc.fontSize(10).font("Helvetica").fillColor("#555").text(item.label, MARGIN, y, { width: 220 });
          doc.fontSize(10).font("Helvetica-Bold").fillColor("#000").text(item.value, MARGIN + 220, y, { width: 200 });
          doc.moveDown(0.5);
        }
      }

      if (section.kind === "table" && section.table) {
        drawTable(doc, section.table.columns, section.table.rows);
      }

      doc.moveDown(1.2);
    }

    const pageRange = doc.bufferedPageRange();
    for (let i = 0; i < pageRange.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .fillColor("#999")
        .text(`Menu OS by ORVYQ CO. — generated ${new Date().toISOString()} — page ${i + 1} of ${pageRange.count}`, MARGIN, doc.page.height - 35, {
          width: doc.page.width - MARGIN * 2,
          align: "center",
        });
    }

    doc.end();
  });
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  if (doc.y + needed > doc.page.height - 60) doc.addPage();
}

function drawTable(doc: PDFKit.PDFDocument, columns: string[], rows: (string | number)[][]) {
  const usableWidth = doc.page.width - MARGIN * 2;
  const colWidth = usableWidth / columns.length;

  function drawRow(cells: (string | number)[], opts: { bold?: boolean; color?: string } = {}) {
    ensureSpace(doc, 18);
    const y = doc.y;
    doc.font(opts.bold ? "Helvetica-Bold" : "Helvetica").fontSize(9).fillColor(opts.color ?? "#000");
    cells.forEach((cell, i) => {
      doc.text(String(cell), MARGIN + i * colWidth, y, { width: colWidth - 6, lineBreak: false });
    });
    doc.moveDown(0.9);
  }

  drawRow(columns, { bold: true, color: "#13131A" });
  doc
    .moveTo(MARGIN, doc.y - 4)
    .lineTo(MARGIN + usableWidth, doc.y - 4)
    .strokeColor("#ddd")
    .stroke();

  if (rows.length === 0) {
    drawRow(["No data for this range", ...columns.slice(1).map(() => "")], { color: "#999" });
    return;
  }

  for (const row of rows) drawRow(row);
}
