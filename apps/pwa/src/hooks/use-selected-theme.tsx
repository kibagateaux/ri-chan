import React from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import type { Theme } from '@react-navigation/native';
import {
  DarkTheme as _DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import { useMMKVString } from 'react-native-mmkv';
import { Colors } from '@/lib/constants';
import { getStorage } from '@/lib/utils';
import { storage } from '../lib/utils';

const SELECTED_THEME = 'SELECTED_THEME';
export type ColorSchemeType = 'light' | 'dark' | 'system';
/**
 * this hooks should only be used while selecting the theme
 * This hooks will return the selected theme which is stored in MMKV
 * selectedTheme should be one of the following values 'light', 'dark' or 'system'
 * don't use this hooks if you want to use it to style your component based on the theme use useColorScheme from nativewind instead
 *
 */
export const useSelectedTheme = () => {
  const [theme, setTheme] = useMMKVString(SELECTED_THEME, storage);

  const setSelectedTheme = React.useCallback(
    (t: ColorSchemeType) => {
      setTheme(t);
    },
    [setTheme]
  );

  const selectedTheme = (theme ?? 'system') as ColorSchemeType;
  return { selectedTheme, setSelectedTheme } as const;
};

// to be used in the root file to load the selected theme from MMKV
export const loadSelectedTheme = () => {
  const theme = getStorage(SELECTED_THEME);
  if (theme !== undefined) {
    console.log('theme', theme);
  }
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const style = Appearance.getColorScheme() ?? 'light';
  const colorFromProps = props[style];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[style][colorName];
  }
}


const DarkTheme: Theme = {
  ..._DarkTheme,
  colors: {
    ..._DarkTheme.colors,
    primary: Colors.primary[200],
    background: Colors.charcoal[950],
    text: Colors.charcoal[100],
    border: Colors.charcoal[500],
    card: Colors.charcoal[850],
  },
};

const LightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary[400],
    background: Colors.white,
  },
};

export function useThemeConfig(): Theme {
  const style = Appearance.getColorScheme();

  if (style === 'dark') return DarkTheme;

  return LightTheme;
}