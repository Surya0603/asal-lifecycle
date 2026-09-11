import QRCode from 'qrcode';
import { put } from '@vercel/blob';
import { v4 as uuid } from 'uuid';

export type QRGenOptions = {
  url: string;
  size: number;
  margin: number;
  fgColor: string;
  bgColor: string;
};

/**
 * Generates a QR PNG in memory and uploads it to Vercel Blob storage,
 * returning the public Blob URL. Kept deliberately free of decorative
 * styling — the decorative A4 sheet is composed separately client-side
 * so it can never reduce QR scannability.
 */
export async function generateQrPng(opts: QRGenOptions): Promise<string> {
  const buffer = await QRCode.toBuffer(opts.url, {
    width: opts.size,
    margin: opts.margin,
    color: {
      dark: opts.fgColor,
      light: opts.bgColor
    },
    errorCorrectionLevel: 'H'
  });

  const fileName = `qr/qr-${uuid()}.png`;

  const blob = await put(fileName, buffer, {
    access: 'public',
    contentType: 'image/png'
  });

  return blob.url;
}