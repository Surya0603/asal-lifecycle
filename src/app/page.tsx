import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <img src="/asal-logo.png" alt="ASAL" className="h-14 w-auto" />
      <h1 className="text-2xl font-semibold text-asal">ASAL Refurbishment Lifecycle</h1>
      <p className="max-w-md text-slate-600">
        Track every stage of a product&apos;s refurbishment journey and share it with customers via QR code.
      </p>
      <Link
        href="/admin/login"
        className="mt-2 rounded-md bg-asal px-5 py-2.5 text-white transition hover:bg-slate-800"
      >
        Admin Login
      </Link>
    </main>
  );
}
