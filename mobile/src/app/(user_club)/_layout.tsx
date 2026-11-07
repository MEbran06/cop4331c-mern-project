import { Stack } from 'expo-router';

export default function StudentLayout() {
  // This renders the navigation stack for all authenticated app routes.
  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="survey/[surveyId]/edit" />
        <Stack.Screen name="survey/[surveyId]/results" />
        <Stack.Screen name="survey/create" />
        <Stack.Screen name="event/create" />
        <Stack.Screen name="event/[eventId]/edit" />
    </Stack>

  );
}