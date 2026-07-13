import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, RADIUS, SHADOW } from '../theme/colors';

export default function RutasScreen({ navigation }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      cargarRutas();
    }, [])
  );

  async function cargarRutas() {
    setLoading(true);
    try {
      const { data } = await api.get('/rutas');
      setRutas(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las rutas del servidor.');
    } finally {
      setLoading(false);
    }
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.routeItem}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('RutaDetalle', { rutaId: item.id })}
    >
      <View style={[styles.routeIconContainer, !item.activo && { backgroundColor: '#EEE' }]}>
        <MaterialCommunityIcons name="bus" size={24} color={item.activo ? COLORS.primary : COLORS.muted} />
      </View>
      <View style={styles.routeInfo}>
        <Text style={styles.routeName}>{item.nombre}</Text>
        <Text style={styles.routeDescription}>
          {item.origen} → {item.destino}
        </Text>
        <Text style={styles.routeMeta}>
          {item.paradas_count ?? 0} parada(s) · {item.buses_count ?? 0} bus(es)
          {!item.activo && '  ·  Inactiva'}
        </Text>
      </View>
      <View style={styles.routeAction}>
        <Text style={styles.routePrice}>${Number(item.tarifa).toFixed(2)}</Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Rutas disponibles</Text>
        {isAdmin && (
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('RutaForm')}>
            <MaterialCommunityIcons name="plus" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Nueva</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={rutas}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>Aún no hay rutas registradas.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.ink },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADIUS.pill,
    gap: 5,
  },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  listContainer: { paddingHorizontal: 24, paddingBottom: 24 },
  emptyText: { textAlign: 'center', color: COLORS.muted, marginTop: 40 },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: RADIUS.lg,
    marginBottom: 12,
    ...SHADOW.sm,
  },
  routeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  routeInfo: { flex: 1 },
  routeName: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 3 },
  routeDescription: { fontSize: 13, color: COLORS.muted },
  routeMeta: { fontSize: 11, color: COLORS.faint, marginTop: 3 },
  routeAction: { alignItems: 'flex-end' },
  routePrice: { fontSize: 14, fontWeight: '700', color: COLORS.success, marginBottom: 4 },
});