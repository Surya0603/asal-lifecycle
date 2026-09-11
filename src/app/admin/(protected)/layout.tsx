import { getSession } from '@/lib/auth';
import AdminNav from '@/components/admin/Nav';
import SubscriptionBanner from '@/components/admin/SubscriptionBanner';
import { getOrCreateSubscription, toSubscriptionInfo } from '@/lib/subscription';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const subInfo = session ? toSubscriptionInfo(await getOrCreateSubscription(session.adminId)) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav adminName={session?.name} />
      {subInfo && !subInfo.isActive && (
        <SubscriptionBanner daysRemaining={subInfo.daysRemaining} isTrial={subInfo.status !== 'PAST_DUE'} />
      )}
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
