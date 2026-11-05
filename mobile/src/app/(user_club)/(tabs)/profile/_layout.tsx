import { Stack } from 'expo-router';

// A stack inside the profile tab, so screens pushed from the profile keep the tab bar.
export default function ClubProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="followers" />
    </Stack>
  );
}
