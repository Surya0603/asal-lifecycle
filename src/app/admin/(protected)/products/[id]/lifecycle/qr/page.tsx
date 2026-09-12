'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import jsPDF from 'jspdf';
import QRSheet, { QRSheetData } from '@/components/admin/QRSheet';

type Product = { id: string; name: string; sku: string | null };

type GeneratedQR = {
  id: string;
  publicUrl: string;
  qrImagePath: string;
  customTitle: string;
  instructionText: string;
  footerText: string | null;
};

export default function QRCustomizePage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);

  const [title, setTitle] = useState('Complete Product Life Cycle');
  const [instructionText, setInstructionText] = useState('Scan the QR code to check the complete product life cycle');
  const [footerText, setFooterText] = useState('');
  const [size, setSize] = useState(512);
  const [margin, setMargin] = useState(2);
  const [fgColor, setFgColor] = useState('#2E2E33');
  const [bgColor, setBgColor] = useState('#ffffff');

  const [generated, setGenerated] = useState<GeneratedQR | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((r) => r.json())
      .then((d) => setProduct(d.product));
  }, [id]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    const res = await fetch('/api/admin/qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: id,
        customTitle: title,
        instructionText,
        footerText,
        size,
        margin,
        fgColor,
        bgColor
      })
    });
    const data = await res.json();
    setGenerating(false);
    if (!res.ok) {
      setError(data.error || 'Failed to generate QR.');
      return;
    }
    setGenerated(data.qrCode);
  }

  function handlePrint() {
    window.print();
  }

  async function handleCopyLink() {
    if (!generated) return;
    await navigator.clipboard.writeText(generated.publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleDownloadPdf() {
    if (!generated) return;
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });

    const logoImg = await loadImage('/asal-logo.png');
    const qrImg = await loadImage(generated.qrImagePath);

    const pageWidth = 210;
    let y = 25;

    pdf.addImage(logoImg, 'PNG', pageWidth / 2 - 20, y, 40, 12);
    y += 26;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text(generated.customTitle.toUpperCase(), pageWidth / 2, y, { align: 'center' });
    y += 12;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text(product?.name || '', pageWidth / 2, y, { align: 'center' });
    y += 6;
    pdf.text(`Product ID: ${id.slice(0, 8).toUpperCase()}`, pageWidth / 2, y, { align: 'center' });
    y += 15;

    const qrSize = 80;
    pdf.addImage(qrImg, 'PNG', pageWidth / 2 - qrSize / 2, y, qrSize, qrSize);
    y += qrSize + 10;

    pdf.setFontSize(10);
    pdf.text(generated.instructionText, pageWidth / 2, y, { align: 'center', maxWidth: 140 });
    y += 20;

    pdf.setFont('helvetica', 'bold');
    pdf.text('ASAL ENTERPRISES', pageWidth / 2, 280, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const contact = process.env.NEXT_PUBLIC_ASAL_CONTACT_PHONE || '';
    const insta = process.env.NEXT_PUBLIC_ASAL_INSTAGRAM || '';
    pdf.text([insta, contact].filter(Boolean).join('  ·  '), pageWidth / 2, 286, { align: 'center' });

    pdf.save(`qr-${product?.name?.replace(/\s+/g, '-').toLowerCase() || id}.pdf`);
  }

  const sheetData: QRSheetData | null = generated
    ? {
        logoUrl: '/asal-logo.png',
        title: generated.customTitle,
        productName: product?.name || '',
        productIdShort: `#${id.slice(0, 8).toUpperCase()}`,
        instructionText: generated.instructionText,
        footerText: generated.footerText || '',
        qrImageUrl: generated.qrImagePath,
        contactPhone: process.env.NEXT_PUBLIC_ASAL_CONTACT_PHONE,
        instagram: process.env.NEXT_PUBLIC_ASAL_INSTAGRAM
      }
    : null;

  return (
    <div>
      <div className="no-print mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-asal">QR Customization</h1>
          <p className="text-sm text-slate-500">{product?.name}</p>
        </div>
        <Link href={`/admin/products/${id}/lifecycle`} className="text-sm text-slate-500 hover:underline">
          ← Back to Lifecycle
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_1fr]">
        <div className="no-print space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <Field label="Title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </Field>
          <Field label="Instruction text">
            <textarea value={instructionText} onChange={(e) => setInstructionText(e.target.value)} rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </Field>
          <Field label="Footer text (optional)">
            <input value={footerText} onChange={(e) => setFooterText(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="e.g. Warranty terms apply" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="QR Size (px)">
              <input type="number" min={256} max={1024} step={64} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </Field>
            <Field label="Margin">
              <input type="number" min={0} max={6} value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Foreground">
              <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="h-9 w-full rounded-md border border-slate-300" />
            </Field>
            <Field label="Background">
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-9 w-full rounded-md border border-slate-300" />
            </Field>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button onClick={handleGenerate} disabled={generating} className="w-full rounded-md bg-asal py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60">
            {generating ? 'Generating…' : generated ? 'Regenerate QR' : 'Generate QR'}
          </button>

          {generated && (
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-green-600">QR code generated successfully.</p>
              <div className="flex flex-wrap gap-2">
                <a href={generated.qrImagePath} download className="rounded-md border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50">Download PNG</a>
                <button onClick={handleDownloadPdf} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50">Download PDF (A4)</button>
                <button onClick={handlePrint} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50">Print</button>
                <button onClick={handleCopyLink} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50">
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
              <p className="break-all text-xs text-slate-400">{generated.publicUrl}</p>
              <Link href="/admin/qr-history" className="inline-block text-xs text-asal underline">View in QR History →</Link>
            </div>
          )}
        </div>

        <div ref={sheetRef} className="flex justify-center bg-slate-100 p-6 print:bg-white print:p-0">
          {sheetData ? (
            <QRSheet data={sheetData} />
          ) : (
            <div className="flex min-h-[500px] items-center justify-center border border-dashed border-slate-300 bg-white text-sm text-slate-400">
              Generate a QR to see the A4 print preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}