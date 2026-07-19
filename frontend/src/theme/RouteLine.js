// src/theme/RouteLine.js

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';

export default function RouteLine({ width = 160 }) {
  const { colors: COLORS } = useTheme();
  const styles = makeStyles(COLORS);

  return (
    <View style={[styles.wrapper, { width }]}>
      <View style={styles.dot} />

      <View
        style={[
          styles.dash,
          {
            borderColor: COLORS.accent,
          },
        ]}
      />

      <MaterialCommunityIcons
        name="bus"
        size={16}
        color={COLORS.accent}
        style={styles.bus}
      />

      <View
        style={[
          styles.dash,
          {
            borderColor: COLORS.accent,
          },
        ]}
      />

      <View style={styles.dotOutline} />
    </View>
  );
}

function makeStyles(COLORS) {
  return StyleSheet.create({
    wrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: COLORS.accent,
    },

    dotOutline: {
      width: 6,
      height: 6,
      borderRadius: 3,
      borderWidth: 1.5,
      borderColor: COLORS.accent,
      backgroundColor: 'transparent',
    },

    dash: {
      flex: 1,
      borderTopWidth: 1.5,
      borderStyle: 'dashed',
      marginHorizontal: 6,
    },

    bus: {
      marginHorizontal: 2,
    },
  });
}