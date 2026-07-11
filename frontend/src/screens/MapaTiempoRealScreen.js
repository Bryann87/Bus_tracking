import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import api from '../services/api';

const REGION_INICIAL = {
  latitude: -1.0546,
  longitude: -80.4547,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const POLLING_MS = 6000; // consulta la posición de los buses cada 6 segundos

export default function MapaTiempoRealScreen() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  async function cargarBuses() {
    try {
      const { data } = await api.get('/buses/activos');
      setBuses(data);
    } catch (e) {
      // se reintenta en el próximo ciclo de polling
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarBuses();
    intervalRef.current = setInterval(cargarBuses, POLLING_MS);
    return () => clearInterval(intervalRef.current);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1565C0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={REGION_INICIAL}>
        {buses.map((bus) => (
          <Marker
            key={bus.id}
            coordinate={{ latitude: Number(bus.latitud), longitude: Number(bus.longitud) }}
            pinColor={bus.en_linea ? '#2E7D32' : '#9E9E9E'}
          >
            <Callout>
              <View style={{ maxWidth: 180 }}>
                <Text style={{ fontWeight: 'bold' }}>🚍 {bus.placa}</Text>
                <Text>Ruta: {bus.ruta ?? 'Sin asignar'}</Text>
                <Text>{bus.en_linea ? 'En línea' : 'Sin señal reciente'}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🚌 {buses.length} bus(es) activo(s) · actualiza cada {POLLING_MS / 1000}s
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: { flex: 1 },
  footer: { padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  footerText: { textAlign: 'center', color: '#555', fontSize: 12 },
});
