import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { theme } from '../theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = ({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  style,
  disabled,
  ...props
}: ButtonProps) => {
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.border;
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'outline':
        return 'transparent';
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.text.secondary;
    switch (variant) {
      case 'primary':
      case 'secondary':
        return theme.colors.text.light;
      case 'outline':
        return theme.colors.primary;
      default:
        return theme.colors.text.light;
    }
  };

  const getHeight = () => {
    switch (size) {
      case 'sm': return 32;
      case 'md': return 48;
      case 'lg': return 56;
      default: return 48;
    }
  };

  const styles = StyleSheet.create({
    button: {
      backgroundColor: getBackgroundColor(),
      height: getHeight(),
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      borderWidth: variant === 'outline' ? 1 : 0,
      borderColor: theme.colors.primary,
      ...theme.shadows.sm,
    },
    text: {
      color: getTextColor(),
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.bold as any,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
