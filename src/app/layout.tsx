import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ASAL — Product Lifecycle',
  description: 'ASAL product refurbishment lifecycle tracking'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased text-slate-900">{children}</body>
    </html>
  );
}
