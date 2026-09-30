import React from 'react';
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { Text } from './AppText';

interface BadgeProps {
  label: string;
  icon?: React.ReactNode;
  color?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  icon,
  color,
  backgroundColor,
  style,
  textStyle,
  size = 'md',
}) => {
  const { theme, getFont } = useAppTheme();

  const textColor = color || theme.colors.primary;
  const bgColor = backgroundColor || theme.colors.primaryLight;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor,
          borderRadius: Math.min(theme.borderRadius, 20),
          paddingVertical: size === 'sm' ? 3 : 5,
          paddingHorizontal: size === 'sm' ? 8 : 10,
        },
        style,
      ]}
    >
      {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize: size === 'sm' ? 11 : 13,
            fontWeight: '600',
            fontFamily: getFont('semiBold'),
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    letterSpacing: 0.3,
  },
});
