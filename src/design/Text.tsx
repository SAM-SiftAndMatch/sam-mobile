import React from 'react';
import { Text as NativeText, StyleSheet, type TextProps } from 'react-native';
const families: Record<string, string> = {
  '400': 'BeVietnamPro_400Regular',
  '500': 'BeVietnamPro_500Medium',
  '600': 'BeVietnamPro_600SemiBold',
  '700': 'BeVietnamPro_700Bold',
  '800': 'BeVietnamPro_700Bold',
  '900': 'BeVietnamPro_700Bold',
  bold: 'BeVietnamPro_700Bold',
  normal: 'BeVietnamPro_400Regular',
};
export default function Text({ style, ...props }: TextProps) {
  const flat = StyleSheet.flatten(style) || {};
  return (
    <NativeText
      {...props}
      style={[
        { fontFamily: families[String(flat.fontWeight || 400)] || families['400'] },
        style,
        { fontWeight: 'normal' },
      ]}
    />
  );
}
