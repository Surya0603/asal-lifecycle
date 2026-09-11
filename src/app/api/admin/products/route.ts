import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { STAGE_ORDER } from '@/lib/stages';
import { requireActiveSubscription } from '@/lib/subscription';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();

  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { sku: { contains: q } },
            { category: { contains: q } }
          ]
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { qrCodes: true } }
    }
  });

  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const blocked = await requireActiveSubscription();
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  const category = body?.category?.trim() || null;
  const sku = body?.sku?.trim() || null;
  const status = body?.status?.trim() || 'In Progress';

  if (!name) {
    return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name,
      category,
      sku,
      status,
      // Every product gets all six lifecycle stages created up front, empty,
      // so the timeline always has a fixed structure the admin fills in.
      stages: {
        create: STAGE_ORDER.map((stage, index) => ({
          stage,
          order: index
        }))
      }
    }
  });

  return NextResponse.json({ product }, { status: 201 });
}
