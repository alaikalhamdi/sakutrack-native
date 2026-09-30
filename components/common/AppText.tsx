import React from 'react';
import {
  Platform,
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  TextProps as RNTextProps,
  TextInputProps as RNTextInputProps,
  TextStyle,
} from 'react-native';
import { FontWeightVariant, getFontFamily } from '../../constants/typography';
import { useAppTheme } from '../../context/ThemeContext';

export type TextVariant =
  | 'display'    // 24-32px, bold
  | 'title'      // 18-22px, bold
  | 'subtitle'   // 14-16px, semiBold
  | 'body'       // 13-15px, regular
  | 'bodyMedium' // 13-15px, medium / semiBold
  | 'caption'    // 11-12px, regular
  | 'mono';      // Monospace / tabular numbers

export interface AppTextProps extends RNTextProps {
  variant?: TextVariant;
  weight?: FontWeightVariant;
}

export const AppText: React.FC<AppTextProps> = ({
  style,
  variant,
  weight,
  children,
  ...props
}) => {
  const { theme, getFont } = useAppTheme();
  const flattened = (StyleSheet.flatten(style) || {}) as TextStyle;

  // 1. Resolve weight hierarchy
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
    } else {
      resolvedWeight = 'regular';
    }
  }

  // 2. Resolve font family
  let fontFamily = flattened.fontFamily;
  if (!fontFamily) {
    if (variant === 'mono') {
      fontFamily = 'SpaceMono';
    } else if (theme.fonts) {
      fontFamily = theme.fonts[resolvedWeight];
    } else {
      fontFamily = getFont ? getFont(resolvedWeight) : getFontFamily(theme.fontStyle, resolvedWeight);
    }
  }

  // 3. Normalize Android font weights to prevent synthetic font clipping / fallback
  const androidWeightFix =
    Platform.OS === 'android' && fontFamily && fontFamily !== 'System'
      ? { fontWeight: undefined }
      : {};

  return (
    <RNText
      {...props}
      style={[
        { color: theme.colors.text },
        style,
        { fontFamily },
        androidWeightFix,
      ]}
    >
      {children}
    </RNText>
  );
};

export const Text = AppText;

export interface AppTextInputProps extends RNTextInputProps {
  weight?: FontWeightVariant;
}

export const AppTextInput = React.forwardRef<RNTextInput, AppTextInputProps>(
  ({ style, weight = 'regular', ...props }, ref) => {
    const { theme, getFont } = useAppTheme();
    const flattened = (StyleSheet.flatten(style) || {}) as TextStyle;

    let resolvedWeight: FontWeightVariant = weight;
    if (flattened.fontWeight) {
      const fw = flattened.fontWeight;
      if (fw === 'bold' || fw === '700' || fw === '800' || fw === '900') {
        resolvedWeight = 'bold';
      } else if (fw === '600') {
        resolvedWeight = 'semiBold';
      } else if (fw === '500') {
        resolvedWeight = 'medium';
      }
    }

    const fontFamily =
      flattened.fontFamily ??
      (theme.fonts ? theme.fonts[resolvedWeight] : getFont(resolvedWeight));

    const androidWeightFix =
      Platform.OS === 'android' && fontFamily && fontFamily !== 'System'
        ? { fontWeight: undefined }
        : {};

    return (
      <RNTextInput
        ref={ref}
        placeholderTextColor={props.placeholderTextColor || theme.colors.textMuted}
        {...props}
        style={[
          { color: theme.colors.text },
          style,
          { fontFamily },
          androidWeightFix,
        ]}
      />
    );
  }
);

AppTextInput.displayName = 'AppTextInput';
export const TextInput = AppTextInput;
