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
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';

const TIPOS = [
  { value: 'retraso', label: '⏱️ Retraso' },
  { value: 'averia', label: '🔧 Avería' },
  { value: 'seguridad', label: '🚨 Seguridad' },
  { value: 'limpieza', label: '🧹 Limpieza' },
  { value: 'otro', label: '📌 Otro' },
];

export default function ReporteFormScreen({ navigation }) {
  const [tipo, setTipo] = useState('retraso');
  const [descripcion, setDescripcion] = useState('');
  const [busId, setBusId] = useState('');
  const [paradaId, setParadaId] = useState('');
  const [buses, setBuses] = useState([]);
  const [paradas, setParadas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/buses').then(({ data }) => setBuses(data));
    api.get('/paradas').then(({ data }) => setParadas(data));
  }, []);

  async function enviar() {
    if (!descripcion.trim()) {
      Alert.alert('Campo requerido', 'Describe brevemente el reporte.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/reportes', {
        tipo,
        descripcion,
        bus_id: busId || null,
        parada_id: paradaId || null,
      });
      Alert.alert('Listo', 'Reporte enviado correctamente.');
      navigation.goBack();
    } catch (error) {
      const errors = error.response?.data?.errors;
      const firstError = errors ? Object.values(errors)[0][0] : null;
      Alert.alert('Error', firstError || 'No se pudo enviar el reporte.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Tipo de reporte *</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={tipo} onValueChange={setTipo}>
          {TIPOS.map((t) => (
            <Picker.Item key={t.value} label={t.label} value={t.value} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Bus relacionado (opcional)</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={busId} onValueChange={setBusId}>
          <Picker.Item label="Ninguno" value="" />
          {buses.map((b) => (
            <Picker.Item key={b.id} label={b.placa} value={String(b.id)} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Parada relacionada (opcional)</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={paradaId} onValueChange={setParadaId}>
          <Picker.Item label="Ninguna" value="" />
          {paradas.map((p) => (
            <Picker.Item key={p.id} label={p.nombre} value={String(p.id)} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Descripción *</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Describe lo ocurrido..."
        multiline
        numberOfLines={5}
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <TouchableOpacity style={styles.button} onPress={enviar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enviar reporte</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  label: { fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15 },
  textarea: { textAlignVertical: 'top', minHeight: 110 },
  pickerWrap: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, overflow: 'hidden' },
  button: { backgroundColor: '#1565C0', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 24, marginBottom: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
