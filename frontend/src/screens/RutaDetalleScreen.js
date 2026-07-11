import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function RutaDetalleScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      // 1. Pedir permisos de ubicación al usuario
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permiso de ubicación denegado');
        return;
      }

      // 2. Obtener la ubicación actual para centrar el mapa al inicio
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    })();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Aquí va tu código actual (Título de Ruta, Tarifa, etc.) */}
      <Text style={styles.title}>Ruta 1 - Centro / Andrés de Vera</Text>

      {/* Contenedor del Mapa */}
      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.015, // Qué tan cerca está el zoom (ajusta a tu gusto)
              longitudeDelta: 0.015,
            }}
            showsUserLocation={true} // MAGIA: Muestra el punto azul en tiempo real
            showsMyLocationButton={true} // Botón para volver a centrar
          >
            {/* Opcional: Aquí puedes agregar Markers fijos para las paradas */}
            {/* <Marker coordinate={{ latitude: -1.0456, longitude: -80.4626 }} title="Parque Central" /> */}
          </MapView>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0056b3" />
            <Text>Obteniendo ubicación...</Text>
          </View>
        )}
      </View>

      {/* Aquí continúa tu código actual (Lista de paradas, Buses asignados, etc.) */}
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 15,
  },
  mapContainer: {
    height: 250, // Altura del mapa en la pantalla
    marginHorizontal: 15,
    borderRadius: 10,
    overflow: 'hidden', // Para que los bordes redondeados apliquen al mapa
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});