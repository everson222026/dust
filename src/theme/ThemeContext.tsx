import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert } from 'react-native';

const THEME_STORAGE_KEY = '@dust_dark_mode';

type ThemeContextValue = {
  isDark: boolean;
  setDarkMode: (enabled: boolean) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadTheme() {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (active) {
          setIsDark(savedTheme === 'true');
        }
      } catch (error) {
        Alert.alert(
          'Não foi possível carregar o tema',
          error instanceof Error ? error.message : 'O tema claro será usado.'
        );
      }
    }

    loadTheme();
    return () => {
      active = false;
    };
  }, []);

  const setDarkMode = useCallback(async (enabled: boolean) => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, String(enabled));
    setIsDark(enabled);
  }, []);

  const value = useMemo(
    () => ({ isDark, setDarkMode }),
    [isDark, setDarkMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useAppTheme precisa ser usado dentro de ThemeProvider.');
  }
  return theme;
}
