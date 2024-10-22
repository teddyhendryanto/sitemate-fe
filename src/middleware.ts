import moment from 'moment';
import { NextRequest, NextResponse } from 'next/server';
import { ROUTE } from './pages/common/constant';
import { authRoutes, protectedRoutes } from './pages/utils/router';

export function middleware(request: NextRequest) {
  let response = NextResponse.next();

  let referer = request.cookies.get('referer')?.value;
  const currentUser = request.cookies.get('currentUser')?.value;

  const {
    nextUrl: { search, pathname },
  } = request;

  const urlSearchParams = new URLSearchParams(search);
  const searchParams = Object.fromEntries(urlSearchParams.entries());

  const cookieExpires = moment().add(60, 'minute');

  Object.keys(searchParams).map((key) => {
    if (key === 'referer') {
      if (!referer) {
        referer = searchParams[key];
        response.cookies.set({
          name: 'referer',
          value: referer,
          expires: cookieExpires.toDate(),
        });
      }

      if (searchParams[key] !== referer) {
        request.cookies.delete('referer');
        response.cookies.set({
          name: 'referer',
          value: searchParams[key],
          expires: cookieExpires.toDate(),
        });
      }
    }
  });

  if (protectedRoutes.includes(pathname) && (!currentUser || moment().unix() > JSON.parse(currentUser).expiredAt)) {
    request.cookies.delete('currentUser');

    const url = ROUTE.LOGIN;
    const fullUrl = `${url}${search}`;

    response = NextResponse.redirect(new URL(fullUrl, request.url));
    response.cookies.delete('currentUser');
  }

  if (authRoutes.includes(pathname) && currentUser) {
    response = NextResponse.redirect(new URL(ROUTE.TICKET, request.url));
  }

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.*).*)',
  ],
};
