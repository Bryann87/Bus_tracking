import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';

export default function AsignarParadasScreen({ navigation }) {
  const [rutas, setRutas] = useState([]);
  const [paradas, setParadas] = useState([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState('');
  
  // Guardaremos un arreglo con los IDs de las paradas en el orden que se seleccionan
  const [paradasAsignadas, setParadasAsignadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Obtenemos todas las rutas y paradas disponibles
      const [resRutas, resParadas] = await Promise.all([
        api.get('/rutas'),
        api.get('/paradas')
      ]);
      setRutas(resRutas.data);
      setParadas(resParadas.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos del servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Cada vez que cambie la ruta, idealmente deberíamos consultar las paradas que ya tiene asignadas
  const handleCambioRuta = async (rutaId) => {
    setRutaSeleccionada(rutaId);
    setParadasAsignadas([]); // Reseteamos visualmente por ahora
    
    if (!rutaId) return;

    try {
      setLoading(true);
      // Aquí el backend debería devolver las paradas actuales de esta ruta ordenadas
      const { data } = await api.get(`/rutas/${rutaId}/paradas`);
      // Suponiendo que el backend devuelve un array de IDs en orden: [1, 5, 3]
      const idsOrdenados = data.map(p => p.id_parada);
      setParadasAsignadas(idsOrdenados);
    } catch (e) {
      console.log('La ruta aún no tiene paradas o hubo un error');
    } finally {
      setLoading(false);
    }
  };

  const toggleParada = (paradaId) => {
    if (!rutaSeleccionada) {
      Alert.alert('Aviso', 'Primero selecciona una ruta en la parte superior.');
      return;
    }

    setParadasAsignadas(prev => {
      // Si la parada ya está en la lista, la quitamos (desmarcar)
      if (prev.includes(paradaId)) {
        return prev.filter(id => id !== paradaId);
      }
      // Si no está, la agregamos al final del recorrido
      return [...prev, paradaId];
    });
  };

  const guardarConfiguracion = async () => {
    if (!rutaSeleccionada) {
      Alert.alert('Aviso', 'Selecciona una ruta.');
      return;
    }
    
    if (paradasAsignadas.length === 0) {
      Alert.alert('Aviso', 'Debes asignar al menos una parada a la ruta.');
      return;
    }

    setGuardando(true);
    try {
      // Enviamos el array con el orden exacto. 
      // El backend se encargará de iterarlo y asignar orden_recorrido = index + 1
      await api.post(`/rutas/${rutaSeleccionada}/paradas`, {
        paradas: paradasAsignadas
      });
      Alert.alert('Éxito', 'Las paradas de esta ruta han sido actualizadas.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al guardar la configuración.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading && rutas.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1565C0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Selecciona la Ruta</Text>
      <View style={styles.pickerWrap}>
        <Picker 
          selectedValue={rutaSeleccionada} 
          onValueChange={handleCambioRuta}
        >
          <Picker.Item label="-- Elige una ruta --" value="" />
          {rutas.map(r => (
            <Picker.Item key={r.id} label={r.nombre} value={String(r.id)} />
          ))}
        </Picker>
      </View>

      <View style={styles.headerParadas}>
        <Text style={styles.label}>Paradas Disponibles</Text>
        <Text style={styles.subLabel}>Toca para añadir al recorrido en orden</Text>
      </View>

      <FlatList
        data={paradas}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          const indexOrden = paradasAsignadas.indexOf(String(item.id));
          const isSelected = indexOrden !== -1;

          return (
            <TouchableOpacity 
              style={[styles.paradaItem, isSelected && styles.paradaItemSelected]} 
              onPress={() => toggleParada(String(item.id))}
            >
              <View style={styles.paradaInfo}>
                <MaterialCommunityIcons 
                  name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"} 
                  size={24} 
                  color={isSelected ? "#1565C0" : "#94A3B8"} 
                />
                <Text style={[styles.paradaNombre, isSelected && styles.paradaNombreSelected]}>
                  {item.nombre}
                </Text>
              </View>
              
              {/* Si está seleccionada, mostramos qué número de parada es en la ruta */}
              {isSelected && (
                <View style={styles.badgeOrden}>
                  <Text style={styles.badgeText}>{indexOrden + 1}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity 
        style={[styles.botonGuardar, guardando && { backgroundColor: '#94A3B8' }]} 
        onPress={guardarConfiguracion} 
        disabled={guardando}
      >
        {guardando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botonTexto}>Guardar Recorrido</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  subLabel: { fontSize: 13, color: '#64748B', marginBottom: 16 },
  headerParadas: { marginTop: 24 },
  pickerWrap: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, overflow: 'hidden' },
  paradaItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  paradaItemSelected: { borderColor: '#1565C0', backgroundColor: '#EFF6FF' },
  paradaInfo: { flexDirection: 'row', alignItems: 'center' },
  paradaNombre: { fontSize: 16, marginLeft: 12, color: '#475569' },
  paradaNombreSelected: { color: '#1565C0', fontWeight: 'bold' },
  badgeOrden: { backgroundColor: '#1565C0', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  botonGuardar: { position: 'absolute', bottom: 20, left: 16, right: 16, backgroundColor: '#1565C0', padding: 16, borderRadius: 12, alignItems: 'center', elevation: 4 },
  botonTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});