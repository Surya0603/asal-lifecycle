'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Timeline from '@/components/admin/Timeline';
import { StageData } from '@/components/admin/StageCard';

type Product = {
  id: string;
  name: string;
  category: string | null;
  status: string;
  sku: string | null;
};

export default function ProductLifecyclePage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [stages, setStages] = useState<StageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/products/${id}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setProduct(data.product);
      setStages(data.product.stages);
      setLoading(false);
    }
    load();
  }, [id]);

  function handleStageSaved(updated: StageData) {
    setStages((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (!product) return <p className="text-sm text-red-600">Product not found.</p>;

  return (
    <div>
      {/* Header: product info top-left, ASAL logo top-right */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Product Lifecycle</p>
          <h1 className="text-xl font-semibold text-asal">{product.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Product ID: #{product.id.slice(0, 8).toUpperCase()} · {product.category || 'Uncategorized'} · Status: {product.status}
          </p>
          <div className="mt-3 flex gap-2">
            <Link href="/admin/products" className="text-xs text-slate-500 hover:underline">
              ← Back to Products
            </Link>
          </div>
        </div>
        <img src="/asal-logo.png" alt="ASAL" className="h-9 w-auto" />
      </div>

      <Timeline stages={stages} onStageSaved={handleStageSaved} />

      {/* Generate QR CTA */}
      <div className="mt-4 rounded-xl border border-dashed border-asal-accent bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-asal">Generate Product QR</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
          Create a QR code for this product lifecycle. Anyone who scans it will see this timeline — no login required.
        </p>
        <Link
          href={`/admin/products/${product.id}/lifecycle/qr`}
          className="mt-4 inline-block rounded-md bg-asal px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Generate QR
        </Link>
      </div>
    </div>
  );
}
