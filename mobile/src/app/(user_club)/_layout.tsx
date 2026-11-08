import { Stack } from 'expo-router';

export default function StudentLayout() {
  // This renders the navigation stack for all authenticated app routes.
  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="event/[eventId]/survey/edit" />
        <Stack.Screen name="event/[eventId]/survey/results" />
        <Stack.Screen name="event/[eventId]/survey/create" />
        <Stack.Screen name="event/create" />
        <Stack.Screen name="event/[eventId]/edit" />
    </Stack>

  );
}