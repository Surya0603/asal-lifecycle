import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getRazorpayClient, SUBSCRIPTION_AMOUNT_PAISE } from '@/lib/razorpay';

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let razorpay;
  try {
    razorpay = getRazorpayClient();
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }

  try {
    const order = await razorpay.orders.create({
      amount: SUBSCRIPTION_AMOUNT_PAISE,
      currency: 'INR',
      receipt: `asal_sub_${session.adminId}_${Date.now()}`,
      notes: { adminId: session.adminId, purpose: 'ASAL monthly subscription' }
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('Razorpay order creation failed', err);
    return NextResponse.json({ error: 'Could not create payment order' }, { status: 500 });
  }
}
