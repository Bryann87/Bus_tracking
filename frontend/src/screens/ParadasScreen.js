import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, SafeAreaView, Platform, FlatList, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- BASE DE DATOS DE PARADAS EN MANTA (AJUSTADAS A TIERRA) ---
const PARADAS_REALES = [
  { id: '1', nombre: 'Parada ULEAM', lat: -0.9535, lng: -80.7445 },
  { id: '2', nombre: 'Terminal Terrestre', lat: -0.9676, lng: -80.7008 },
  { id: '3', nombre: 'Mall del Pacífico', lat: -0.9429, lng: -80.7241 },
  { id: '4', nombre: 'Mercado Central', lat: -0.9412, lng: -80.7215 },
  { id: '5', nombre: 'Plaza Cívica', lat: -0.9398, lng: -80.7208 }
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
  const [location, setLocation] = useState(null);
  const [paradasConDistancia, setParadasConDistancia] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const mapRef = useRef(null);

  useEffect(() => {
    obtenerUbicacionYCalcular();
  }, []);

  const obtenerUbicacionYCalcular = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLoading(false);
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    const userLat = currentLocation.coords.latitude;
    const userLng = currentLocation.coords.longitude;
    setLocation(currentLocation.coords);

    const paradasCalculadas = PARADAS_MANTA.map(parada => {
      const dist = calcularDistancia(userLat, userLng, parada.lat, parada.lng);
      return { ...parada, distanciaKm: dist };
    }).sort((a, b) => a.distanciaKm - b.distanciaKm);

    setParadasConDistancia(paradasCalculadas);
    setLoading(false);
  };

  const formatearDistancia = (distanciaKm) => {
    return distanciaKm < 1 ? `${Math.round(distanciaKm * 1000)} m` : `${distanciaKm.toFixed(1)} km`;
  };

  const verEnMapa = (parada) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: parada.lat,
        longitude: parada.lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          showsUserLocation={true}
          showsMyLocationButton={false}
          initialRegion={{
            latitude: -0.9550,
            longitude: -80.7200,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
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
        <SafeAreaView style={styles.backButtonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Paradas cercanas</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0284C7" />
        ) : (
          <FlatList
            data={paradasConDistancia}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.listItem} onPress={() => verEnMapa(item)}>
                <Text style={styles.itemTitle}>{item.nombre}</Text>
                <Text style={styles.distanceText}>{formatearDistancia(item.distanciaKm)}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  mapContainer: { flex: 0.45 },
  map: { width: '100%', height: '100%' },
  backButtonContainer: { position: 'absolute', top: 40, left: 16 },
  backButton: { width: 48, height: 48, backgroundColor: '#FFF', borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  listContainer: { flex: 0.55, padding: 20 },
  listTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  itemTitle: { fontSize: 16, fontWeight: '600' },
  distanceText: { fontSize: 14, color: '#666' }
});