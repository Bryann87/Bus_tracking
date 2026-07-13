// src/theme/RouteLine.js
//
// Elemento de firma visual de la app: una "línea de ruta" punteada con
// una parada (punto) y un bus recorriéndola. Se usa en Login, Registro
// y como divisor en el Dashboard. Hecho 100% con Views de RN (borderStyle
// 'dashed' es soportado nativo), sin depender de react-native-svg.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from './colors';

export default function RouteLine({ width = 160, color = COLORS.accent }) {
  return (
    <View style={[styles.wrapper, { width }]}>
      <View style={styles.dot} />
      <View style={[styles.dash, { borderColor: color }]} />
      <MaterialCommunityIcons name="bus" size={16} color={color} style={styles.bus} />
      <View style={[styles.dash, { borderColor: color }]} />
      <View style={styles.dotOutline} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.accent },
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
  bus: { marginHorizontal: 2 },
});