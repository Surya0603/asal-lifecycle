import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Intentionally public — no session check. Only returns data that is safe
// for an unauthenticated visitor: product info + lifecycle stages + media.
// No admin controls, tokens, or internal fields are included.
export async function GET(_req: NextRequest, { params }: { params: { productId: string } }) {
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
          order: true,
          date: true,
          time: true,
          location: true,
          description: true,
          media: {
            orderBy: { createdAt: 'asc' },
            select: { id: true, type: true, url: true, thumbnail: true }
          }
        }
      }
    }
  });

  if (!product) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  return NextResponse.json({ product });
}
