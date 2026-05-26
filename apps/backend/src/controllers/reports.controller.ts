import { Response, NextFunction } from 'express';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { AuthRequest } from '../middleware/auth';
import { getCurrentStock, getMovementByPeriod, getLowStockProducts } from '../services/report.service';

type ReportData = Record<string, unknown>[];
type StockProduct = Awaited<ReturnType<typeof getCurrentStock>>['data'][number];
type Movement = Awaited<ReturnType<typeof getMovementByPeriod>>[number];
type LowProduct = Awaited<ReturnType<typeof getLowStockProducts>>[number];

function sendJson(res: Response, data: ReportData) {
  res.json({ data });
}

const PDF_LINE_HEIGHT = 18;
const PDF_MARGIN = 40;

async function sendPdf(res: Response, title: string, headers: string[], rows: string[][]) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`);

  const doc = new PDFDocument({ margin: PDF_MARGIN, size: 'A4' });
  doc.pipe(res);

  doc.fontSize(16).text(title, { align: 'center' });
  doc.fontSize(10).text(`Generated: ${new Date().toISOString()}`, { align: 'center' });
  doc.moveDown();

  const colWidth = (doc.page.width - PDF_MARGIN * 2) / headers.length;
  let y = doc.y;

  // Header row
  doc.font('Helvetica-Bold');
  headers.forEach((h, i) => doc.text(h, PDF_MARGIN + i * colWidth, y, { width: colWidth - 4, lineBreak: false }));
  y += PDF_LINE_HEIGHT;
  doc.moveTo(PDF_MARGIN, y - 4).lineTo(doc.page.width - PDF_MARGIN, y - 4).stroke();

  doc.font('Helvetica');
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    for (const row of chunk) {
      if (y > doc.page.height - 60) { doc.addPage(); y = PDF_MARGIN; }
      row.forEach((cell, ci) => doc.text(cell, PDF_MARGIN + ci * colWidth, y, { width: colWidth - 4, lineBreak: false }));
      y += PDF_LINE_HEIGHT;
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

    if (format === 'json') {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
      const result = await getCurrentStock(page, limit);
      return res.json({ data: result.data, total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages });
    }

    // PDF / Excel — fetch all
    const result = await getCurrentStock(1, 10_000);
    const headers = ['SKU', 'Name', 'Category', 'Unit', 'Min Stock', 'Total Stock'];
    const rows = result.data.map((p: StockProduct) => [
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
