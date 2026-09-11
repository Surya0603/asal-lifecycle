import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const TRIAL_DAYS = 39;

export type SubscriptionInfo = {
  status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE';
  currentPeriodEnd: Date | null;
  isActive: boolean; // true if the admin currently has access (trial or paid)
  daysRemaining: number | null;
  amountPaise: number;
};

/**
 * Returns the current admin's subscription, creating a fresh TRIALING
 * record (7-day trial from first login) the first time this is called for
 * a given admin, so a brand-new install isn't immediately locked out.
 */
export async function getOrCreateSubscription(adminId: string) {
  let sub = await prisma.subscription.findUnique({ where: { adminId } });

  if (!sub) {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
    sub = await prisma.subscription.create({
      data: {
        adminId,
        status: 'TRIALING',
        currentPeriodEnd: trialEnd
      }
    });
  }

  return sub;
}

export function toSubscriptionInfo(sub: {
  status: string;
  currentPeriodEnd: Date | null;
  amountPaise: number;
}): SubscriptionInfo {
  const now = new Date();
  const isActive = !!sub.currentPeriodEnd && sub.currentPeriodEnd.getTime() > now.getTime();

  let daysRemaining: number | null = null;
  if (sub.currentPeriodEnd) {
    daysRemaining = Math.ceil((sub.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  return {
    status: (isActive ? sub.status : 'PAST_DUE') as SubscriptionInfo['status'],
    currentPeriodEnd: sub.currentPeriodEnd,
    isActive,
    daysRemaining,
    amountPaise: sub.amountPaise
  };
}

/**
 * Guard for mutating admin API routes (POST/PATCH/DELETE). Returns null if
 * the caller is allowed to proceed, or a NextResponse (402 Payment
 * Required) to return immediately if the subscription has lapsed.
 *
 * Usage at the top of a route handler:
 *   const blocked = await requireActiveSubscription();
 *   if (blocked) return blocked;
 */
export async function requireActiveSubscription(): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session) {
    // Middleware already handles unauthenticated requests, but guard anyway.
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sub = await getOrCreateSubscription(session.adminId);
  const info = toSubscriptionInfo(sub);

  if (!info.isActive) {
    return NextResponse.json(
      {
        error: 'SUBSCRIPTION_REQUIRED',
        message: 'Your ASAL subscription payment is overdue. Renew to continue managing products and lifecycle.'
      },
      { status: 402 }
    );
  }

  return null;
}
