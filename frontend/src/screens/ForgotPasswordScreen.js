import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
 KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

export default function ForgotPasswordScreen({ navigation }) {
    const { colors: COLORS, radius: RADIUS, shadow: SHADOW } = useTheme();
const styles = makeStyles(COLORS, RADIUS, SHADOW);

  const [paso, setPaso] = useState(1); // 1 = pedir código, 2 = código + nueva contraseña
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  async function enviarCodigo() {
    if (!email.trim()) {
      Alert.alert('Campo requerido', 'Ingresa tu correo electrónico.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/forgot-password', { email: email.trim().toLowerCase() });
      Alert.alert('Revisa tu correo', 'Si el correo existe, te enviamos un código de 6 dígitos.');
      setPaso(2);
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el código. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  async function restablecer() {
    if (!code.trim() || !password || !passwordConfirmation) {
      Alert.alert('Campos requeridos', 'Completa el código y la nueva contraseña.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/reset-password', {
        email: email.trim().toLowerCase(),
        code: code.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });
      Alert.alert('Listo', 'Tu contraseña fue actualizada. Ya puedes iniciar sesión.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      const data = error.response?.data;
      const validationError = data?.errors ? Object.values(data.errors)[0][0] : null;
      Alert.alert('Error', validationError || data?.message || 'No se pudo restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.ink} />
        </TouchableOpacity>

        <Text style={TYPE.display}>{paso === 1 ? 'Recuperar contraseña' : 'Ingresa el código'}</Text>
        <Text style={[TYPE.subtitle, { marginBottom: 24 }]}>
          {paso === 1
            ? 'Te enviaremos un código de 6 dígitos a tu correo.'
            : `Enviamos un código a ${email}`}
        </Text>

        <View style={styles.card}>
          {paso === 1 ? (
            <>
              <Text style={TYPE.label}>Correo electrónico</Text>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons name="email-outline" size={19} color={COLORS.muted} />
                <TextInput
                  style={styles.input}
                  placeholder="tucorreo@ejemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              <TouchableOpacity style={styles.button} onPress={enviarCodigo} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enviar código</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={TYPE.label}>Código de 6 dígitos</Text>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons name="numeric" size={19} color={COLORS.muted} />
                <TextInput
                  style={styles.input}
                  placeholder="123456"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={code}
                  onChangeText={setCode}
                />
              </View>

              <Text style={[TYPE.label, { marginTop: 14 }]}>Nueva contraseña</Text>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons name="lock-outline" size={19} color={COLORS.muted} />
                <TextInput style={styles.input} placeholder="Mínimo 8 caracteres" secureTextEntry value={password} onChangeText={setPassword} />
              </View>

              <Text style={[TYPE.label, { marginTop: 14 }]}>Confirmar contraseña</Text>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons name="lock-check-outline" size={19} color={COLORS.muted} />
                <TextInput style={styles.input} placeholder="Repite la contraseña" secureTextEntry value={passwordConfirmation} onChangeText={setPasswordConfirmation} />
              </View>

              <TouchableOpacity style={styles.button} onPress={restablecer} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Restablecer contraseña</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={enviarCodigo} disabled={loading} style={{ marginTop: 14, alignItems: 'center' }}>
                <Text style={{ color: COLORS.primary, fontWeight: '600', fontSize: 13 }}>Reenviar código</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(COLORS, RADIUS, SHADOW) {
  return StyleSheet.create({ 
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 50, left: 20 },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 22, ...SHADOW.sm },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.background, borderRadius: RADIUS.md, borderWidth: 1.2,
    borderColor: COLORS.border, paddingHorizontal: 14, height: 50, marginTop: 6,
  },
  input: { flex: 1, fontSize: 15, color: COLORS.text },
  button: {
    backgroundColor: COLORS.primary, height: 52, borderRadius: RADIUS.md,
    justifyContent: 'center', alignItems: 'center', marginTop: 22, ...SHADOW.sm, shadowColor: COLORS.primary,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
}