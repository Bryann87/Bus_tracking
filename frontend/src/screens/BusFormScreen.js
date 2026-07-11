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

export default function BusFormScreen({ navigation, route }) {
  const busId = route.params?.busId ?? null;
  const [form, setForm] = useState({
    placa: '',
    modelo: '',
    capacidad: '30',
    estado: 'activo',
    ruta_id: '',
    conductor_id: '',
  });
  const [rutas, setRutas] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      const [{ data: rutasData }, { data: busData }] = await Promise.all([
        api.get('/rutas'),
        busId ? api.get(`/buses/${busId}`) : Promise.resolve({ data: null }),
      ]);
      setRutas(rutasData);

      // el endpoint /buses no expone lista de conductores por separado;
      // se obtiene de /user con rol conductor a través de un listado simple.
      // Aquí usamos los conductores ya asignados a algún bus + admite ID manual.
      try {
        const { data: busesData } = await api.get('/buses');
        const unicos = new Map();
        busesData.forEach((b) => {
          if (b.conductor) unicos.set(b.conductor.id, b.conductor);
        });
        setConductores(Array.from(unicos.values()));
      } catch (e) {
        setConductores([]);
      }

      if (busData) {
        setForm({
          placa: busData.placa,
          modelo: busData.modelo ?? '',
          capacidad: String(busData.capacidad),
          estado: busData.estado,
          ruta_id: busData.ruta_id ? String(busData.ruta_id) : '',
          conductor_id: busData.conductor_id ? String(busData.conductor_id) : '',
        });
      }
      setCargandoInicial(false);
    }
    cargarDatos();
  }, [busId]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function guardar() {
    if (!form.placa) {
      Alert.alert('Campo requerido', 'Ingresa la placa del bus.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        capacidad: parseInt(form.capacidad, 10) || 30,
        ruta_id: form.ruta_id || null,
        conductor_id: form.conductor_id || null,
      };
      if (busId) {
        await api.put(`/buses/${busId}`, payload);
        Alert.alert('Listo', 'Bus actualizado correctamente.');
      } else {
        await api.post('/buses', payload);
        Alert.alert('Listo', 'Bus registrado correctamente.');
      }
      navigation.goBack();
    } catch (error) {
      const errors = error.response?.data?.errors;
      const firstError = errors ? Object.values(errors)[0][0] : null;
      Alert.alert('Error', firstError || 'No se pudo guardar el bus.');
    } finally {
      setLoading(false);
    }
  }

  async function eliminar() {
    Alert.alert('Confirmar', '¿Eliminar este bus?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await api.delete(`/buses/${busId}`);
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
      <Text style={styles.label}>Placa *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. ABC-1234"
        autoCapitalize="characters"
        value={form.placa}
        onChangeText={(v) => update('placa', v)}
      />

      <Text style={styles.label}>Modelo</Text>
      <TextInput style={styles.input} placeholder="Ej. Hino AK8" value={form.modelo} onChangeText={(v) => update('modelo', v)} />

      <Text style={styles.label}>Capacidad</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={form.capacidad}
        onChangeText={(v) => update('capacidad', v)}
      />

      <Text style={styles.label}>Estado</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={form.estado} onValueChange={(v) => update('estado', v)}>
          <Picker.Item label="Activo" value="activo" />
          <Picker.Item label="Inactivo" value="inactivo" />
          <Picker.Item label="Mantenimiento" value="mantenimiento" />
        </Picker>
      </View>

      <Text style={styles.label}>Ruta asignada</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={form.ruta_id} onValueChange={(v) => update('ruta_id', v)}>
          <Picker.Item label="Sin asignar" value="" />
          {rutas.map((r) => (
            <Picker.Item key={r.id} label={r.nombre} value={String(r.id)} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>ID de usuario conductor</Text>
      <TextInput
        style={styles.input}
        placeholder="ID del usuario con rol conductor"
        keyboardType="number-pad"
        value={form.conductor_id}
        onChangeText={(v) => update('conductor_id', v)}
      />
      <Text style={styles.hint}>
        Consulta el ID del conductor en la tabla "users" o pídeselo al administrador. Conductores
        conocidos: {conductores.map((c) => `${c.name} (#${c.id})`).join(', ') || 'ninguno aún'}
      </Text>

      <TouchableOpacity style={styles.button} onPress={guardar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{busId ? 'Guardar cambios' : 'Registrar bus'}</Text>}
      </TouchableOpacity>

      {busId && (
        <TouchableOpacity style={styles.buttonEliminar} onPress={eliminar}>
          <Text style={styles.buttonEliminarText}>Eliminar bus</Text>
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
  pickerWrap: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, overflow: 'hidden' },
  hint: { color: '#999', fontSize: 12, marginTop: 8 },
  button: { backgroundColor: '#1565C0', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  buttonEliminar: { padding: 14, alignItems: 'center', marginTop: 12, marginBottom: 20 },
  buttonEliminarText: { color: '#C62828', fontWeight: 'bold' },
});
