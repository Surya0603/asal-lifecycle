import Link from 'next/link';

export default function SubscriptionBanner({
  daysRemaining,
  isTrial
}: {
  daysRemaining: number | null;
  isTrial: boolean;
}) {
  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-sm">
        <p className="text-amber-800">
          <span className="mr-1.5">⚠</span>
          {isTrial ? (
            <>Payment required — your ASAL free trial has ended.</>
          ) : (
            <>Payment required — your ASAL subscription payment is overdue.</>
          )}{' '}
          Renew your subscription to continue managing your products and lifecycle.
        </p>
        <Link
          href="/admin/subscription"
          className="whitespace-nowrap rounded-md bg-asal px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-asal-hover"
        >
          Pay ₹399
        </Link>
      </div>
    </div>
  );
}
