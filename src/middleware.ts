import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Edge-safe re-implementation of session verification (middleware runs on the
// Edge runtime, so it can't import the full auth.ts which uses next/headers
// in a way that's fine in Node but we keep this self-contained and minimal).
async function isValidSession(token: string | undefined) {
  if (!token) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin');

  if (!isAdminPage && !isAdminApi) return NextResponse.next();

  const token = req.cookies.get('asal_admin_session')?.value;
  const valid = await isValidSession(token);

  if (!valid) {
    if (isAdminApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};
