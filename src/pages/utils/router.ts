import { ROUTE } from '../common/constant';

export const protectedRoutes = ['/', ROUTE.TICKET, `${ROUTE.TICKET}/[id]`];
export const authRoutes = ['/auth/login'];
export const publicRoutes = [];
