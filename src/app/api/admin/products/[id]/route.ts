import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireActiveSubscription } from '@/lib/subscription';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      stages: { orderBy: { order: 'asc' }, include: { media: { orderBy: { createdAt: 'asc' } } } },
      qrCodes: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!product) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const blocked = await requireActiveSubscription();
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  const data: Record<string, unknown> = {};

  if (typeof body?.name === 'string') data.name = body.name.trim();
  if (typeof body?.category === 'string') data.category = body.category.trim();
  if (typeof body?.sku === 'string') data.sku = body.sku.trim();
  if (typeof body?.status === 'string') data.status = body.status.trim();

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
  }

  try {
    const product = await prisma.product.update({ where: { id: params.id }, data });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const blocked = await requireActiveSubscription();
  if (blocked) return blocked;

  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }
}
