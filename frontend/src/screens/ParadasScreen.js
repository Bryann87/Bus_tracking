import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator, Alert, Modal } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api'; // Necesitaremos tu API para consultar las rutas

// ... (Mantenemos tus funciones calcularDistancia y la constante PARADAS_REALES) ...

export default function ParadasScreen({ navigation }) {
  const [paradasConDistancia, setParadasConDistancia] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- NUEVOS ESTADOS PARA EL DETALLE DE LA PARADA ---
  const [paradaSeleccionada, setParadaSeleccionada] = useState(null);
  const [rutasDeParada, setRutasDeParada] = useState([]);
  const [loadingRutas, setLoadingRutas] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  const mapRef = useRef(null);

  // ... (Mantenemos tu useEffect y obtenerUbicacionYCalcular) ...

  const verDetalleParada = async (parada) => {
    // 1. Centramos el mapa
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: parada.lat,
        longitude: parada.lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
    
    // 2. Abrimos el modal y mostramos estado de carga
    setParadaSeleccionada(parada);
    setModalVisible(true);
    setLoadingRutas(true);

    try {
      // 3. Consultamos al backend las rutas que pasan por esta parada
      // const { data } = await api.get(`/paradas/${parada.id}/rutas`);
      // setRutasDeParada(data);

      // --- SIMULACIÓN TEMPORAL DE RESPUESTA DEL BACKEND ---
      setTimeout(() => {
        setRutasDeParada([
          { id: 1, nombre: 'Línea 1 - Centro', frecuencia: '15 min', proximo: '5 min' },
          { id: 2, nombre: 'Línea 3 - ULEAM', frecuencia: '20 min', proximo: '12 min' }
        ]);
        setLoadingRutas(false);
      }, 800);

    } catch (error) {
      console.log('Error cargando rutas', error);
      setLoadingRutas(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ... (Mantenemos el MapView y los botones flotantes) ... */}

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Paradas cercanas</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0284C7" />
        ) : (
          <FlatList
            data={paradasConDistancia}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              // ACTUALIZACIÓN: Al tocar, llamamos a verDetalleParada
              <TouchableOpacity style={styles.listItem} onPress={() => verDetalleParada(item)}>
                <Text style={styles.itemTitle}>{item.nombre}</Text>
                <Text style={styles.distanceText}>{formatearDistancia(item.distanciaKm)}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* --- MODAL DE DETALLE DE RUTAS --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{paradaSeleccionada?.nombre}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close-circle" size={28} color="#64748B" />
              </TouchableOpacity>
            </View>

            {loadingRutas ? (
              <ActivityIndicator size="large" color="#0284C7" style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={rutasDeParada}
                keyExtractor={(item) => String(item.id)}
                ListEmptyComponent={<Text style={styles.emptyText}>No hay rutas registradas para esta parada.</Text>}
                renderItem={({ item }) => (
                  <View style={styles.rutaCard}>
                    <View style={styles.rutaInfo}>
                      <MaterialCommunityIcons name="bus" size={24} color="#0284C7" />
                      <View style={{ marginLeft: 12 }}>
                        <Text style={styles.rutaNombre}>{item.nombre}</Text>
                        <Text style={styles.rutaFrecuencia}>Pasa cada {item.frecuencia}</Text>
                      </View>
                    </View>
                    <View style={styles.rutaLlegada}>
                      <Text style={styles.llegadaLabel}>Próximo en</Text>
                      <Text style={styles.llegadaTiempo}>{item.proximo}</Text>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  // ... (Tus estilos anteriores) ...
  
  // Estilos del Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 20 },
  rutaCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  rutaInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rutaNombre: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  rutaFrecuencia: { fontSize: 13, color: '#64748B', marginTop: 2 },
  rutaLlegada: { alignItems: 'flex-end' },
  llegadaLabel: { fontSize: 12, color: '#64748B' },
  llegadaTiempo: { fontSize: 16, fontWeight: 'bold', color: '#10B981' }
});