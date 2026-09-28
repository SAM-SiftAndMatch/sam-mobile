import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';

export const UserAvatar = ({
  uri,
  name = 'User',
  size = 48,
  showOnline = false,
  style,
}) => {
  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = n.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.substring(0, 2).toUpperCase();
  };

  return (
    <View style={[{ width: size, height: size }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.avatarFallback,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={[styles.initialsText, { fontSize: size * 0.38 }]}>
            {getInitials(name)}
          </Text>
        </View>
      )}

      {showOnline && (
        <View
          style={[
            styles.onlineBadge,
            {
              width: Math.max(10, size * 0.25),
              height: Math.max(10, size * 0.25),
              borderRadius: size,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarImage: {
    backgroundColor: COLORS.surface,
  },
  avatarFallback: {
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontWeight: '700',
    color: COLORS.white,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
});

export default UserAvatar;
