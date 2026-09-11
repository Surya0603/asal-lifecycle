import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getOrCreateSubscription, toSubscriptionInfo } from '@/lib/subscription';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sub = await getOrCreateSubscription(session.adminId);
  return NextResponse.json(toSubscriptionInfo(sub));
}
