import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import api from '../services/api';
import { useTheme } from '../theme/ThemeContext';

const REGION_INICIAL = {
  latitude: -0.9550,
  longitude: -80.7200,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function ParadaFormScreen({ navigation, route }) {
  const { colors: COLORS, radius: RADIUS, shadow: SHADOW } = useTheme();
  const styles = makeStyles(COLORS, RADIUS, SHADOW);

  const paradaId = route.params?.paradaId ?? null;

  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [coord, setCoord] = useState({
    latitude: REGION_INICIAL.latitude,
    longitude: REGION_INICIAL.longitude,
  });

  const [loading, setLoading] = useState(false);
  const [ubicando, setUbicando] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(!!paradaId);

  useEffect(() => {
    if (!paradaId) return;

    api
      .get(`/paradas/${paradaId}`)
      .then(({ data }) => {
        setNombre(data.nombre);
        setDireccion(data.direccion ?? '');
        setCoord({
          latitude: parseFloat(data.latitud),
          longitude: parseFloat(data.longitud),
        });
        setCargandoInicial(false);
      })
      .catch(() => {
        Alert.alert('Error', 'No se pudo cargar la parada.');
        setCargandoInicial(false);
      });
  }, [paradaId]);

  async function usarUbicacionActual() {
    setUbicando(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Activa el permiso de ubicación para usar esta opción.'
        );
        return;
      }

      const pos = await Location.getCurrentPositionAsync({});

      setCoord({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch (e) {
      Alert.alert('Error', 'No se pudo obtener tu ubicación actual.');
    } finally {
      setUbicando(false);
    }
  }

  async function guardar() {
    if (!nombre) {
      Alert.alert('Campo requerido', 'Ingresa el nombre de la parada.');
      return;
    }

    setLoading(true);

    const payload = {
      nombre,
      direccion,
      latitud: coord.latitude,
      longitud: coord.longitude,
    };

    try {
      if (paradaId) {
        await api.put(`/paradas/${paradaId}`, payload);
        Alert.alert('Listo', 'Parada actualizada correctamente.');
      } else {
        await api.post('/paradas', payload);
        Alert.alert('Listo', 'Parada registrada correctamente.');
      }

      navigation.goBack();
    } catch (error) {
      const data = error.response?.data;

      const validationError = data?.errors
        ? Object.values(data.errors)[0][0]
        : null;

      const mensaje =
        validationError ||
        data?.message ||
        'No se pudo guardar la parada.';

      Alert.alert('Error', mensaje);

      console.log(
        'Detalle del error:',
        error.response?.status,
        data
      );
    } finally {
      setLoading(false);
    }
  }

  function eliminar() {
    Alert.alert(
      'Confirmar',
      '¿Eliminar esta parada? También se quitará de cualquier ruta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/paradas/${paradaId}`);
              navigation.goBack();
            } catch {
              Alert.alert(
                'Error',
                'No se pudo eliminar la parada.'
              );
            }
          },
        },
      ]
    );
  }

  if (cargandoInicial) {
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>
        Nombre de la parada *
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ej. Parque Central"
        placeholderTextColor={COLORS.muted}
        value={nombre}
        onChangeText={setNombre}
      />

      <Text style={styles.label}>
        Dirección de referencia
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ej. Av. 3 y Calle 10"
        placeholderTextColor={COLORS.muted}
        value={direccion}
        onChangeText={setDireccion}
      />

      <Text style={styles.label}>
        Ubicación en el mapa (toca para marcar) *
      </Text>

      <MapView
        style={styles.map}
        region={{
          ...coord,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        onPress={(e) =>
          setCoord(e.nativeEvent.coordinate)
        }
      >
        <Marker
          coordinate={coord}
          draggable
          onDragEnd={(e) =>
            setCoord(e.nativeEvent.coordinate)
          }
        />
      </MapView>

      <TouchableOpacity
        style={styles.linkBtn}
        onPress={usarUbicacionActual}
        disabled={ubicando}
      >
        <Text style={styles.linkBtnText}>
          {ubicando
            ? 'Obteniendo ubicación...'
            : '📍 Usar mi ubicación actual (GPS)'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.coords}>
        Lat: {coord.latitude.toFixed(6)} Lng:{' '}
        {coord.longitude.toFixed(6)}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={guardar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {paradaId
              ? 'Guardar cambios'
              : 'Registrar parada'}
          </Text>
        )}
      </TouchableOpacity>

      {paradaId && (
        <TouchableOpacity
          style={styles.buttonEliminar}
          onPress={eliminar}
        >
          <Text style={styles.buttonEliminarText}>
            Eliminar parada
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function makeStyles(COLORS, RADIUS, SHADOW) {
  return StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: COLORS.surface,
      flexGrow: 1,
    },

    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.background,
    },

    label: {
      fontWeight: '600',
      color: COLORS.text,
      marginBottom: 6,
      marginTop: 12,
    },

    input: {
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: RADIUS.md,
      padding: 12,
      fontSize: 15,
      color: COLORS.text,
      backgroundColor: COLORS.background,
    },

    map: {
      width: '100%',
      height: 260,
      borderRadius: RADIUS.lg,
      marginTop: 4,
      overflow: 'hidden',
    },

    linkBtn: {
      marginTop: 10,
      alignItems: 'center',
    },

    linkBtnText: {
      color: COLORS.primary,
      fontWeight: '600',
    },

    coords: {
      textAlign: 'center',
      color: COLORS.faint,
      marginTop: 8,
      fontSize: 12,
    },

    button: {
      backgroundColor: COLORS.primary,
      borderRadius: RADIUS.md,
      padding: 16,
      alignItems: 'center',
      marginTop: 24,
      ...SHADOW.small,
    },

    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },

    buttonEliminar: {
      padding: 14,
      alignItems: 'center',
      marginTop: 12,
      marginBottom: 20,
    },

    buttonEliminarText: {
      color: COLORS.danger,
      fontWeight: 'bold',
    },
  });
}