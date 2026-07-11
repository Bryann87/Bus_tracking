import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen({ navigation }) {
  const [buses, setBuses] = useState([]);
  const { token, logout } = useAuth();

  const fetchBuses = async () => {
    try {
      const res = await fetch('http://192.168.0.8:8000/api/buses/activos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBuses(data);
    } catch (e) { console.log(e); }
  };

  useFocusEffect(useCallback(() => {
    fetchBuses();
    const interval = setInterval(fetchBuses, 5000);
    return () => clearInterval(interval);
  }, []));

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={{ latitude: -0.9550, longitude: -80.7200, latitudeDelta: 0.04, longitudeDelta: 0.04 }}>
        {buses.map(b => (
          <Marker key={b.id} coordinate={{ latitude: parseFloat(b.lat), longitude: parseFloat(b.lng) }} title={`Unidad ${b.id}`} pinColor="blue" />
        ))}
      </MapView>

      {/* Menú de Navegación inferior (Separado para no dañar el mapa) */}
      <View style={styles.menuBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Rutas')}><MaterialCommunityIcons name="bus" size={30} /></TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Paradas')}><MaterialCommunityIcons name="map-marker-radius" size={30} /></TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Reportes')}><MaterialCommunityIcons name="alert" size={30} /></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  menuBar: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, backgroundColor: 'white' }
});