import { Stack } from 'expo-router';

import { SessionProvider, useSession } from '@/contexts/ctx';
import { SplashScreenController } from '@/controllers/splash';

import { useFonts } from 'expo-font';
import { Anton_400Regular } from '@expo-google-fonts/anton';
import {
  Archivo_400Regular, Archivo_600SemiBold, Archivo_700Bold, Archivo_800ExtraBold,
} from '@expo-google-fonts/archivo';
import { ArchivoNarrow_700Bold } from '@expo-google-fonts/archivo-narrow';



export default function Root() {

    const [fontsLoaded] = useFonts({
        Anton_400Regular,
        Archivo_400Regular, Archivo_600SemiBold, Archivo_700Bold, Archivo_800ExtraBold,
        ArchivoNarrow_700Bold,
    });
    if (!fontsLoaded) return null;
  // Set up the auth context and render your layout inside of it.
  return (
    <SessionProvider>
      <SplashScreenController />
      <RootLayout />
    </SessionProvider>
  );
}

// Create a new component that can access the SessionProvider context later.
export function RootLayout() {
  const { session, user } = useSession();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Only logged-in users */}
      <Stack.Protected guard={!!session}>
        <Stack.Protected guard={user?.role === 'student'}>
          <Stack.Screen name="(user_student)" />
        </Stack.Protected>

        <Stack.Protected guard={user?.role === 'club'}>
          <Stack.Screen name="(user_club)" />
        </Stack.Protected>
      </Stack.Protected>

      {/* Only non-authenticated users */}
      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  );
}
