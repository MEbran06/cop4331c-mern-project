import { TabContainer } from '@/components/app-tabs';
import { Stack, Tabs } from 'expo-router';
import { theme } from '../../preferences';
import {Lucide} from '@react-native-vector-icons/lucide';
import {Ionicons} from '@react-native-vector-icons/ionicons';
import { NativeTabs } from 'expo-router/build/native-tabs/NativeTabs.js';

export default function StudentLayout() {
  // This renders the navigation stack for all authenticated app routes.
  return (
   <TabContainer theme={theme}>
        <Tabs.Screen name="index" options={{ title: 'feed', tabBarIcon: ({ color, size }) => <Lucide name="ticket" color={color} size={size} /> }} />
        <Tabs.Screen name="following-page" options={{ title: 'clubs', tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} /> }} />
        <Tabs.Screen name="profile" options={{ title: 'profile', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} /> }} />
    </TabContainer>
  );
}
