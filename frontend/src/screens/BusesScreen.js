import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';

export default function BusesScreen({ navigation }) {
  const { colors: COLORS, radius: RADIUS, shadow: SHADOW } = useTheme();
  const styles = makeStyles(COLORS, RADIUS, SHADOW);

  const ESTADO_COLOR = {
    activo: { bg: COLORS.successBg, text: COLORS.success },
    inactivo: { bg: COLORS.primaryLight, text: COLORS.muted },
    mantenimiento: { bg: COLORS.warningBg, text: COLORS.accentDark ?? COLORS.accent },
  };

  const { user } = useAuth();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      api.get('/buses').then(({ data }) => setBuses(data)).finally(() => setLoading(false));
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={buses}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No hay buses registrados.</Text>}
        renderItem={({ item }) => {
          const colores = ESTADO_COLOR[item.estado] ?? ESTADO_COLOR.inactivo;
          return (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('BusForm', { busId: item.id })}>
              <View style={styles.cardHeader}>
                <Text style={styles.placa}>🚍 {item.placa}</Text>
                <View style={[styles.badge, { backgroundColor: colores.bg }]}>
                  <Text style={{ color: colores.text, fontSize: 12 }}>{item.estado}</Text>
                </View>
              </View>
              <Text style={styles.meta}>Ruta: {item.ruta?.nombre ?? 'Sin asignar'}</Text>
              <Text style={styles.meta}>Conductor: {item.conductor?.name ?? 'Sin asignar'}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {user.role === 'admin' && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('BusForm')}>
          <Text style={styles.fabText}>+ Nuevo bus</Text>
        </TouchableOpacity>
      )}

      {user.role === 'conductor' && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('MiBus')}>
          <Text style={styles.fabText}>📡 Reportar ubicación</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function makeStyles(COLORS, RADIUS, SHADOW) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    empty: { textAlign: 'center', color: COLORS.muted, marginTop: 40 },
    card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 16, marginBottom: 12, ...SHADOW.sm },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    placa: { fontSize: 16, fontWeight: 'bold', color: COLORS.ink },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    meta: { color: COLORS.muted, marginTop: 4 },
    fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 14, borderRadius: RADIUS.pill, ...SHADOW.md },
    fabText: { color: COLORS.onPrimary, fontWeight: 'bold' },
  });
}