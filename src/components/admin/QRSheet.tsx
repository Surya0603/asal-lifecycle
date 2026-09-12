'use client';

export type QRSheetData = {
  logoUrl: string;
  title: string;
  productName: string;
  productIdShort: string;
  instructionText: string;
  footerText: string;
  qrImageUrl: string;
  contactPhone?: string;
  instagram?: string;
};

export default function QRSheet({ data }: { data: QRSheetData }) {
  return (
    <div className="print-a4 mx-auto flex flex-col items-center justify-between border border-slate-200 bg-white px-12 py-14 shadow-sm">
      <div className="flex w-full flex-col items-center text-center">
        <img src={data.logoUrl} alt="ASAL" className="h-12 w-auto" />
        <h1 className="mt-6 text-2xl font-bold uppercase tracking-wide text-asal">{data.title}</h1>

        <div className="mt-6 text-sm text-slate-600">
          <p className="font-medium text-slate-800">{data.productName}</p>
          <p>Product ID: {data.productIdShort}</p>
        </div>
      </div>

      <div className="my-10 flex flex-col items-center">
        <div className="rounded-lg border-4 border-asal p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.qrImageUrl} alt="Product QR Code" className="h-64 w-64" />
        </div>
        <p className="mt-4 max-w-xs text-center text-sm text-slate-600">{data.instructionText}</p>
      </div>

      <div className="flex w-full flex-col items-center border-t border-slate-200 pt-5 text-center text-xs text-slate-500">
        <p className="text-sm font-semibold tracking-wide text-asal">ASAL ENTERPRISES</p>
        {data.instagram && <p>{data.instagram}</p>}
        {data.contactPhone && <p>{data.contactPhone}</p>}
        {data.footerText && <p className="mt-1">{data.footerText}</p>}
      </div>
    </div>
  );
}
