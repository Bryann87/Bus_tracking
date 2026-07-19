import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';
import { useTheme } from '../theme/ThemeContext';

export default function AsignarParadasScreen({ navigation, route }) {
  const { colors: COLORS, radius: RADIUS, shadow: SHADOW } = useTheme();
  const styles = makeStyles(COLORS, RADIUS, SHADOW);

  const rutaIdParam = route?.params?.rutaId ? String(route.params.rutaId) : '';

  const [rutas, setRutas] = useState([]);
  const [paradas, setParadas] = useState([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState(rutaIdParam);
  const [paradasAsignadas, setParadasAsignadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => { cargarDatos(); }, []);
  useEffect(() => { if (rutaIdParam) handleCambioRuta(rutaIdParam); }, [rutaIdParam]);

  const cargarDatos = async () => {
    try {
      const [resRutas, resParadas] = await Promise.all([api.get('/rutas'), api.get('/paradas')]);
      setRutas(resRutas.data);
      setParadas(resParadas.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos del servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleCambioRuta = async (rutaId) => {
    setRutaSeleccionada(String(rutaId));
    setParadasAsignadas([]);
    if (!rutaId) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/rutas/${rutaId}/paradas`);
      const idsOrdenados = data.map((p) => String(p.id_parada ?? p.id));
      setParadasAsignadas(idsOrdenados);
    } catch (e) {
      console.log('La ruta aún no tiene paradas o hubo un error', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleParada = (paradaId) => {
    if (!rutaSeleccionada) {
      Alert.alert('Aviso', 'Primero selecciona una ruta en la parte superior.');
      return;
    }
    setParadasAsignadas((prev) => (prev.includes(paradaId) ? prev.filter((id) => id !== paradaId) : [...prev, paradaId]));
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
      await api.post(`/rutas/${rutaSeleccionada}/paradas`, { paradas: paradasAsignadas });
      Alert.alert('Éxito', 'Las paradas de esta ruta han sido actualizadas.');
      navigation.goBack();
    } catch (error) {
      const data = error.response?.data;
      const validationError = data?.errors ? Object.values(data.errors)[0][0] : null;
      Alert.alert('Error', validationError || data?.message || 'Hubo un problema al guardar la configuración.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading && rutas.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Selecciona la Ruta</Text>

      <View style={styles.pickerWrap}>
        <Picker selectedValue={rutaSeleccionada} onValueChange={handleCambioRuta}>
          <Picker.Item label="-- Elige una ruta --" value="" />
          {rutas.map((r) => <Picker.Item key={r.id} label={r.nombre} value={String(r.id)} />)}
        </Picker>
      </View>

      <View style={styles.headerParadas}>
        <Text style={styles.label}>Paradas Disponibles</Text>
        <Text style={styles.subLabel}>Toca para añadir al recorrido en orden</Text>
      </View>

      <FlatList
        data={paradas}
        keyExtractor={(item) => String(item.id)}
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
                  name={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={24}
                  color={isSelected ? COLORS.primary : COLORS.faint}
                />
                <Text style={[styles.paradaNombre, isSelected && styles.paradaNombreSelected]}>{item.nombre}</Text>
              </View>
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
        style={[styles.botonGuardar, guardando && { backgroundColor: COLORS.faint }]}
        onPress={guardarConfiguracion}
        disabled={guardando}
      >
        {guardando ? <ActivityIndicator color={COLORS.onPrimary} /> : <Text style={styles.botonTexto}>Guardar Recorrido</Text>}
      </TouchableOpacity>
    </View>
  );
}

function makeStyles(COLORS, RADIUS, SHADOW) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    label: { fontSize: 16, fontWeight: 'bold', color: COLORS.ink, marginBottom: 8 },
    subLabel: { fontSize: 13, color: COLORS.muted, marginBottom: 16 },
    headerParadas: { marginTop: 24 },
    pickerWrap: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, overflow: 'hidden' },
    paradaItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, padding: 16, borderRadius: RADIUS.md, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
    paradaItemSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
    paradaInfo: { flexDirection: 'row', alignItems: 'center' },
    paradaNombre: { fontSize: 16, marginLeft: 12, color: COLORS.text },
    paradaNombreSelected: { color: COLORS.primary, fontWeight: 'bold' },
    badgeOrden: { backgroundColor: COLORS.primary, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    badgeText: { color: COLORS.onPrimary, fontWeight: 'bold', fontSize: 14 },
    botonGuardar: { position: 'absolute', bottom: 20, left: 16, right: 16, backgroundColor: COLORS.primary, padding: 16, borderRadius: RADIUS.md, alignItems: 'center', ...SHADOW.md },
    botonTexto: { color: COLORS.onPrimary, fontSize: 16, fontWeight: 'bold' },
  });
}