// src/screens/DashboardScreen.js
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';

const REGION_INICIAL = {
  latitude: -0.9550,
  longitude: -80.7200,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

const NAV_ITEMS = [
  { key: 'Rutas', label: 'Rutas', icon: 'routes' },
  { key: 'Paradas', label: 'Paradas', icon: 'map-marker-radius-outline' },
  { key: 'Reportes', label: 'Reportes', icon: 'alert-circle-outline' },
];

export default function DashboardScreen({ navigation }) {
    const { colors: COLORS, radius: RADIUS, shadow: SHADOW } = useTheme();
  const styles = makeStyles(COLORS, RADIUS, SHADOW);
  const [buses, setBuses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(null);
  const mapRef = useRef(null);

  const { logout, user } = useAuth();

  const fetchBuses = useCallback(async () => {
    try {
      const { data } = await api.get('/buses/activos');
      setBuses(data);
    } catch (e) {
      // el próximo ciclo de polling reintenta automáticamente
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBuses();
      const interval = setInterval(fetchBuses, 5000);
      return () => clearInterval(interval);
    }, [fetchBuses])
  );

  function goTo(screen) {
    setActiveTab(screen);
    navigation.navigate(screen);
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={REGION_INICIAL}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {buses.map((b) => (
          <Marker
            key={b.id}
            coordinate={{ latitude: parseFloat(b.lat), longitude: parseFloat(b.lng) }}
            title={`Unidad ${b.id}`}
          >
            <View style={styles.busPin}>
              <MaterialCommunityIcons name="bus" size={16} color="#fff" />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Header: saludo + búsqueda + logout */}
      <SafeAreaView style={styles.topHeader}>
        <View style={styles.greetingRow}>
          <Text style={styles.greeting}>
            Hola{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </Text>
          <TouchableOpacity style={styles.logoutButton} onPress={logout} hitSlop={8}>
            <MaterialCommunityIcons name="logout" size={20} color={COLORS.danger} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={22} color={COLORS.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar lugares o paradas..."
            placeholderTextColor={COLORS.faint}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Tarjeta de estado en vivo */}
        <View style={styles.statusCard}>
          <View style={styles.statusDotWrap}>
            <View style={styles.statusDotPulse} />
          </View>
          <Text style={styles.statusText}>
            <Text style={{ fontWeight: '700' }}>{buses.length}</Text> bus{buses.length === 1 ? '' : 'es'} en línea ahora
          </Text>
        </View>
      </SafeAreaView>

      {/* Botón centrar mapa */}
      <TouchableOpacity
        style={styles.centerButton}
        onPress={() => mapRef.current?.animateToRegion(REGION_INICIAL, 400)}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={22} color={COLORS.primary} />
      </TouchableOpacity>

      {/* Menú inferior con etiquetas */}
      <SafeAreaView style={styles.menuBar} edges={['bottom']}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.menuItem}
              onPress={() => goTo(item.key)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, isActive && styles.menuIconWrapActive]}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={22}
                  color={isActive ? '#fff' : COLORS.muted}
                />
              </View>
              <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </SafeAreaView>
    </View>
  );
}

function makeStyles(COLORS, RADIUS, SHADOW) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  map: { flex: 1 },

  busPin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    ...SHADOW.sm,
  },

  topHeader: {
    position: 'absolute',
    top: 0,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 0,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  greeting: { fontSize: 17, fontWeight: '700', color: COLORS.ink },
  logoutButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    height: 50,
    ...SHADOW.md,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text },

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    alignSelf: 'flex-start',
    borderRadius: RADIUS.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 12,
    ...SHADOW.sm,
  },
  statusDotWrap: { width: 8, height: 8, alignItems: 'center', justifyContent: 'center' },
  statusDotPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  statusText: { fontSize: 12.5, color: COLORS.text },

  centerButton: {
    position: 'absolute',
    right: 16,
    bottom: 110,
    width: 46,
    height: 46,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.md,
  },

  menuBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    paddingTop: 10,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    ...SHADOW.md,
  },
  menuItem: { alignItems: 'center', paddingBottom: 10, paddingHorizontal: 18 },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  menuIconWrapActive: { backgroundColor: COLORS.primary },
  menuLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '600' },
  menuLabelActive: { color: COLORS.primary },
  });
}