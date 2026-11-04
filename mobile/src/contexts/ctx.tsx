import { use, useMemo, createContext, type PropsWithChildren, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useStorageState, setStorageItemAsync } from '../hooks/useStorageState'

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
}


const AuthContext = createContext<{
  signIn:  (token: string, refreshToken?: string) => Promise<void>;
  signOut: () =>  Promise<void>;
  session?: string | null; // access token
  user: AuthUser | null; // extracted profile from the token
  isLoading: boolean;
} | null>(null);

// Use this hook to access the user info.
export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
    const [[isLoading, session], setSession] = useStorageState('session');
    // Derive the profile from the stored token so it survives app restarts.
    const user = useMemo<AuthUser | null>(() => {
        if (!session) return null;
        try {
            return jwtDecode<AuthUser & { exp?: number }>(session);
        } catch {
        return null;
        }
    }, [session]);

    const signOut = useCallback(async () => {
        try {
            await setStorageItemAsync('jwt_refresh_token', null);
            setSession(null);
        } catch (e) {
            console.error('Failed to clear session tokens', e);
        }
    }, [setSession]);

    // signs the user out the moment the token expires, whether that's
    // before the app opened or while it's open
    useEffect(() => {
        if (!session) return;
        let exp: number | undefined;
        try {
            exp = jwtDecode<{ exp?: number }>(session).exp;
        } catch {
            return;
        }
        if (!exp) return;

        const msLeft = exp * 1000 - Date.now();
        if (msLeft <= 0) {
            signOut();
            return;
        }
        const timer = setTimeout(signOut, msLeft);
        return () => clearTimeout(timer);   // new token or sign-out: cancel the old timer
    }, [session, signOut]);

  return (
    <AuthContext.Provider
      value={{
        signIn: async (token: string, refreshToken?: string) => {
            try {
            if (refreshToken) {
                await setStorageItemAsync('jwt_refresh_token', refreshToken);
            }
            // setSession also persists the access token under the 'session' key.
            setSession(token);
            } catch (e) {
            console.error('Failed to save session tokens', e);
            }
        },
        signOut: signOut,
        session,
        user,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
