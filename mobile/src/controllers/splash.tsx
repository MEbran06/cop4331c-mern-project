import { SplashScreen } from 'expo-router';
import { useSession } from '../contexts/ctx';
import { useTheme } from '@/contexts/theme';

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { isLoading } = useSession();
  const {isLoading: isThemeLoading } = useTheme();

  if (!isLoading && !isThemeLoading) {
    SplashScreen.hide();
  }

  return null;
}
