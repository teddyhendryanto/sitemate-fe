import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { AuthResponse } from '../common/interfaces/auth.interface';

export const useCurrentUser = () => {
  const [user, setUser] = useState<AuthResponse | null>(null);

  useEffect(() => {
    const currentUser = Cookies.get('currentUser');
    if (currentUser) setUser(JSON.parse(currentUser));
  }, []);

  return user;
};
