import { use, useMemo, createContext, type PropsWithChildren } from 'react';
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
        const decoded = jwtDecode<AuthUser & { exp?: number }>(session);

        // sends user back to sign in if token expired
        if (decoded.exp && decoded.exp * 1000 < Date.now()) 
            return null;
        
        return decoded;
    } catch {
      return null;
    }
  }, [session]);

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
        signOut: async () => {
            try {
            await setStorageItemAsync('jwt_refresh_token', null);
            setSession(null);
            } catch (e) {
            console.error('Failed to clear session tokens', e);
            }
        },
        session,
        user,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
