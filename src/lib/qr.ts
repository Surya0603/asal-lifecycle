import QRCode from 'qrcode';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';

const QR_DIR = path.join(process.cwd(), 'public', 'uploads', 'qr');

export type QRGenOptions = {
  url: string;
  size: number;
  margin: number;
  fgColor: string;
  bgColor: string;
};

/**
 * Generates a QR PNG on disk and returns the public path (under /uploads/qr/...).
 * Kept deliberately free of decorative styling — the decorative A4 sheet is
 * composed separately client-side so it can never reduce QR scannability.
 */
export async function generateQrPng(opts: QRGenOptions): Promise<string> {
  await fs.mkdir(QR_DIR, { recursive: true });
  const fileName = `qr-${uuid()}.png`;
  const filePath = path.join(QR_DIR, fileName);

  await QRCode.toFile(filePath, opts.url, {
    width: opts.size,
    margin: opts.margin,
    color: {
      dark: opts.fgColor,
      light: opts.bgColor
    },
    errorCorrectionLevel: 'H' // highest error correction — keeps it scannable even with a center logo overlay
  });

  return `/uploads/qr/${fileName}`;
}
