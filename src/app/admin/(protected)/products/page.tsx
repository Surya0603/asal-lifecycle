'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

type Product = {
  id: string;
  name: string;
  category: string | null;
  status: string;
  sku: string | null;
  _count: { qrCodes: number };
};

const STATUS_OPTIONS = ['In Progress', 'Completed', 'On Hold'];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async (query: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/products${query ? `?q=${encodeURIComponent(query)}` : ''}`);
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(q), 250);
    return () => clearTimeout(t);
  }, [q, load]);

  async function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(
      `Delete "${name}"? This will also delete its lifecycle stages, media, and QR codes. This cannot be undone.`
    );
    if (!confirmed) return;

    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert('Failed to delete product.');
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleStatusChange(id: string, newStatus: string) {
    const prevProducts = products;
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));

    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (!res.ok) {
      alert('Failed to update status.');
      setProducts(prevProducts);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-asal">Product Lifecycle</h1>
          <p className="text-sm text-slate-500">Select a product to manage its refurbishment lifecycle and QR code.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-md bg-asal px-4 py-2 text-sm text-white hover:bg-slate-800"
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <NewProductForm
          onCreated={(p) => {
            setShowForm(false);
            setProducts((prev) => [{ ...p, _count: { qrCodes: 0 } }, ...prev]);
          }}
        />
      )}

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products by name, SKU, or category…"
        className="mb-4 w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-asal"
      />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading…</div>
        ) : products.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            No products found. {q ? 'Try a different search.' : 'Add your first product to get started.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">Product</th>
                <th className="px-4 py-2.5 font-medium">Category</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">QR Codes</th>
                <th className="px-4 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.sku ? `SKU: ${p.sku}` : p.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.category || '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={p.status}
                      onChange={(e) => handleStatusChange(p.id, e.target.value)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-asal"
                    >
                      {!STATUS_OPTIONS.includes(p.status) && (
                        <option value={p.status}>{p.status}</option>
                      )}
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p._count.qrCodes}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/products/${p.id}/lifecycle`} className="text-asal font-medium hover:underline">
                        Open Lifecycle →
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="text-red-600 font-medium hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function NewProductForm({ onCreated }: { onCreated: (p: any) => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, sku })
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || 'Failed to create product.');
      return;
    }
    onCreated(data.product);
    setName('');
    setCategory('');
    setSku('');
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Product Name *</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-56 rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Samsung Washing Machine"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Category</label>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Appliances"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">SKU</label>
        <input
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          className="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Optional"
        />
      </div>
      <button type="submit" disabled={saving} className="rounded-md bg-asal px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60">
        {saving ? 'Saving…' : 'Create'}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}