import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

interface TokenBadgeProps {
  tokens: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function TokenBadge({ tokens, size = 'md' }: TokenBadgeProps) {
  const isLow = tokens <= 10;
  const styles = getStyles(size, isLow);

  return (
    <View style={styles.container}>
      <Ionicons
        name="flash"
        size={size === 'lg' ? 20 : size === 'md' ? 16 : 12}
        color={isLow ? '#ef4444' : COLORS.accent}
        style={styles.icon}
      />
      <Text style={styles.text}>{tokens}</Text>
      <Text style={styles.label}> tokens</Text>
    </View>
  );
}

function getStyles(size: 'sm' | 'md' | 'lg', isLow: boolean) {
  const fontSize = size === 'lg' ? 18 : size === 'md' ? 14 : 12;
  const padding = size === 'lg' ? { paddingHorizontal: 16, paddingVertical: 8 } : { paddingHorizontal: 10, paddingVertical: 5 };

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isLow ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isLow ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)',
      ...padding,
    },
    icon: {
      marginRight: 4,
    },
    text: {
      color: isLow ? '#ef4444' : COLORS.accent,
      fontSize,
      fontWeight: '700',
    },
    label: {
      color: isLow ? '#ef4444' : COLORS.accent,
      fontSize: fontSize - 2,
      fontWeight: '400',
    },
  });
}
