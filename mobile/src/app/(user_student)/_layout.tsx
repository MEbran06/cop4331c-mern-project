import { Stack } from 'expo-router';

export default function StudentLayout() {
  // This renders the navigation stack for all authenticated app routes.
  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="event/[id]" />
        <Stack.Screen name="survey/[eventId]" />
    </Stack>

  );
}
