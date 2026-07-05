import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/privacidade'];

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (
    PUBLIC_PATHS.includes(path) ||
    path.startsWith('/live/') ||
    path.startsWith('/payment/') ||
    path.startsWith('/_next') ||
    path.startsWith('/imagens') ||
    path === '/logo.png' ||
    path === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get('access_token')?.value;
  if (!cookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|imagens/).*)'],
};
