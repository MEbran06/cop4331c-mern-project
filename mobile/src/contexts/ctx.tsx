import { use, useMemo, createContext, type PropsWithChildren } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useStorageState, setStorageItemAsync } from '../hooks/useStorageState'

export interface UserProfile {
  id: string;
  username: string;
  role?: string;
}


const AuthContext = createContext<{
  signIn:  (token: string, refreshToken?: string) => Promise<void>;
  signOut: () =>  Promise<void>;
  session?: string | null; // access token
  user: UserProfile | null; // extracted profile from the token
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
  const user = useMemo<UserProfile | null>(() => {
    if (!session) return null;
    try {
      return jwtDecode<UserProfile>(session);
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
