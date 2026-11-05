import { useSession } from "@/contexts/ctx";
import { useMemo } from "react";
import {createApi} from "@events/api";


export function useApi() {
    const { session, signOut } = useSession();
    return useMemo(() => createApi({
        baseUrl: process.env.EXPO_PUBLIC_API_URL!,
        getToken: () => session,
        onUnauthorized: signOut,       // expired token → back to sign-in
    }), [session, signOut]);
}
