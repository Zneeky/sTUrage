import nodemailer from 'nodemailer';
import logger from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendLowStockEmail(
  productName: string,
  currentStock: number,
  threshold: number
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    logger.warn('ADMIN_EMAIL not set — skipping low stock email');
    return;
  }

  await transporter.sendMail({
    from: `"STURage Alerts" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `Low Stock Alert: ${productName}`,
    text: `Product "${productName}" has dropped to ${currentStock} unit(s), below the threshold of ${threshold}.`,
    html: `<p>Product <strong>${productName}</strong> has dropped to <strong>${currentStock}</strong> unit(s), below the threshold of ${threshold}.</p>`,
  });
}
