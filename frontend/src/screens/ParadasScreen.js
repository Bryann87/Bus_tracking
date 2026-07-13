import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator, Alert, Modal } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, RADIUS, SHADOW } from '../theme/colors';

const REGION_INICIAL = { latitude: -0.9550, longitude: -80.7200, latitudeDelta: 0.08, longitudeDelta: 0.08 };

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatearDistancia(km) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export default function ParadasScreen({ navigation }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [paradas, setParadas] = useState([]);
  const [userCoords, setUserCoords] = useState(null);
  const [loading, setLoading] = useState(true);

  const [paradaSeleccionada, setParadaSeleccionada] = useState(null);
  const [rutasDeParada, setRutasDeParada] = useState([]);
  const [loadingRutas, setLoadingRutas] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const mapRef = React.useRef(null);

  // Se recarga cada vez que la pantalla vuelve a estar en foco
  // (por ejemplo, al volver de crear/editar una parada)
  useFocusEffect(
    useCallback(() => {
      cargarParadas();
    }, [])
  );

  async function cargarParadas() {
    setLoading(true);
    try {
      const [{ data: paradasData }, ubicacion] = await Promise.all([
        api.get('/paradas'),
        obtenerUbicacion(),
      ]);

      const lat = ubicacion?.coords.latitude;
      const lng = ubicacion?.coords.longitude;

      const conDistancia = paradasData.map((p) => ({
        ...p,
        lat: parseFloat(p.latitud),
        lng: parseFloat(p.longitud),
        distanciaKm: lat && lng ? calcularDistancia(lat, lng, parseFloat(p.latitud), parseFloat(p.longitud)) : null,
      }));

      conDistancia.sort((a, b) => (a.distanciaKm ?? 0) - (b.distanciaKm ?? 0));
      setParadas(conDistancia);

      if (lat && lng) {
        setUserCoords({ latitude: lat, longitude: lng });
        mapRef.current?.animateToRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.03, longitudeDelta: 0.03 }, 500);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las paradas del servidor.');
    } finally {
      setLoading(false);
    }
  }

  async function obtenerUbicacion() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return null;
      return await Location.getCurrentPositionAsync({});
    } catch {
      return null;
    }
  }

  async function verDetalleParada(parada) {
    mapRef.current?.animateToRegion(
      { latitude: parada.lat, longitude: parada.lng, latitudeDelta: 0.006, longitudeDelta: 0.006 },
      500
    );
    setParadaSeleccionada(parada);
    setModalVisible(true);
    setLoadingRutas(true);
    try {
      // Endpoint real: ParadaController@show ya devuelve ->load('rutas')
      const { data } = await api.get(`/paradas/${parada.id}`);
      setRutasDeParada(data.rutas ?? []);
    } catch (error) {
      setRutasDeParada([]);
    } finally {
      setLoadingRutas(false);
    }
  }

  function eliminarParada(parada) {
    Alert.alert('Confirmar', `¿Eliminar "${parada.nombre}"? Esto también la quitará de cualquier ruta.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/paradas/${parada.id}`);
            setParadas((prev) => prev.filter((p) => p.id !== parada.id));
          } catch (e) {
            Alert.alert('Error', 'No se pudo eliminar la parada.');
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView ref={mapRef} style={styles.map} showsUserLocation showsMyLocationButton={false} initialRegion={REGION_INICIAL}>
          {paradas.map((parada) => (
            <Marker key={parada.id} coordinate={{ latitude: parada.lat, longitude: parada.lng }} title={parada.nombre} />
          ))}
        </MapView>

        <SafeAreaView style={styles.backButtonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.ink} />
          </TouchableOpacity>
        </SafeAreaView>

        <TouchableOpacity style={styles.locateMeButton} onPress={cargarParadas}>
          <MaterialCommunityIcons name="crosshairs-gps" size={26} color={COLORS.primary} />
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity style={styles.addFab} onPress={() => navigation.navigate('ParadaForm')}>
            <MaterialCommunityIcons name="plus" size={22} color="#fff" />
            <Text style={styles.addFabText}>Nueva parada</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>{isAdmin ? 'Todas las paradas' : 'Paradas cercanas'}</Text>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <FlatList
            data={paradas}
            keyExtractor={(item) => String(item.id)}
            ListEmptyComponent={<Text style={styles.emptyText}>Aún no hay paradas registradas.</Text>}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.listItem} onPress={() => verDetalleParada(item)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.nombre}</Text>
                  {item.direccion ? <Text style={styles.itemSub}>{item.direccion}</Text> : null}
                </View>
                {item.distanciaKm != null && <Text style={styles.distanceText}>{formatearDistancia(item.distanciaKm)}</Text>}
                {isAdmin && (
                  <View style={styles.adminActions}>
                    <TouchableOpacity onPress={() => navigation.navigate('ParadaForm', { paradaId: item.id })} hitSlop={8}>
                      <MaterialCommunityIcons name="pencil-outline" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => eliminarParada(item)} hitSlop={8} style={{ marginLeft: 14 }}>
                      <MaterialCommunityIcons name="trash-can-outline" size={20} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{paradaSeleccionada?.nombre}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close-circle" size={28} color={COLORS.muted} />
              </TouchableOpacity>
            </View>

            {loadingRutas ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={rutasDeParada}
                keyExtractor={(item) => String(item.id)}
                ListEmptyComponent={<Text style={styles.emptyText}>Esta parada aún no está vinculada a ninguna ruta.</Text>}
                renderItem={({ item }) => (
                  <View style={styles.rutaCard}>
                    <MaterialCommunityIcons name="bus" size={24} color={COLORS.primary} />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.rutaNombre}>{item.nombre}</Text>
                      <Text style={styles.rutaFrecuencia}>
                        {item.origen} → {item.destino}
                      </Text>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  mapContainer: { flex: 0.45 },
  map: { width: '100%', height: '100%' },
  backButtonContainer: { position: 'absolute', top: 40, left: 16 },
  backButton: { width: 48, height: 48, backgroundColor: COLORS.surface, borderRadius: 24, justifyContent: 'center', alignItems: 'center', ...SHADOW.sm },
  locateMeButton: { position: 'absolute', bottom: 16, right: 16, width: 50, height: 50, backgroundColor: COLORS.surface, borderRadius: 25, justifyContent: 'center', alignItems: 'center', ...SHADOW.md },
  addFab: { position: 'absolute', top: 100, right: 16, backgroundColor: COLORS.primary, flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderRadius: RADIUS.pill, alignItems: 'center', ...SHADOW.md },
  addFabText: { color: '#fff', fontWeight: 'bold', marginLeft: 6 },

  listContainer: { flex: 0.55, padding: 20 },
  listTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: COLORS.ink },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  itemTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  itemSub: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  distanceText: { fontSize: 13, color: COLORS.muted, marginRight: 10 },
  adminActions: { flexDirection: 'row', alignItems: 'center' },
  emptyText: { textAlign: 'center', color: COLORS.muted, marginTop: 20 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(16,27,51,0.4)' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.ink },
  rutaCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, padding: 16, borderRadius: RADIUS.md, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  rutaNombre: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  rutaFrecuencia: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
});