import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

export default function RutaDetalleScreen({ route, navigation }) {
  const { colors: COLORS, radius: RADIUS, shadow: SHADOW } = useTheme();
const styles = makeStyles(COLORS, RADIUS, SHADOW);

  const { rutaId } = route.params;
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [ruta, setRuta] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      cargarRuta();
    }, [rutaId])
  );

  async function cargarRuta() {
    setLoading(true);
    try {
      const { data } = await api.get(`/rutas/${rutaId}`);
      setRuta(data);
    } catch (error) {
      // se puede reintentar recargando la pantalla
    } finally {
      setLoading(false);
    }
  }

  if (loading || !ruta) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const paradasCoords = (ruta.paradas ?? []).map((p) => ({
    latitude: parseFloat(p.latitud),
    longitude: parseFloat(p.longitud),
  }));

  const regionInicial = paradasCoords.length
    ? { ...paradasCoords[0], latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : { latitude: -0.9550, longitude: -80.7200, latitudeDelta: 0.08, longitudeDelta: 0.08 };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{ruta.nombre}</Text>
          <Text style={styles.subtitle}>{ruta.origen} → {ruta.destino}</Text>
        </View>
        <View style={styles.tarifaBadge}>
          <Text style={styles.tarifaText}>${Number(ruta.tarifa).toFixed(2)}</Text>
        </View>
      </View>

      {ruta.descripcion ? <Text style={styles.descripcion}>{ruta.descripcion}</Text> : null}

      <View style={styles.mapContainer}>
        <MapView style={styles.map} initialRegion={regionInicial}>
          {paradasCoords.length > 1 && (
            <Polyline coordinates={paradasCoords} strokeColor={COLORS.primary} strokeWidth={3} />
          )}
          {(ruta.paradas ?? []).map((p, i) => (
            <Marker
              key={p.id}
              coordinate={{ latitude: parseFloat(p.latitud), longitude: parseFloat(p.longitud) }}
              title={`${i + 1}. ${p.nombre}`}
            />
          ))}
        </MapView>
      </View>

      <Text style={styles.sectionTitle}>Paradas del recorrido ({ruta.paradas?.length ?? 0})</Text>
      {(ruta.paradas ?? []).length === 0 ? (
        <Text style={styles.emptyText}>Esta ruta aún no tiene paradas asignadas.</Text>
      ) : (
        ruta.paradas.map((p, i) => (
          <View key={p.id} style={styles.paradaRow}>
            <View style={styles.paradaBadge}>
              <Text style={styles.paradaBadgeText}>{i + 1}</Text>
            </View>
            <Text style={styles.paradaNombre}>{p.nombre}</Text>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>Buses asignados ({ruta.buses?.length ?? 0})</Text>
      {(ruta.buses ?? []).length === 0 ? (
        <Text style={styles.emptyText}>Aún no hay buses asignados a esta ruta.</Text>
      ) : (
        ruta.buses.map((b) => (
          <View key={b.id} style={styles.busRow}>
            <MaterialCommunityIcons name="bus" size={20} color={COLORS.primary} />
            <Text style={styles.busPlaca}>{b.placa}</Text>
            <Text style={styles.busConductor}>{b.conductor?.name ?? 'Sin conductor'}</Text>
          </View>
        ))
      )}

      {isAdmin && (
        <View style={styles.adminActions}>
          <TouchableOpacity style={styles.adminButton} onPress={() => navigation.navigate('RutaForm', { rutaId })}>
            <MaterialCommunityIcons name="pencil-outline" size={18} color={COLORS.primary} />
            <Text style={styles.adminButtonText}>Editar ruta</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => navigation.navigate('AsignarParadas', { rutaId })}
          >
            <MaterialCommunityIcons name="vector-polyline" size={18} color={COLORS.primary} />
            <Text style={styles.adminButtonText}>Editar paradas</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function makeStyles(COLORS, RADIUS, SHADOW) {
  return StyleSheet.create({  

  container: { flex: 1, backgroundColor: COLORS.surface },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', margin: 20, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.ink },
  subtitle: { fontSize: 14, color: COLORS.muted, marginTop: 4 },
  tarifaBadge: { backgroundColor: COLORS.successBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.pill },
  tarifaText: { color: COLORS.success, fontWeight: '700' },
  descripcion: { marginHorizontal: 20, color: COLORS.muted, fontSize: 13, marginBottom: 12 },

  mapContainer: { height: 220, marginHorizontal: 15, borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: 20, ...SHADOW.sm },
  map: { width: '100%', height: '100%' },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.ink, marginHorizontal: 20, marginTop: 8, marginBottom: 10 },
  emptyText: { color: COLORS.muted, fontSize: 13, marginHorizontal: 20, marginBottom: 16 },

  paradaRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10 },
  paradaBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  paradaBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  paradaNombre: { fontSize: 14, color: COLORS.text },

  busRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10, gap: 10 },
  busPlaca: { fontWeight: '700', color: COLORS.text },
  busConductor: { color: COLORS.muted, fontSize: 13 },

  adminActions: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginTop: 10, marginBottom: 30 },
  adminButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primaryLight, paddingVertical: 10, paddingHorizontal: 14, borderRadius: RADIUS.md },
  adminButtonText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
});
}