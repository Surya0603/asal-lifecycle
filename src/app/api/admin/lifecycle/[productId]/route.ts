import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { productId: string } }) {
  const stages = await prisma.lifecycleStage.findMany({
    where: { productId: params.productId },
    orderBy: { order: 'asc' },
    include: { media: { orderBy: { createdAt: 'asc' } } }
  });

  return NextResponse.json({ stages });
}
