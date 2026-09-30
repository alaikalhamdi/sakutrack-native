import React from 'react';
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';

interface CardProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  variant?: 'surface' | 'subtle' | 'accent' | 'outlined';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  style,
  variant = 'surface',
  children,
  ...rest
}) => {
  const { theme } = useAppTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'subtle':
        return theme.colors.surfaceSubtle;
      case 'accent':
        return theme.colors.primaryLight;
      case 'outlined':
        return 'transparent';
      case 'surface':
      default:
        return theme.colors.surface;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outlined') return theme.colors.border;
    if (theme.borderWidth > 0) return theme.colors.border;
    return 'transparent';
  };

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: theme.borderRadius,
          borderWidth: theme.borderWidth,
          borderColor: getBorderColor(),
          shadowColor: theme.isDark ? '#000' : theme.colors.textMuted,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: theme.isDark ? 0.3 : 0.08,
          shadowRadius: 10,
          elevation: theme.isDark ? 4 : 2,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    padding: 16,
    overflow: 'hidden',
  },
});
