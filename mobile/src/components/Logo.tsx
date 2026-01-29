import React from 'react';
import { Image, ImageProps, StyleSheet, View } from 'react-native';

interface LogoProps extends Omit<ImageProps, 'source'> {
  width?: number;
}

/**
 * Centralised banner logo wrapper so we can fine-tune sizing in one place.
 * NOTE: Ensure the asset exists at mobile/assets/dypcmr-logo.png.
 */
export const Logo = ({ width = 220, style, ...props }: LogoProps) => {
  return (
    <View style={[styles.container, { width }]}> 
      <Image
        source={require('../../assets/dypcmr-logo.png')}
        style={[styles.image, style, { width }]}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="DYPCMR logo"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  image: {
    height: undefined,
    aspectRatio: 439 / 247,
  },
});
