import { Stack, usePathname } from 'expo-router';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { View } from 'react-native';

import BottomNavigation from '../components/BottomNavigation';
import { ThemeProvider, useAppTheme } from '../theme/ThemeContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SafeAreaRoot />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function SafeAreaRoot() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const showNavigation = pathname !== '/' && !pathname.startsWith('/login');

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#1B1A17' : '#F2E1C7' }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      />
      {showNavigation && (
        <View style={{ paddingBottom: insets.bottom, backgroundColor: '#49351A' }}>
          <BottomNavigation />
        </View>
      )}
    </View>
  );
}