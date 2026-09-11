import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function AdminDashboardPage() {
  const [productCount, qrCount, activeQrCount] = await Promise.all([
    prisma.product.count(),
    prisma.qRCode.count(),
    prisma.qRCode.count({ where: { status: 'ACTIVE' } })
  ]);

  const recentProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { _count: { select: { qrCodes: true } } }
  });

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-asal">Dashboard</h1>
      <p className="mb-6 text-sm text-slate-500">Overview of products and generated QR codes.</p>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Products" value={productCount} />
        <StatCard label="QR Codes Generated" value={qrCount} />
        <StatCard label="Active QR Codes" value={activeQrCount} />
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <Link href="/admin/products" className="rounded-md bg-asal px-4 py-2 text-sm text-white hover:bg-slate-800">
          Product Lifecycle
        </Link>
        <Link href="/admin/qr-history" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
          QR History
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Recently added products</h2>
        {recentProducts.length === 0 ? (
          <p className="text-sm text-slate-500">
            No products yet.{' '}
            <Link href="/admin/products" className="text-asal underline">
              Add your first product
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentProducts.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <Link href={`/admin/products/${p.id}/lifecycle`} className="font-medium text-slate-800 hover:text-asal">
                    {p.name}
                  </Link>
                  <span className="ml-2 text-slate-400">{p.category || 'Uncategorized'}</span>
                </div>
                <div className="text-slate-500">{p._count.qrCodes} QR{p._count.qrCodes === 1 ? '' : 's'}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="text-2xl font-semibold text-asal">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}
