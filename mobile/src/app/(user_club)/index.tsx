import { Pressable, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSession } from '@/contexts/ctx';

export default function Index() {
  const { signOut } = useSession();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Pressable
        onPress={() => {
          // The guard in `RootLayout` redirects back to the sign-in screen.
          signOut();
        }}>
        <Text>Club Sign Out</Text>
      </Pressable>
    </View>
  );
}
