import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PublicTimeline from '@/components/public/PublicTimeline';

export const dynamic = 'force-dynamic'; // always reflect the latest lifecycle data, never a stale cached snapshot

export default async function PublicLifecyclePage({ params }: { params: { productId: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.productId },
    select: {
      id: true,
      name: true,
      category: true,
      status: true,
      sku: true,
      stages: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          stage: true,
          date: true,
          time: true,
          location: true,
          description: true,
          media: { orderBy: { createdAt: 'asc' }, select: { id: true, type: true, url: true } }
        }
      }
    }
  });

  if (!product) notFound();

  const contact = process.env.NEXT_PUBLIC_ASAL_CONTACT_PHONE;
  const instagram = process.env.NEXT_PUBLIC_ASAL_INSTAGRAM;

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <img src="/asal-logo.png" alt="ASAL" className="h-8 w-auto" />
          {contact && <span className="text-xs text-slate-500">{contact}</span>}
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pt-6">
        {/* Product info */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Complete Product Life Cycle</p>
          <h1 className="text-lg font-semibold text-asal">{product.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Product ID: #{product.id.slice(0, 8).toUpperCase()}
            {product.category ? ` · ${product.category}` : ''} · {product.status}
          </p>
        </div>

        <PublicTimeline stages={product.stages as any} />

        {/* End of timeline */}
        <div className="mt-4 flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white py-8 text-center">
          <p className="text-lg font-bold tracking-wide text-asal">ASAL</p>
          {instagram && <p className="text-sm text-slate-500">{instagram}</p>}
          {contact && <p className="text-sm text-slate-500">{contact}</p>}
        </div>
      </div>
    </main>
  );
}
