import { TabContainer } from '@/components/app-tabs';
import { Tabs } from 'expo-router';
import { useTheme } from '@/contexts/theme';
import {Lucide} from '@react-native-vector-icons/lucide';
import {Ionicons} from '@react-native-vector-icons/ionicons';

export default function ClubLayout() {
  const { theme } = useTheme();
  // This renders the navigation stack for all authenticated app routes.
  return (
   <TabContainer theme={theme}>
        <Tabs.Screen name="index" options={{ title: 'feed', tabBarIcon: ({ color, size }) => <Lucide name="calendar" color={color} size={size} /> }} />
        <Tabs.Screen name="profile" options={{ title: 'profile', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} /> }} />
    </TabContainer>
  );
}
