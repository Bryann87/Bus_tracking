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

const REGION_INICIAL = { latitude: -0.9550, longitude: -80.7200, latitudeDelta: 0.05, longitudeDelta: 0.05 };

export default function ParadaFormScreen({ navigation, route }) {
  const paradaId = route.params?.paradaId ?? null;

  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [coord, setCoord] = useState({ latitude: REGION_INICIAL.latitude, longitude: REGION_INICIAL.longitude });
  const [loading, setLoading] = useState(false);
  const [ubicando, setUbicando] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(!!paradaId);

  useEffect(() => {
    if (!paradaId) return;
    api.get(`/paradas/${paradaId}`).then(({ data }) => {
      setNombre(data.nombre);
      setDireccion(data.direccion ?? '');
      setCoord({ latitude: parseFloat(data.latitud), longitude: parseFloat(data.longitud) });
      setCargandoInicial(false);
    }).catch(() => {
      Alert.alert('Error', 'No se pudo cargar la parada.');
      setCargandoInicial(false);
    });
  }, [paradaId]);

  async function usarUbicacionActual() {
    setUbicando(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Activa el permiso de ubicación para usar esta opción.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setCoord({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
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
    const payload = { nombre, direccion, latitud: coord.latitude, longitud: coord.longitude };
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
      const errors = error.response?.data?.errors;
      const firstError = errors ? Object.values(errors)[0][0] : null;
      Alert.alert('Error', firstError || 'No se pudo guardar la parada.');
    } finally {
      setLoading(false);
    }
  }

  function eliminar() {
    Alert.alert('Confirmar', '¿Eliminar esta parada? También se quitará de cualquier ruta.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await api.delete(`/paradas/${paradaId}`);
          navigation.goBack();
        },
      },
    ]);
  }

  if (cargandoInicial) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1565C0" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nombre de la parada *</Text>
      <TextInput style={styles.input} placeholder="Ej. Parque Central" value={nombre} onChangeText={setNombre} />

      <Text style={styles.label}>Dirección de referencia</Text>
      <TextInput style={styles.input} placeholder="Ej. Av. 3 y Calle 10" value={direccion} onChangeText={setDireccion} />

      <Text style={styles.label}>Ubicación en el mapa (toca para marcar) *</Text>
      <MapView style={styles.map} region={{ ...coord, latitudeDelta: 0.02, longitudeDelta: 0.02 }} onPress={(e) => setCoord(e.nativeEvent.coordinate)}>
        <Marker coordinate={coord} draggable onDragEnd={(e) => setCoord(e.nativeEvent.coordinate)} />
      </MapView>

      <TouchableOpacity style={styles.linkBtn} onPress={usarUbicacionActual} disabled={ubicando}>
        <Text style={styles.linkBtnText}>{ubicando ? 'Obteniendo ubicación...' : '📍 Usar mi ubicación actual (GPS)'}</Text>
      </TouchableOpacity>

      <Text style={styles.coords}>Lat: {coord.latitude.toFixed(6)}  Lng: {coord.longitude.toFixed(6)}</Text>

      <TouchableOpacity style={styles.button} onPress={guardar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{paradaId ? 'Guardar cambios' : 'Registrar parada'}</Text>}
      </TouchableOpacity>

      {paradaId && (
        <TouchableOpacity style={styles.buttonEliminar} onPress={eliminar}>
          <Text style={styles.buttonEliminarText}>Eliminar parada</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15 },
  map: { width: '100%', height: 260, borderRadius: 12, marginTop: 4 },
  linkBtn: { marginTop: 10, alignItems: 'center' },
  linkBtnText: { color: '#1565C0', fontWeight: '600' },
  coords: { textAlign: 'center', color: '#999', marginTop: 8, fontSize: 12 },
  button: { backgroundColor: '#1565C0', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  buttonEliminar: { padding: 14, alignItems: 'center', marginTop: 12, marginBottom: 20 },
  buttonEliminarText: { color: '#C62828', fontWeight: 'bold' },
});