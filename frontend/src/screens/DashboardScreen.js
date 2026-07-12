import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Importamos tu cliente configurado y el contexto de autenticación
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen({ navigation }) {
  const [buses, setBuses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Extraemos la función logout del contexto
  const { logout } = useAuth();

  const fetchBuses = async () => {
    try {
      const { data } = await api.get('/buses/activos');
      setBuses(data);
    } catch (e) { 
      console.log('Error al obtener los buses:', e); 
    }
  };

  useFocusEffect(useCallback(() => {
    fetchBuses();
    const interval = setInterval(fetchBuses, 5000);
    return () => clearInterval(interval);
  }, []));

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        initialRegion={{ latitude: -0.9550, longitude: -80.7200, latitudeDelta: 0.04, longitudeDelta: 0.04 }}
      >
        {buses.map(b => (
          <Marker 
            key={b.id} 
            coordinate={{ latitude: parseFloat(b.lat), longitude: parseFloat(b.lng) }} 
            title={`Unidad ${b.id}`} 
            pinColor="blue" 
          />
        ))}
      </MapView>

      {/* Header superior con Barra de Búsqueda y Botón de Cerrar Sesión */}
      <SafeAreaView style={styles.topHeader}>
        <View style={styles.headerContent}>
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={24} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar lugares o paradas..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <MaterialCommunityIcons name="logout" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Menú de Navegación inferior */}
      <View style={styles.menuBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Rutas')}>
          <MaterialCommunityIcons name="bus" size={30} color="#0284C7" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Paradas')}>
          <MaterialCommunityIcons name="map-marker-radius" size={30} color="#0284C7" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Reportes')}>
          <MaterialCommunityIcons name="alert" size={30} color="#0284C7" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  topHeader: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 50,
    width: '100%',
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1E293B',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    padding: 20, 
    backgroundColor: 'white',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  }
});