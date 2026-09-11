import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveMediaFile, MediaValidationError } from '@/lib/media';
import { requireActiveSubscription } from '@/lib/subscription';

export async function POST(req: NextRequest) {
  const blocked = await requireActiveSubscription();
  if (blocked) return blocked;

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 });

  const stageId = form.get('stageId');
  const file = form.get('file');

  if (typeof stageId !== 'string' || !stageId) {
    return NextResponse.json({ error: 'stageId is required.' }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file is required.' }, { status: 400 });
  }

  const stage = await prisma.lifecycleStage.findUnique({ where: { id: stageId } });
  if (!stage) return NextResponse.json({ error: 'Lifecycle stage not found.' }, { status: 404 });

  try {
    const saved = await saveMediaFile(file);
    const media = await prisma.media.create({
      data: {
        stageId,
        type: saved.type,
        url: saved.url,
        fileName: saved.fileName,
        fileSize: saved.fileSize
      }
    });
    return NextResponse.json({ media }, { status: 201 });
  } catch (err) {
    if (err instanceof MediaValidationError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }
}
