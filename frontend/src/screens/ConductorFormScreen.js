import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

export default function ConductorFormScreen({ navigation }) {
    const { colors: COLORS, radius: RADIUS, shadow: SHADOW } = useTheme();
const styles = makeStyles(COLORS, RADIUS, SHADOW);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function guardar() {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Campos requeridos', 'Nombre, correo y contraseña son obligatorios.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/users', { name: name.trim(), email: email.trim().toLowerCase(), password, telefono, role: 'conductor' });
      Alert.alert('Listo', 'Conductor creado. Ya puedes asignarlo a un bus desde "Buses".');
      navigation.goBack();
    } catch (error) {
      const data = error.response?.data;
      const validationError = data?.errors ? Object.values(data.errors)[0][0] : null;
      Alert.alert('Error', validationError || data?.message || 'No se pudo crear el conductor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.ink} />
          </TouchableOpacity>
          <Text style={styles.title}>Nuevo conductor</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.label}>Nombre completo *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ej. Carlos Zambrano" />

        <Text style={styles.label}>Correo electrónico *</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="conductor@transporte.test" />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" placeholder="09XXXXXXXX" />

        <Text style={styles.label}>Contraseña temporal *</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Mínimo 6 caracteres" />

        <TouchableOpacity style={styles.button} onPress={guardar} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Crear conductor</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(COLORS, RADIUS, SHADOW) {
  return StyleSheet.create({ 
  safeArea: { flex: 1, backgroundColor: COLORS.surface },
  container: { padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.ink },
  label: { fontWeight: '600', color: COLORS.text, marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 14, fontSize: 15, backgroundColor: COLORS.background },
  button: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: 16, alignItems: 'center', marginTop: 28 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
}