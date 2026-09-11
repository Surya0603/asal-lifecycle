import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateQrPng } from '@/lib/qr';
import { getSession } from '@/lib/auth';
import { requireActiveSubscription } from '@/lib/subscription';

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('productId') || undefined;

  const qrCodes = await prisma.qRCode.findMany({
    where: productId ? { productId } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { id: true, name: true, sku: true } },
      createdBy: { select: { name: true, email: true } }
    }
  });

  return NextResponse.json({ qrCodes });
}

export async function POST(req: NextRequest) {
  const blocked = await requireActiveSubscription();
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  const productId = body?.productId;

  if (!productId) {
    return NextResponse.json({ error: 'productId is required.' }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });

  const session = await getSession();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
  const publicUrl = `${baseUrl}/p/${product.id}`;

  const size = Number(body?.size) || 512;
  const margin = Number(body?.margin) || 2;
  const fgColor = body?.fgColor || '#2E2E33';
  const bgColor = body?.bgColor || '#ffffff';

  let qrImagePath: string;
  try {
    qrImagePath = await generateQrPng({ url: publicUrl, size, margin, fgColor, bgColor });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to generate QR image.' }, { status: 500 });
  }

  const qrCode = await prisma.qRCode.create({
    data: {
      productId: product.id,
      publicUrl,
      qrImagePath,
      customTitle: body?.customTitle?.trim() || 'Complete Product Life Cycle',
      instructionText:
        body?.instructionText?.trim() || 'Scan the QR code to check the complete product life cycle',
      footerText: body?.footerText?.trim() || null,
      logoPath: body?.logoPath || null,
      fgColor,
      bgColor,
      size,
      margin,
      createdById: session?.adminId || null
    },
    include: {
      product: { select: { id: true, name: true, sku: true } }
    }
  });

  return NextResponse.json({ qrCode }, { status: 201 });
}
