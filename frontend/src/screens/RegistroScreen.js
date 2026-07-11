import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function RegistroScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    telefono: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRegister() {
    if (!form.name || !form.email || !form.password) {
      Alert.alert('Campos requeridos', 'Completa nombre, correo y contraseña.');
      return;
    }
    if (form.password !== form.password_confirmation) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
    } catch (error) {
      const errors = error.response?.data?.errors;
      const firstError = errors ? Object.values(errors)[0][0] : null;
      Alert.alert('Error', firstError || 'No se pudo completar el registro.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>
      <Text style={styles.subtitle}>Regístrate como pasajero</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={form.name}
        onChangeText={(v) => update('name', v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        autoCapitalize="none"
        keyboardType="email-address"
        value={form.email}
        onChangeText={(v) => update('email', v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono (opcional)"
        keyboardType="phone-pad"
        value={form.telefono}
        onChangeText={(v) => update('telefono', v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={form.password}
        onChangeText={(v) => update('password', v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        secureTextEntry
        value={form.password_confirmation}
        onChangeText={(v) => update('password_confirmation', v)}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registrarme</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Ya tengo cuenta, iniciar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: '#1565C0' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 24, marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
  },
  button: { backgroundColor: '#1565C0', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#1565C0', textAlign: 'center', marginTop: 20 },
});
