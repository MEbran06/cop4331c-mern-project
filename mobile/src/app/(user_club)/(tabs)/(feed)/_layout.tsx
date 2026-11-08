import { Stack } from 'expo-router';

export default function ClubFeedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="past" />
    </Stack>
  );
}
