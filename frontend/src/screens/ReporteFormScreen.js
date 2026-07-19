import React, { useEffect, useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';
import { useTheme } from '../theme/ThemeContext';

const TIPOS = [
  { value: 'retraso', label: '⏱️ Retraso' },
  { value: 'averia', label: '🔧 Avería' },
  { value: 'seguridad', label: '🚨 Seguridad' },
  { value: 'limpieza', label: '🧹 Limpieza' },
  { value: 'otro', label: '📌 Otro' },
];

export default function ReporteFormScreen({ navigation }) {
  const { colors: COLORS, radius: RADIUS, shadow: SHADOW } = useTheme();
  const styles = makeStyles(COLORS, RADIUS, SHADOW);

  const [tipo, setTipo] = useState('retraso');
  const [descripcion, setDescripcion] = useState('');
  const [busId, setBusId] = useState('');
  const [paradaId, setParadaId] = useState('');
  const [buses, setBuses] = useState([]);
  const [paradas, setParadas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [busesRes, paradasRes] = await Promise.all([
        api.get('/buses'),
        api.get('/paradas'),
      ]);

      setBuses(busesRes.data);
      setParadas(paradasRes.data);
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudieron cargar los datos necesarios.'
      );
    }
  }

  async function enviar() {
    if (!descripcion.trim()) {
      Alert.alert(
        'Campo requerido',
        'Describe brevemente el reporte.'
      );
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

      Alert.alert(
        'Listo',
        'Reporte enviado correctamente.'
      );

      navigation.goBack();
    } catch (error) {
      const errors = error.response?.data?.errors;
      const firstError = errors
        ? Object.values(errors)[0][0]
        : null;

      Alert.alert(
        'Error',
        firstError || 'No se pudo enviar el reporte.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>
        Tipo de reporte *
      </Text>

      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={tipo}
          onValueChange={setTipo}
          dropdownIconColor={COLORS.text}
          style={styles.picker}
        >
          {TIPOS.map((t) => (
            <Picker.Item
              key={t.value}
              label={t.label}
              value={t.value}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>
        Bus relacionado (opcional)
      </Text>

      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={busId}
          onValueChange={setBusId}
          dropdownIconColor={COLORS.text}
          style={styles.picker}
        >
          <Picker.Item label="Ninguno" value="" />

          {buses.map((b) => (
            <Picker.Item
              key={b.id}
              label={b.placa}
              value={String(b.id)}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>
        Parada relacionada (opcional)
      </Text>

      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={paradaId}
          onValueChange={setParadaId}
          dropdownIconColor={COLORS.text}
          style={styles.picker}
        >
          <Picker.Item label="Ninguna" value="" />

          {paradas.map((p) => (
            <Picker.Item
              key={p.id}
              label={p.nombre}
              value={String(p.id)}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>
        Descripción *
      </Text>

      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Describe lo ocurrido..."
        placeholderTextColor={COLORS.muted}
        multiline
        numberOfLines={5}
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={enviar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            Enviar reporte
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

function makeStyles(COLORS, RADIUS, SHADOW) {
  return StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: COLORS.surface,
      flexGrow: 1,
    },

    label: {
      fontWeight: '600',
      color: COLORS.text,
      marginBottom: 6,
      marginTop: 12,
    },

    input: {
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: RADIUS.md,
      padding: 12,
      fontSize: 15,
      color: COLORS.text,
      backgroundColor: COLORS.background,
    },

    textarea: {
      textAlignVertical: 'top',
      minHeight: 110,
    },

    pickerWrap: {
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: RADIUS.md,
      overflow: 'hidden',
      backgroundColor: COLORS.background,
    },

    picker: {
      color: COLORS.text,
      backgroundColor: COLORS.background,
    },

    button: {
      backgroundColor: COLORS.primary,
      borderRadius: RADIUS.md,
      padding: 16,
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 20,
      ...SHADOW.small,
    },

    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
}