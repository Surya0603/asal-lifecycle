import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SUBSCRIPTION_AMOUNT_PAISE, SUBSCRIPTION_PERIOD_DAYS } from '@/lib/razorpay';
import { getOrCreateSubscription } from '@/lib/subscription';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body ?? {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ error: 'Razorpay is not configured on the server' }, { status: 500 });
  }

  // Verify the payment actually came from Razorpay and wasn't tampered with.
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 });
  }

  const sub = await getOrCreateSubscription(session.adminId);

  // Extend from whichever is later: now, or the existing period end (so
  // renewing early doesn't lose remaining paid days).
  const now = new Date();
  const base = sub.currentPeriodEnd && sub.currentPeriodEnd.getTime() > now.getTime() ? sub.currentPeriodEnd : now;
  const newPeriodEnd = new Date(base);
  newPeriodEnd.setDate(newPeriodEnd.getDate() + SUBSCRIPTION_PERIOD_DAYS);

  const updated = await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: 'ACTIVE',
      currentPeriodEnd: newPeriodEnd,
      lastPaymentId: razorpay_payment_id,
      lastOrderId: razorpay_order_id,
      history: {
        create: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          amountPaise: SUBSCRIPTION_AMOUNT_PAISE,
          status: 'PAID'
        }
      }
    }
  });

  return NextResponse.json({
    status: updated.status,
    currentPeriodEnd: updated.currentPeriodEnd
  });
}
