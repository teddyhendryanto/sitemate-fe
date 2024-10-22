import Cookies from 'js-cookie';
import { AuthResponse } from '../common/interfaces/auth.interface';

export const useLogin = (auth?: AuthResponse | null) => {
  if (auth) {
    Cookies.set('currentUser', JSON.stringify(auth));

    return auth;
  }
};
