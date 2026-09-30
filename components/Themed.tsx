import { Platform, StyleSheet, Text as DefaultText, TextStyle, View as DefaultView } from 'react-native';

import { useColorScheme } from './useColorScheme';

import Colors from '@/constants/Colors';
import { FontWeightVariant } from '../constants/typography';
import { useAppTheme } from '../context/ThemeContext';
import { TextVariant } from './common/AppText';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
  weight?: FontWeightVariant;
  variant?: TextVariant;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = Omit<ThemeProps, 'weight' | 'variant'> & DefaultView['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, weight, variant, ...otherProps } = props;
  const { theme, getFont } = useAppTheme();
  const themeColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const color = lightColor || darkColor ? themeColor : theme.colors.text;

  const flattened = (StyleSheet.flatten(style) || {}) as TextStyle;

  let resolvedWeight: FontWeightVariant = 'regular';
  if (weight) {
    resolvedWeight = weight;
  } else if (variant) {
    switch (variant) {
      case 'display':
      case 'title':
        resolvedWeight = 'bold';
        break;
      case 'subtitle':
        resolvedWeight = 'semiBold';
        break;
      case 'bodyMedium':
        resolvedWeight = 'medium';
        break;
      case 'caption':
      case 'body':
      case 'mono':
      default:
        resolvedWeight = 'regular';
        break;
    }
  } else if (flattened.fontWeight) {
    const fw = flattened.fontWeight;
    if (fw === 'bold' || fw === '700' || fw === '800' || fw === '900') {
      resolvedWeight = 'bold';
    } else if (fw === '600') {
      resolvedWeight = 'semiBold';
    } else if (fw === '500') {
      resolvedWeight = 'medium';
    }
  }

  let fontFamily = flattened.fontFamily;
  if (!fontFamily) {
    if (variant === 'mono') {
      fontFamily = 'SpaceMono';
    } else if (theme.fonts) {
      fontFamily = theme.fonts[resolvedWeight];
    } else {
      fontFamily = getFont(resolvedWeight);
    }
  }

  const androidWeightFix =
    Platform.OS === 'android' && fontFamily && fontFamily !== 'System'
      ? { fontWeight: undefined }
      : {};

  return (
    <DefaultText
      style={[{ color }, style, { fontFamily }, androidWeightFix]}
      {...otherProps}
    />
  );
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
