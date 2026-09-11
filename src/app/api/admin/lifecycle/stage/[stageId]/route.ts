import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireActiveSubscription } from '@/lib/subscription';

export async function PATCH(req: NextRequest, { params }: { params: { stageId: string } }) {
  const blocked = await requireActiveSubscription();
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  const data: Record<string, unknown> = {};

  if (typeof body?.date === 'string') {
    data.date = body.date ? new Date(body.date) : null;
  }
  if (typeof body?.time === 'string' || body?.time === null) data.time = body.time;
  if (typeof body?.location === 'string' || body?.location === null) data.location = body.location;
  if (typeof body?.description === 'string' || body?.description === null) data.description = body.description;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
  }

  try {
    const stage = await prisma.lifecycleStage.update({
      where: { id: params.stageId },
      data,
      include: { media: { orderBy: { createdAt: 'asc' } } }
    });
    return NextResponse.json({ stage });
  } catch {
    return NextResponse.json({ error: 'Stage not found.' }, { status: 404 });
  }
}
