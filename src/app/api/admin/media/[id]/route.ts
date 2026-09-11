import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import { requireActiveSubscription } from '@/lib/subscription';

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const blocked = await requireActiveSubscription();
  if (blocked) return blocked;

  const media = await prisma.media.findUnique({ where: { id: params.id } });
  if (!media) return NextResponse.json({ error: 'Media not found.' }, { status: 404 });

  await prisma.media.delete({ where: { id: params.id } });

  // Best-effort file cleanup — don't fail the request if the file is already gone.
  try {
    const filePath = path.join(process.cwd(), 'public', media.url);
    await fs.unlink(filePath);
  } catch {
    // ignore
  }

  return NextResponse.json({ ok: true });
}
