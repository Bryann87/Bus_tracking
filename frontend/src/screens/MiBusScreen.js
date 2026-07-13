import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const INTERVALO_MS = 8000; // cada 8 segundos se envía la posición al backend

export default function MiBusScreen() {
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

      <TouchableOpacity onPress={logout} hitSlop={8}>
        <Text style={styles.headerLogout}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    let isMounted = true;

    api.get('/user')
      .then(({ data }) => {
        if (isMounted) {
          setBus(data.busAsignado ?? null);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (isMounted) {
          console.log('Error al cargar el bus:', error);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      detener();
    };
  }, []);

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
          <ActivityIndicator size="large" color="#1565C0" />
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
            backgroundColor: transmitiendo ? '#E8F5E9' : '#FFF3E0',
          },
        ]}
      >
        <Text
          style={{
            color: transmitiendo ? '#2E7D32' : '#EF6C00',
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
            backgroundColor: transmitiendo ? '#C62828' : '#1565C0',
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
        La app envía tu posición cada {INTERVALO_MS / 1000} segundos mientras esta
        pantalla esté activa.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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

  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },

  headerLogout: {
    color: '#C62828',
    fontWeight: '600',
    fontSize: 13,
  },

  aviso: {
    textAlign: 'center',
    color: '#777',
  },

  placa: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },

  subtitulo: {
    color: '#777',
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
    color: '#555',
    marginBottom: 4,
  },

  button: {
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignSelf: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  ayuda: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
});