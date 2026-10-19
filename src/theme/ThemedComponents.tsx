import { Ionicons as NativeIonicons } from '@expo/vector-icons';
import { ComponentProps, useMemo } from 'react';
import {
  Text as NativeText,
  TextInput as NativeTextInput,
  StyleProp,
  StyleSheet,
  TextInputProps,
  TextProps,
  TextStyle,
  SafeAreaView as NativeSafeAreaView,
  View as NativeView,
  ViewProps,
  ViewStyle,
} from 'react-native';

import { useAppTheme } from './ThemeContext';

const darkSurfaceColors: Record<string, string> = {
  '#F2E1C7': '#1B1A17',
  '#F8EFDF': '#211F1B',
  '#E3D2B5': '#302C25',
  '#D6C29D': '#463D2F',
  '#D9D9D9': '#3C3932',
  '#C8B58F': '#62533A',
  '#C5AE8B': '#62533A',
  '#D8C7A8': '#62533A',
};

const darkTextColors: Record<string, string> = {
  '#000000': '#F2E1C7',
  '#3D0404': '#F2E1C7',
  '#332920': '#F2E1C7',
  '#644219': '#D0C1A5',
  '#595626': '#D8C27F',
  '#776650': '#BBAA8D',
  '#907C60': '#BBAA8D',
  '#75624B': '#C9B996',
  '#6A614D': '#C9B996',
  '#2F524F': '#A5C7B3',
  '#9A8D78': '#BBAA8D',
};

const darkInputColors = { ...darkSurfaceColors, ...darkTextColors };

function recolorStyle<T extends ViewStyle | TextStyle>(
  style: StyleProp<T>,
  colorMap: Record<string, string>,
  defaultTextColor?: string
): T {
  const flattened = StyleSheet.flatten(style) ?? {};
  const result = { ...flattened } as T & Record<string, unknown>;

  for (const property of ['color', 'backgroundColor', 'borderColor']) {
    const value = result[property];
    if (typeof value === 'string') {
      const mapped = colorMap[value.toUpperCase()];
      if (mapped) {
        result[property] = mapped;
      }
    }
  }

  if (defaultTextColor && typeof result.color !== 'string') {
    result.color = defaultTextColor;
  }

  return result;
}

export function ThemedView({ style, ...props }: ViewProps) {
  const { isDark } = useAppTheme();
  const themedStyle = useMemo(
    () => (isDark ? recolorStyle(style, darkSurfaceColors) : style),
    [isDark, style]
  );
  return <NativeView {...props} style={themedStyle} />;
}

export function ThemedSafeAreaView({
  style,
  ...props
}: ComponentProps<typeof NativeSafeAreaView>) {
  const { isDark } = useAppTheme();
  const themedStyle = useMemo(
    () => (isDark ? recolorStyle(style, darkSurfaceColors) : style),
    [isDark, style]
  );
  return <NativeSafeAreaView {...props} style={themedStyle} />;
}

export function ThemedText({ style, ...props }: TextProps) {
  const { isDark } = useAppTheme();
  const themedStyle = useMemo(
    () => (isDark ? recolorStyle(style, darkTextColors, '#F2E1C7') : style),
    [isDark, style]
  );
  return <NativeText {...props} style={themedStyle} />;
}

export function ThemedTextInput({ style, placeholderTextColor, ...props }: TextInputProps) {
  const { isDark } = useAppTheme();
  const themedStyle = useMemo(
    () => (isDark ? recolorStyle(style, darkInputColors, '#F2E1C7') : style),
    [isDark, style]
  );
  const themedPlaceholder = placeholderTextColor
    ? typeof placeholderTextColor === 'string'
      ? darkTextColors[placeholderTextColor.toUpperCase()] ?? placeholderTextColor
      : placeholderTextColor
    : isDark
      ? '#BBAA8D'
      : undefined;

  return (
    <NativeTextInput
      {...props}
      placeholderTextColor={themedPlaceholder}
      style={themedStyle}
    />
  );
}

export function ThemedIonicons(props: ComponentProps<typeof NativeIonicons>) {
  const { isDark } = useAppTheme();
  const color =
    isDark && typeof props.color === 'string'
      ? darkTextColors[props.color.toUpperCase()] ?? props.color
      : props.color;
  return <NativeIonicons {...props} color={color} />;
}
