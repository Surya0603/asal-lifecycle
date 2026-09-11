import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireActiveSubscription } from '@/lib/subscription';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const qrCode = await prisma.qRCode.findUnique({
    where: { id: params.id },
    include: { product: true }
  });
  if (!qrCode) return NextResponse.json({ error: 'QR not found.' }, { status: 404 });
  return NextResponse.json({ qrCode });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const blocked = await requireActiveSubscription();
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (body?.status !== 'ACTIVE' && body?.status !== 'INACTIVE') {
    return NextResponse.json({ error: 'status must be ACTIVE or INACTIVE.' }, { status: 400 });
  }

  try {
    const qrCode = await prisma.qRCode.update({
      where: { id: params.id },
      data: { status: body.status }
    });
    return NextResponse.json({ qrCode });
  } catch {
    return NextResponse.json({ error: 'QR not found.' }, { status: 404 });
  }
}
