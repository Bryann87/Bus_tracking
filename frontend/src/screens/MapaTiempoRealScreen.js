import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import MapView, {
  Marker,
  Callout,
} from 'react-native-maps';
import api from '../services/api';
import { useTheme } from '../theme/ThemeContext';

const REGION_INICIAL = {
  latitude: -1.0546,
  longitude: -80.4547,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const POLLING_MS = 6000; // consulta la posición de los buses cada 6 segundos

export default function MapaTiempoRealScreen() {
  const { colors: COLORS, radius: RADIUS, shadow: SHADOW } =
    useTheme();

  const styles = makeStyles(
    COLORS,
    RADIUS,
    SHADOW
  );

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  const intervalRef = useRef(null);

  async function cargarBuses() {
    try {
      const { data } = await api.get(
        '/buses/activos'
      );

      setBuses(data);
    } catch (e) {
      // Se reintenta automáticamente en el siguiente ciclo
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarBuses();

    intervalRef.current = setInterval(
      cargarBuses,
      POLLING_MS
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={REGION_INICIAL}
      >
        {buses.map((bus) => (
          <Marker
            key={bus.id}
            coordinate={{
              latitude: Number(bus.latitud),
              longitude: Number(bus.longitud),
            }}
            pinColor={
              bus.en_linea
                ? '#2E7D32'
                : '#9E9E9E'
            }
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>
                  🚍 {bus.placa}
                </Text>

                <Text style={styles.calloutText}>
                  Ruta:{' '}
                  {bus.ruta ?? 'Sin asignar'}
                </Text>

                <Text style={styles.calloutText}>
                  {bus.en_linea
                    ? 'En línea'
                    : 'Sin señal reciente'}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🚌 {buses.length} bus(es) activo(s) ·
          actualiza cada {POLLING_MS / 1000}s
        </Text>
      </View>
    </View>
  );
}

function makeStyles(COLORS, RADIUS, SHADOW) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },

    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.background,
    },

    map: {
      flex: 1,
    },

    footer: {
      padding: 10,
      backgroundColor: COLORS.surface,
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
    },

    footerText: {
      textAlign: 'center',
      color: COLORS.muted,
      fontSize: 12,
    },

    callout: {
      maxWidth: 180,
    },

    calloutTitle: {
      fontWeight: 'bold',
      color: COLORS.text,
      marginBottom: 2,
    },

    calloutText: {
      color: COLORS.text,
    },
  });
}