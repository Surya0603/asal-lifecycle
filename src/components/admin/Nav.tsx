'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/products', label: 'Product Lifecycle' },
  { href: '/admin/qr-history', label: 'QR History' },
  { href: '/admin/subscription', label: 'Subscription' }
];

export default function AdminNav({ adminName }: { adminName?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <Link href="/admin" className="flex items-center gap-2">
            <img src="/asal-logo.png" alt="ASAL" className="h-7 w-auto" />
          </Link>
          <nav className="hidden gap-5 text-sm font-medium text-slate-600 sm:flex">
            {links.map((link, i) => (
              <Link
                key={`${link.href}-${i}`}
                href={link.href}
                className={
                  pathname === link.href || (link.href !== '/admin' && pathname?.startsWith(link.href))
                    ? 'text-asal'
                    : 'hover:text-asal transition'
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {adminName && <span className="hidden text-sm text-slate-500 sm:inline">{adminName}</span>}
          <button
            onClick={handleLogout}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
