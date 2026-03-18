import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth((request) => {
  const isSignedIn = !!request.auth;
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isSignInRoute = request.nextUrl.pathname === '/sign-in';

  if (!isSignedIn && isDashboardRoute) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isSignedIn && isSignInRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in']
};
