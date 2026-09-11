'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

type SubscriptionInfo = {
  status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE';
  currentPeriodEnd: string | null;
  isActive: boolean;
  daysRemaining: number | null;
  amountPaise: number;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionPage() {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  async function loadStatus() {
    const res = await fetch('/api/admin/subscription/status');
    if (res.ok) setInfo(await res.json());
  }

  useEffect(() => {
    loadStatus();
  }, []);

  async function handlePay() {
    setError(null);
    setLoading(true);
    try {
      const orderRes = await fetch('/api/admin/subscription/create-order', { method: 'POST' });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error || 'Could not start payment');

      if (!scriptReady || !window.Razorpay) {
        throw new Error('Payment widget is still loading — try again in a moment.');
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'ASAL Enterprises',
        description: 'Monthly subscription — ₹399',
        image: '/asal-logo.png',
        theme: { color: '#00A651' },
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/admin/subscription/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
          });
          if (verifyRes.ok) {
            await loadStatus();
          } else {
            const data = await verifyRes.json();
            setError(data.error || 'Payment verification failed');
          }
          setLoading(false);
        },
        modal: {
          ondismiss: () => setLoading(false)
        }
      });

      rzp.on('payment.failed', () => {
        setError('Payment failed — please try again.');
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setScriptReady(true)} />

      <h1 className="mb-1 text-xl font-semibold text-asal">Subscription</h1>
      <p className="mb-6 text-sm text-slate-500">Manage your ASAL Enterprise monthly subscription.</p>

      <div className="max-w-lg rounded-xl border border-slate-200 bg-white p-6">
        {!info ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Status</span>
              <StatusPill status={info.status} />
            </div>

            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                {info.isActive ? 'Renews on' : 'Expired on'}
              </span>
              <span className="text-sm text-slate-800">
                {info.currentPeriodEnd
                  ? new Date(info.currentPeriodEnd).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })
                  : '—'}
              </span>
            </div>

            {info.isActive && info.daysRemaining !== null && (
              <p className="mb-4 text-xs text-slate-400">{info.daysRemaining} day(s) remaining</p>
            )}

            {!info.isActive && (
              <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                ⚠ Renew your subscription to continue managing your products and lifecycle.
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full rounded-md bg-asal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-asal-hover disabled:opacity-60"
            >
              {loading ? 'Processing…' : 'Pay ₹399'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: SubscriptionInfo['status'] }) {
  const styles: Record<SubscriptionInfo['status'], string> = {
    ACTIVE: 'bg-asal-light text-asal-hover',
    TRIALING: 'bg-slate-100 text-slate-600',
    PAST_DUE: 'bg-amber-50 text-amber-700'
  };
  const labels: Record<SubscriptionInfo['status'], string> = {
    ACTIVE: '✓ Active',
    TRIALING: 'Free trial',
    PAST_DUE: '⚠ Payment overdue'
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
}
