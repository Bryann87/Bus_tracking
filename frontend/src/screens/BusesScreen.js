import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ESTADO_COLOR = {
  activo: { bg: '#E8F5E9', text: '#2E7D32' },
  inactivo: { bg: '#EEEEEE', text: '#616161' },
  mantenimiento: { bg: '#FFF3E0', text: '#EF6C00' },
};

export default function BusesScreen({ navigation }) {
  const { user } = useAuth();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      api
        .get('/buses')
        .then(({ data }) => setBuses(data))
        .finally(() => setLoading(false));
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1565C0" />
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
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('BusForm', { busId: item.id })}
            >
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  placa: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  meta: { color: '#555', marginTop: 4 },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1565C0',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 4,
  },
  fabText: { color: '#fff', fontWeight: 'bold' },
});
