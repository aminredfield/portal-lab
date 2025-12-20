import create from 'zustand';

export type UserRole = 'admin' | 'manager' | 'viewer' | null;

interface AuthState {
  token: string | null;
  email: string | null;
  role: UserRole;
  exp: number | null;
  initialized: boolean;
  login: (payload: { token: string; role: UserRole; exp: number; email: string }) => void;
  logout: () => void;
  hydrate: () => void;
}

// Zustand store to keep track of authentication state. Token, role and
// expiration are persisted in localStorage so that reloading the page does not
// immediately log the user out. The hydrate method should be called once in
// the root layout to restore the persisted state.
const useAuth = create<AuthState>((set, get) => ({
  token: null,
  email: null,
  role: null,
  exp: null,
  initialized: false,
  login: ({ token, role, exp, email }) => {
    // Persist values in localStorage and in a cookie for server middleware.
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('email', email);
      localStorage.setItem('role', role ?? '');
      localStorage.setItem('exp', String(exp));
      // Set a cookie so Next.js middleware can read the token. Cookie will expire
      // when the token expires. The cookie is HTTP only by default in the
      // browser so we must set it manually on the client (not secure, but
      // acceptable for a demo). For a production system you would set
      // Secure, HttpOnly and SameSite flags server‑side.
      const expires = new Date(exp * 1000).toUTCString();
      document.cookie = `token=${token}; path=/; expires=${expires}`;
    }
    set({ token, role, exp, email });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      localStorage.removeItem('exp');
      // Clear cookie by setting an expired date
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    set({ token: null, role: null, exp: null, email: null });
  },
  hydrate: () => {
    if (get().initialized || typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const role = (localStorage.getItem('role') as UserRole) ?? null;
    const expStr = localStorage.getItem('exp');
    const exp = expStr ? parseInt(expStr, 10) : null;
    set({ token, email, role, exp, initialized: true });
  }
}));

export default useAuth;