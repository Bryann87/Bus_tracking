import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';
import { COLORS, RADIUS } from '../theme/colors';

export default function RutaFormScreen({ navigation, route }) {
  const rutaId = route.params?.rutaId ?? null;

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [tarifa, setTarifa] = useState('0.35');
  const [activo, setActivo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(!!rutaId);

  useEffect(() => {
    if (!rutaId) return;
    api.get(`/rutas/${rutaId}`).then(({ data }) => {
      setNombre(data.nombre);
      setDescripcion(data.descripcion ?? '');
      setOrigen(data.origen);
      setDestino(data.destino);
      setTarifa(String(data.tarifa));
      setActivo(!!data.activo);
      setCargandoInicial(false);
    }).catch(() => {
      Alert.alert('Error', 'No se pudo cargar la ruta.');
      setCargandoInicial(false);
    });
  }, [rutaId]);

  async function guardar() {
    if (!nombre.trim() || !origen.trim() || !destino.trim()) {
      Alert.alert('Campos requeridos', 'Nombre, origen y destino son obligatorios.');
      return;
    }
    setLoading(true);
    const payload = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      origen: origen.trim(),
      destino: destino.trim(),
      tarifa: parseFloat(tarifa) || 0,
      activo,
    };
    try {
      let savedRutaId = rutaId;
      if (rutaId) {
        await api.put(`/rutas/${rutaId}`, payload);
      } else {
        const { data } = await api.post('/rutas', payload);
        savedRutaId = data.ruta.id;
      }

      Alert.alert(
        'Listo',
        rutaId ? 'Ruta actualizada correctamente.' : 'Ruta creada correctamente. ¿Quieres asignarle las paradas del recorrido ahora?',
        rutaId
          ? [{ text: 'OK', onPress: () => navigation.goBack() }]
          : [
              { text: 'Después', onPress: () => navigation.goBack() },
              {
                text: 'Asignar paradas',
                onPress: () => navigation.replace('AsignarParadas', { rutaId: savedRutaId }),
              },
            ]
      );
    } catch (error) {
      const errors = error.response?.data?.errors;
      const firstError = errors ? Object.values(errors)[0][0] : null;
      Alert.alert('Error', firstError || 'No se pudo guardar la ruta.');
    } finally {
      setLoading(false);
    }
  }

  function eliminar() {
    Alert.alert('Confirmar', '¿Eliminar esta ruta? También se desvincularán sus paradas.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await api.delete(`/rutas/${rutaId}`);
          navigation.goBack();
        },
      },
    ]);
  }

  if (cargandoInicial) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.ink} />
            </TouchableOpacity>
            <Text style={styles.title}>{rutaId ? 'Editar ruta' : 'Nueva ruta'}</Text>
            <View style={{ width: 32 }} />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Nombre de la ruta *</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="bus-marker" size={20} color={COLORS.muted} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Ej: Ruta 4" value={nombre} onChangeText={setNombre} />
            </View>

            <Text style={styles.inputLabel}>Origen *</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color={COLORS.muted} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Ej: Parque Central" value={origen} onChangeText={setOrigen} />
            </View>

            <Text style={styles.inputLabel}>Destino *</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="map-marker-check-outline" size={20} color={COLORS.muted} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Ej: San Mateo" value={destino} onChangeText={setDestino} />
            </View>

            <Text style={styles.inputLabel}>Descripción del trayecto</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="map-marker-path" size={20} color={COLORS.muted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ej: Centro - ULEAM - San Mateo"
                value={descripcion}
                onChangeText={setDescripcion}
              />
            </View>

            <Text style={styles.inputLabel}>Tarifa base ($)</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="currency-usd" size={20} color={COLORS.muted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="0.35"
                keyboardType="decimal-pad"
                value={tarifa}
                onChangeText={setTarifa}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.inputLabel}>Ruta activa</Text>
              <Switch value={activo} onValueChange={setActivo} trackColor={{ true: COLORS.primary }} />
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} activeOpacity={0.8} onPress={guardar} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="content-save" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>{rutaId ? 'Guardar cambios' : 'Guardar ruta'}</Text>
              </>
            )}
          </TouchableOpacity>

          {rutaId && (
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('AsignarParadas', { rutaId })}
            >
              <Text style={styles.linkButtonText}>Editar paradas del recorrido</Text>
            </TouchableOpacity>
          )}

          {rutaId && (
            <TouchableOpacity style={styles.deleteButton} onPress={eliminar}>
              <Text style={styles.deleteButtonText}>Eliminar ruta</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.surface },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  keyboardView: { flex: 1 },
  container: { padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  backButton: { padding: 4 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.ink },
  formSection: { marginBottom: 24 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8, marginLeft: 4 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    marginBottom: 20,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: COLORS.text },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  saveButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkButton: { alignItems: 'center', marginTop: 16 },
  linkButtonText: { color: COLORS.primary, fontWeight: '600' },
  deleteButton: { alignItems: 'center', marginTop: 20, marginBottom: 20 },
  deleteButtonText: { color: COLORS.danger, fontWeight: 'bold' },
});