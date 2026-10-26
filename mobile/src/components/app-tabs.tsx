import { NativeTabs } from 'expo-router/native-tabs';
import { useColorScheme } from 'react-native';

import { fonts, Theme, ThemeName } from '@/constants/theme';

export default function AppTabs(theme: Theme) {

  return (
    <NativeTabs
      backgroundColor={theme.card}
      indicatorColor={theme.hi}
      labelStyle={{
        default:  { fontFamily: fonts.label, fontSize: 12, color: theme.muted },
        selected: { fontFamily: fonts.label, fontSize: 12, color: theme.ink },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
