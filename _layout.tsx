import { Stack, usePathname } from 'expo-router';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import BottomNavigation from '../components/BottomNavigation';
import { ThemeProvider, useAppTheme } from '../theme/ThemeContext';
import { MuseumAudioProvider } from '../components/museum/MuseumAudioProvider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MuseumAudioProvider>
          <SafeAreaRoot />
        </MuseumAudioProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function SafeAreaRoot() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { isDark, highContrast, palette } = useAppTheme();
  const showNavigation =
    pathname !== '/' &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/mensagens/');

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      />
      {showNavigation && (
        <View style={{ paddingBottom: insets.bottom, backgroundColor: isDark ? (highContrast ? '#141414' : '#1B1916') : '#49351A' }}>
          <BottomNavigation />
        </View>
      )}
    </View>
  );
}
