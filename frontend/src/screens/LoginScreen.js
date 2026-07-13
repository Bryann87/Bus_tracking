// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, TYPE, RADIUS, SHADOW } from '../theme/colors';
import RouteLine from '../theme/RouteLine';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { login } = useAuth();

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Ingresa tu correo y contraseña para continuar.');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (error) {
      const msg = error?.response?.data?.message || 'Correo o contraseña incorrectos.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="bus-multiple" size={34} color="#fff" />
          </View>
          <Text style={styles.appName}>Transporte Urbano</Text>
          <RouteLine width={140} />
          <Text style={styles.subtitle}>Rastrea tu bus en tiempo real</Text>
        </View>

        <View style={styles.card}>
          {errorMsg && (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={17} color={COLORS.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <Text style={TYPE.label}>Correo electrónico</Text>
          <View style={styles.inputRow}>
            <MaterialCommunityIcons name="email-outline" size={19} color={COLORS.muted} />
            <TextInput
              style={styles.input}
              placeholder="tucorreo@ejemplo.com"
              placeholderTextColor={COLORS.faint}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(v) => { setEmail(v); if (errorMsg) setErrorMsg(null); }}
              editable={!isLoading}
            />
          </View>

          <Text style={[TYPE.label, { marginTop: 14 }]}>Contraseña</Text>
          <View style={styles.inputRow}>
            <MaterialCommunityIcons name="lock-outline" size={19} color={COLORS.muted} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.faint}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(v) => { setPassword(v); if (errorMsg) setErrorMsg(null); }}
              editable={!isLoading}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={19}
                color={COLORS.muted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Entrar</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Registro')} disabled={isLoading}>
            <Text style={styles.footerLink}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 24, justifyContent: 'center' },

  header: { alignItems: 'center', marginBottom: 28 },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...SHADOW.md,
    shadowColor: COLORS.primary,
  },
  appName: { ...TYPE.display, marginBottom: 10 },
  subtitle: { ...TYPE.subtitle, marginTop: 10 },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 22,
    ...SHADOW.sm,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADIUS.sm,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: COLORS.danger, fontSize: 13, flex: 1 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1.2,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 50,
    marginTop: 6,
  },
  input: { flex: 1, fontSize: 15, color: COLORS.text },

  forgotPassword: { alignSelf: 'flex-end', marginTop: 14, marginBottom: 20 },
  forgotPasswordText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },

  primaryButton: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.sm,
    shadowColor: COLORS.primary,
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  footerText: { color: COLORS.muted, fontSize: 14 },
  footerLink: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});