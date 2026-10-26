import { Platform, Text, View } from 'react-native';
import { themes } from '@/constants/theme';

export const theme = themes.retro;
export const isIOS = Platform.OS === 'ios'

export default function Preferences() {

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Sign Up</Text>
    </View>
  );
}