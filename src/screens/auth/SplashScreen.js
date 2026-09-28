import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import CustomButton from '../../components/common/CustomButton';

export const SplashScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <Ionicons name="briefcase" size={54} color={COLORS.white} />
        </View>
        <Text style={styles.appName}>WorkMarket</Text>
        <Text style={styles.tagline}>
          Connect with top freelancers & discover high-paying projects worldwide.
        </Text>
      </View>

      <View style={styles.footer}>
        <CustomButton
          title="Get Started / Login"
          onPress={() => navigation.navigate('Login')}
          variant="secondary"
          size="large"
          style={styles.btn}
        />
        <CustomButton
          title="Create New Account"
          onPress={() => navigation.navigate('Register')}
          variant="outline"
          size="large"
          style={styles.outlineBtn}
          textStyle={{ color: COLORS.white }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'space-between',
    padding: SIZES.paddingLg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: SIZES.body1,
    color: COLORS.primaryBackground,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  footer: {
    marginBottom: 20,
    gap: 12,
  },
  btn: {
    width: '100%',
  },
  outlineBtn: {
    width: '100%',
    borderColor: COLORS.white,
  },
});

export default SplashScreen;
