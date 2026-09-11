'use client';

import { useEffect, useState } from 'react';

type QRRecord = {
  id: string;
  publicUrl: string;
  qrImagePath: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  product: { id: string; name: string; sku: string | null };
  createdBy: { name: string; email: string } | null;
};

export default function QRHistoryPage() {
  const [records, setRecords] = useState<QRRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/qr')
      .then((r) => r.json())
      .then((d) => {
        setRecords(d.qrCodes || []);
        setLoading(false);
      });
  }, []);

  async function toggleStatus(rec: QRRecord) {
    const nextStatus = rec.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const res = await fetch(`/api/admin/qr/${rec.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    });
    if (res.ok) {
      setRecords((prev) => prev.map((r) => (r.id === rec.id ? { ...r, status: nextStatus } : r)));
    }
  }

  async function copyLink(url: string) {
    await navigator.clipboard.writeText(url);
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-asal">QR History</h1>
      <p className="mb-6 text-sm text-slate-500">Every QR code ever generated, across all products.</p>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading…</div>
        ) : records.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No QR codes generated yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">Product</th>
                <th className="px-4 py-2.5 font-medium">ID</th>
                <th className="px-4 py-2.5 font-medium">Generated</th>
                <th className="px-4 py-2.5 font-medium">By</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((rec) => (
                <tr key={rec.id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{rec.product.name}</td>
                  <td className="px-4 py-3 text-slate-500">#{rec.product.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(rec.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    <br />
                    <span className="text-xs text-slate-400">
                      {new Date(rec.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{rec.createdBy?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(rec)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        rec.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {rec.status}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button onClick={() => setPreviewUrl(rec.qrImagePath)} className="text-asal hover:underline">View</button>
                      <button onClick={() => copyLink(rec.publicUrl)} className="text-asal hover:underline">Copy</button>
                      <a href={rec.qrImagePath} download className="text-asal hover:underline">Download</a>
                      <a href={`/admin/products/${rec.product.id}/lifecycle/qr`} className="text-asal hover:underline">Print</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPreviewUrl(null)}>
          <div className="rounded-xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <img src={previewUrl} alt="QR preview" className="h-72 w-72" />
            <button onClick={() => setPreviewUrl(null)} className="mt-4 w-full rounded-md border border-slate-300 py-1.5 text-sm hover:bg-slate-50">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
