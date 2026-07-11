import React, { useState } from 'react';
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

// Portoviejo, Ecuador (centro por defecto del mapa)
const REGION_INICIAL = {
  latitude: -1.0546,
  longitude: -80.4547,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function ParadaFormScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [coord, setCoord] = useState({ latitude: REGION_INICIAL.latitude, longitude: REGION_INICIAL.longitude });
  const [loading, setLoading] = useState(false);
  const [ubicando, setUbicando] = useState(false);

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
    try {
      await api.post('/paradas', {
        nombre,
        direccion,
        latitud: coord.latitude,
        longitud: coord.longitude,
      });
      Alert.alert('Listo', 'Parada registrada correctamente.');
      navigation.goBack();
    } catch (error) {
      const errors = error.response?.data?.errors;
      const firstError = errors ? Object.values(errors)[0][0] : null;
      Alert.alert('Error', firstError || 'No se pudo registrar la parada.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nombre de la parada *</Text>
      <TextInput style={styles.input} placeholder="Ej. Parque Central" value={nombre} onChangeText={setNombre} />

      <Text style={styles.label}>Dirección de referencia</Text>
      <TextInput style={styles.input} placeholder="Ej. Av. 3 y Calle 10" value={direccion} onChangeText={setDireccion} />

      <Text style={styles.label}>Ubicación en el mapa (toca para marcar) *</Text>
      <MapView
        style={styles.map}
        initialRegion={REGION_INICIAL}
        onPress={(e) => setCoord(e.nativeEvent.coordinate)}
      >
        <Marker coordinate={coord} draggable onDragEnd={(e) => setCoord(e.nativeEvent.coordinate)} />
      </MapView>

      <TouchableOpacity style={styles.linkBtn} onPress={usarUbicacionActual} disabled={ubicando}>
        <Text style={styles.linkBtnText}>
          {ubicando ? 'Obteniendo ubicación...' : '📍 Usar mi ubicación actual (GPS)'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.coords}>
        Lat: {coord.latitude.toFixed(6)}  Lng: {coord.longitude.toFixed(6)}
      </Text>

      <TouchableOpacity style={styles.button} onPress={guardar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registrar parada</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  label: { fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15 },
  map: { width: '100%', height: 260, borderRadius: 12, marginTop: 4 },
  linkBtn: { marginTop: 10, alignItems: 'center' },
  linkBtnText: { color: '#1565C0', fontWeight: '600' },
  coords: { textAlign: 'center', color: '#999', marginTop: 8, fontSize: 12 },
  button: { backgroundColor: '#1565C0', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 24, marginBottom: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
