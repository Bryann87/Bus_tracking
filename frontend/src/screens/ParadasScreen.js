import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator, Alert, Modal } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Importamos tu contexto de autenticación para verificar si es administrador
import { useAuth } from '../context/AuthContext';

// Coordenadas ajustadas a tierra firme en Jaramijó y Manta
const PARADAS_REALES = [
  { id: '1', nombre: 'Parque de Jaramijó', lat: -0.9465, lng: -80.6452 },
  { id: '2', nombre: 'Base Naval Jaramijó', lat: -0.9551, lng: -80.6305 },
  { id: '3', nombre: 'Terminal Terrestre Manta', lat: -0.9676, lng: -80.7008 },
  { id: '4', nombre: 'Mall del Pacífico', lat: -0.9440, lng: -80.7230 },
  { id: '5', nombre: 'Plaza Cívica Manta', lat: -0.9405, lng: -80.7200 }
];

const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function ParadasScreen({ navigation }) {
  const { user } = useAuth(); // Obtenemos el usuario activo
  
  const [location, setLocation] = useState(null);
  const [paradasConDistancia, setParadasConDistancia] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el detalle de la parada
  const [paradaSeleccionada, setParadaSeleccionada] = useState(null);
  const [rutasDeParada, setRutasDeParada] = useState([]);
  const [loadingRutas, setLoadingRutas] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  const mapRef = useRef(null);

  useEffect(() => {
    obtenerUbicacionYCalcular();
  }, []);

  const obtenerUbicacionYCalcular = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'No se puede acceder a la ubicación para calcular distancias.');
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      const userLat = currentLocation.coords.latitude;
      const userLng = currentLocation.coords.longitude;
      setLocation(currentLocation.coords);

      const paradasCalculadas = PARADAS_REALES.map(parada => {
        const dist = calcularDistancia(userLat, userLng, parada.lat, parada.lng);
        return { ...parada, distanciaKm: dist };
      }).sort((a, b) => a.distanciaKm - b.distanciaKm);

      setParadasConDistancia(paradasCalculadas);
      centrarEnMiUbicacion(userLat, userLng);
      
    } catch (error) {
      console.log('Error obteniendo ubicación: ', error);
      Alert.alert('Error', 'Hubo un problema al cargar tu ubicación.');
    } finally {
      setLoading(false);
    }
  };

  const centrarEnMiUbicacion = async (lat, lng) => {
    if (lat && lng && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 1000);
      return;
    }
    try {
      let pos = await Location.getCurrentPositionAsync({});
      mapRef.current?.animateToRegion({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 1000);
    } catch (e) {
      console.log(e);
    }
  };

  const formatearDistancia = (distanciaKm) => {
    return distanciaKm < 1 ? `${Math.round(distanciaKm * 1000)} m` : `${distanciaKm.toFixed(1)} km`;
  };

  const verDetalleParada = async (parada) => {
    // 1. Centramos el mapa en la parada que tocó el usuario
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: parada.lat,
        longitude: parada.lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
    
    // 2. Abrimos el modal
    setParadaSeleccionada(parada);
    setModalVisible(true);
    setLoadingRutas(true);

    try {
      // --- SIMULACIÓN TEMPORAL (Reemplazarás con api.get() más adelante) ---
      setTimeout(() => {
        setRutasDeParada([
          { id: 1, nombre: 'Línea 1 - Centro', frecuencia: '15 min', proximo: '5 min' },
          { id: 2, nombre: 'Línea 3 - ULEAM', frecuencia: '20 min', proximo: '12 min' }
        ]);
        setLoadingRutas(false);
      }, 800);
    } catch (error) {
      console.log('Error cargando rutas', error);
      setLoadingRutas(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. SECCIÓN DEL MAPA (¡La que faltaba!) */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          showsUserLocation={true}
          showsMyLocationButton={false}
          initialRegion={{
            latitude: -0.9465,
            longitude: -80.6452,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
        >
          {paradasConDistancia.map(parada => (
            <Marker
              key={parada.id}
              coordinate={{ latitude: parada.lat, longitude: parada.lng }}
              title={parada.nombre}
            />
          ))}
        </MapView>
        
        {/* Botón de Atrás sobre el mapa */}
        <SafeAreaView style={styles.backButtonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Botón Flotante para Ubicarme */}
        <TouchableOpacity style={styles.locateMeButton} onPress={() => centrarEnMiUbicacion()}>
          <MaterialCommunityIcons name="crosshairs-gps" size={26} color="#0284C7" />
        </TouchableOpacity>
      </View>

      {/* 2. SECCIÓN DE LA LISTA DE PARADAS */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Paradas cercanas</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0284C7" />
        ) : (
          <FlatList
            data={paradasConDistancia}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.listItem} onPress={() => verDetalleParada(item)}>
                <Text style={styles.itemTitle}>{item.nombre}</Text>
                <Text style={styles.distanceText}>{formatearDistancia(item.distanciaKm)}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* 3. BOTÓN EXCLUSIVO DEL ADMINISTRADOR */}
      {user?.role === 'admin' && (
        <TouchableOpacity 
          style={styles.adminFab} 
          onPress={() => navigation.navigate('AsignarParadas')}
        >
          <MaterialCommunityIcons name="map-marker-path" size={24} color="#FFF" />
          <Text style={styles.adminFabText}>Vincular Ruta</Text>
        </TouchableOpacity>
      )}

      {/* 4. MODAL DEL PASAJERO CON LAS LÍNEAS DE BUSES */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{paradaSeleccionada?.nombre}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close-circle" size={28} color="#64748B" />
              </TouchableOpacity>
            </View>

            {loadingRutas ? (
              <ActivityIndicator size="large" color="#0284C7" style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={rutasDeParada}
                keyExtractor={(item) => String(item.id)}
                ListEmptyComponent={<Text style={styles.emptyText}>No hay rutas registradas para esta parada.</Text>}
                renderItem={({ item }) => (
                  <View style={styles.rutaCard}>
                    <View style={styles.rutaInfo}>
                      <MaterialCommunityIcons name="bus" size={24} color="#0284C7" />
                      <View style={{ marginLeft: 12 }}>
                        <Text style={styles.rutaNombre}>{item.nombre}</Text>
                        <Text style={styles.rutaFrecuencia}>Pasa cada {item.frecuencia}</Text>
                      </View>
                    </View>
                    <View style={styles.rutaLlegada}>
                      <Text style={styles.llegadaLabel}>Próximo en</Text>
                      <Text style={styles.llegadaTiempo}>{item.proximo}</Text>
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  mapContainer: { flex: 0.45 }, // Esto reserva el 45% de la pantalla para el mapa
  map: { width: '100%', height: '100%' },
  backButtonContainer: { position: 'absolute', top: 40, left: 16 },
  backButton: { width: 48, height: 48, backgroundColor: '#FFF', borderRadius: 24, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  locateMeButton: { position: 'absolute', bottom: 16, right: 16, width: 50, height: 50, backgroundColor: '#FFF', borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  
  listContainer: { flex: 0.55, padding: 20 },
  listTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  itemTitle: { fontSize: 16, fontWeight: '600' },
  distanceText: { fontSize: 14, color: '#666' },

  // Estilos del botón de Admin
  adminFab: { position: 'absolute', top: 100, right: 16, backgroundColor: '#1565C0', flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, alignItems: 'center', elevation: 5 },
  adminFabText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 },

  // Estilos del Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 20 },
  rutaCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  rutaInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rutaNombre: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  rutaFrecuencia: { fontSize: 13, color: '#64748B', marginTop: 2 },
  rutaLlegada: { alignItems: 'flex-end' },
  llegadaLabel: { fontSize: 12, color: '#64748B' },
  llegadaTiempo: { fontSize: 16, fontWeight: 'bold', color: '#10B981' }
});