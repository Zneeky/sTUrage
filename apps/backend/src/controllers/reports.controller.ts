import { Response, NextFunction } from 'express';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { AuthRequest } from '../middleware/auth';
import { getCurrentStock, getMovementByPeriod, getLowStockProducts } from '../services/report.service';

type ReportData = Record<string, unknown>[];
type StockProduct = Awaited<ReturnType<typeof getCurrentStock>>[number];
type Movement = Awaited<ReturnType<typeof getMovementByPeriod>>[number];
type LowProduct = Awaited<ReturnType<typeof getLowStockProducts>>[number];

function sendJson(res: Response, data: ReportData) {
  res.json({ data });
}

async function sendPdf(res: Response, title: string, headers: string[], rows: string[][]) {
  // STUR-64: stream directly to response — no in-memory accumulation
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`);

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(res);

  doc.fontSize(16).text(title, { align: 'center' });
  doc.fontSize(10).text(`Generated: ${new Date().toISOString()}`, { align: 'center' });
  doc.moveDown();

  const colWidth = (doc.page.width - 80) / headers.length;
  let y = doc.y;

  // Header row
  doc.font('Helvetica-Bold');
  headers.forEach((h, i) => doc.text(h, 40 + i * colWidth, y, { width: colWidth - 4, lineBreak: false }));
  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
  doc.moveDown(0.5);

  doc.font('Helvetica');
  // Process in chunks of 100 rows to keep memory bounded
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    for (const row of chunk) {
      y = doc.y;
      if (y > doc.page.height - 60) { doc.addPage(); y = doc.y; }
      row.forEach((cell, ci) => doc.text(cell, 40 + ci * colWidth, y, { width: colWidth - 4, lineBreak: false }));
      doc.moveDown(0.4);
    }
  }

  doc.end();
}

async function sendExcel(res: Response, title: string, headers: string[], rows: string[][]) {
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.xlsx"`);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(title);
  ws.addRow(headers).font = { bold: true };
  for (const row of rows) ws.addRow(row);
  await wb.xlsx.write(res);
}

export async function currentStockReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const format = (req.query.format as string) || 'json';
    const data = await getCurrentStock();

    if (format === 'json') return sendJson(res, data as ReportData);

    const headers = ['SKU', 'Name', 'Category', 'Unit', 'Min Stock', 'Total Stock'];
    const rows = data.map((p: StockProduct) => [
      p.sku,
      p.name,
      p.category.name,
      p.unit,
      String(p.minStock),
      String(p.stockItems.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0)),
    ]);

    if (format === 'pdf') return sendPdf(res, 'Current Stock Report', headers, rows);
    if (format === 'excel') return sendExcel(res, 'Current Stock', headers, rows);

    res.status(400).json({ status: 400, error: 'Invalid format. Use json, pdf or excel.' });
  } catch (err) { next(err); }
}

export async function movementReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const format = (req.query.format as string) || 'json';
    const data = await getMovementByPeriod(req.query.dateFrom as string, req.query.dateTo as string);

    if (format === 'json') return sendJson(res, data as ReportData);

    const headers = ['Date', 'Product', 'SKU', 'Type', 'Qty', 'By'];
    const rows = data.map((m: Movement) => [
      m.createdAt.toISOString().split('T')[0],
      m.product.name,
      m.product.sku,
      m.type,
      String(m.quantity),
      m.createdBy.email,
    ]);

    if (format === 'pdf') return sendPdf(res, 'Stock Movement Report', headers, rows);
    if (format === 'excel') return sendExcel(res, 'Movements', headers, rows);

    res.status(400).json({ status: 400, error: 'Invalid format. Use json, pdf or excel.' });
  } catch (err) { next(err); }
}

export async function lowStockReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const format = (req.query.format as string) || 'json';
    const data = await getLowStockProducts();

    if (format === 'json') return sendJson(res, data as ReportData);

    const headers = ['SKU', 'Name', 'Category', 'Min Stock', 'Current Stock'];
    const rows = data.map((p: LowProduct) => [
      p.sku,
      p.name,
      p.category.name,
      String(p.minStock),
      String(p.stockItems.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0)),
    ]);

    if (format === 'pdf') return sendPdf(res, 'Low Stock Report', headers, rows);
    if (format === 'excel') return sendExcel(res, 'Low Stock', headers, rows);

    res.status(400).json({ status: 400, error: 'Invalid format. Use json, pdf or excel.' });
  } catch (err) { next(err); }
}
