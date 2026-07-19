import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';

const INTERVALO_MS = 8000; // cada 8 segundos se envía la posición al backend

export default function MiBusScreen() {
  const { colors: COLORS, isDark, toggleTheme } = useTheme();
  const styles = makeStyles(COLORS);

  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transmitiendo, setTransmitiendo] = useState(false);
  const [ultimaUbicacion, setUltimaUbicacion] = useState(null);

  const { logout } = useAuth();

  const watchSubscription = useRef(null);
  const intervalRef = useRef(null);
  const ultimaPosicion = useRef(null);

  const Header = () => (
    <View style={styles.headerBar}>
      <Text style={styles.headerTitle}>Mi bus</Text>

      <View style={styles.headerActions}>
        <TouchableOpacity onPress={toggleTheme} hitSlop={8}>
          <MaterialCommunityIcons
            name={isDark ? 'white-balance-sunny' : 'moon-waning-crescent'}
            size={18}
            color={COLORS.text}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={logout} hitSlop={8}>
          <Text style={styles.headerLogout}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      setLoading(true);

      api
        .get('/user')
        .then(({ data }) => {
          console.log('=== RESPUESTA /user ===', JSON.stringify(data, null, 2));

          if (isMounted) {
            setBus(data.bus_asignado ?? null);
            setLoading(false);
          }
        })
        .catch((error) => {
          console.log(
            '=== ERROR al pedir /user ===',
            error?.response?.status,
            error?.response?.data ?? error.message
          );

          if (isMounted) {
            setLoading(false);
          }
        });

      return () => {
        isMounted = false;
        detener();
      };
    }, [])
  );

  async function iniciarTransmision() {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permiso denegado',
        'Se necesita acceso a la ubicación para transmitir la posición del bus.'
      );
      return;
    }

    watchSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 4000,
        distanceInterval: 5,
      },
      (pos) => {
        ultimaPosicion.current = pos;
        setUltimaUbicacion(pos);
      }
    );

    intervalRef.current = setInterval(async () => {
      if (!ultimaPosicion.current || !bus) return;

      const { latitude, longitude, speed, heading } =
        ultimaPosicion.current.coords;

      try {
        await api.post(`/buses/${bus.id}/ubicacion`, {
          latitud: latitude,
          longitud: longitude,
          velocidad: speed ?? null,
          heading: heading ?? null,
        });
      } catch (e) {
        console.log(
          'Fallo al enviar ubicación, reintentando en el próximo ciclo...',
          e
        );
      }
    }, INTERVALO_MS);

    setTransmitiendo(true);
  }

  function detener() {
    if (watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTransmitiendo(false);
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />

        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  if (!bus) {
    return (
      <View style={styles.container}>
        <Header />

        <View style={styles.center}>
          <Text style={styles.aviso}>
            Todavía no tienes un bus asignado. Contacta al administrador.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      <Text style={styles.placa}>🚍 {bus.placa}</Text>
      <Text style={styles.subtitulo}>{bus.modelo}</Text>

      <View
        style={[
          styles.estadoBox,
          {
            backgroundColor: transmitiendo
              ? COLORS.successBg
              : COLORS.warningBg,
          },
        ]}
      >
        <Text
          style={{
            color: transmitiendo ? COLORS.success : COLORS.warning,
            fontWeight: 'bold',
          }}
        >
          {transmitiendo
            ? '🟢 Transmitiendo ubicación en vivo'
            : '🟠 Transmisión detenida'}
        </Text>
      </View>

      {ultimaUbicacion && (
        <View style={styles.datos}>
          <Text style={styles.dato}>
            Lat: {ultimaUbicacion.coords.latitude.toFixed(6)}
          </Text>

          <Text style={styles.dato}>
            Lng: {ultimaUbicacion.coords.longitude.toFixed(6)}
          </Text>

          <Text style={styles.dato}>
            Velocidad:{' '}
            {ultimaUbicacion.coords.speed
              ? `${ultimaUbicacion.coords.speed.toFixed(1)} m/s`
              : '—'}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: transmitiendo
              ? COLORS.danger
              : COLORS.primary,
          },
        ]}
        onPress={transmitiendo ? detener : iniciarTransmision}
      >
        <Text style={styles.buttonText}>
          {transmitiendo
            ? 'Detener transmisión'
            : 'Iniciar transmisión GPS'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.ayuda}>
        La app envía tu posición cada {INTERVALO_MS / 1000} segundos mientras
        esta pantalla esté activa.
      </Text>
    </View>
  );
}

function makeStyles(COLORS) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
      padding: 20,
    },

    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    headerBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: 4,
      marginBottom: 20,
    },

    headerActions: {
      flexDirection: 'row',
      gap: 16,
      alignItems: 'center',
    },

    headerTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: COLORS.muted,
      textTransform: 'uppercase',
    },

    headerLogout: {
      color: COLORS.danger,
      fontWeight: '600',
      fontSize: 13,
    },

    aviso: {
      textAlign: 'center',
      color: COLORS.muted,
    },

    placa: {
      fontSize: 26,
      fontWeight: 'bold',
      color: COLORS.text,
      textAlign: 'center',
    },

    subtitulo: {
      color: COLORS.muted,
      marginTop: 4,
      marginBottom: 20,
      textAlign: 'center',
    },

    estadoBox: {
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 20,
      marginBottom: 20,
      alignSelf: 'center',
    },

    datos: {
      alignItems: 'center',
      marginBottom: 20,
    },

    dato: {
      color: COLORS.text,
      marginBottom: 4,
    },

    button: {
      paddingVertical: 16,
      paddingHorizontal: 30,
      borderRadius: 10,
      alignSelf: 'center',
    },

    buttonText: {
      color: COLORS.onPrimary,
      fontWeight: 'bold',
      fontSize: 15,
    },

    ayuda: {
      color: COLORS.faint,
      fontSize: 12,
      textAlign: 'center',
      marginTop: 20,
    },
  });
}