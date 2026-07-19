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
import { useTheme } from '../theme/ThemeContext';
import RouteLine from '../theme/RouteLine';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { login } = useAuth();
  const { colors: COLORS, type: TYPE, radius: RADIUS, shadow: SHADOW, isDark, toggleTheme } = useTheme();
  const styles = makeStyles(COLORS, RADIUS, SHADOW);

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
      <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme} hitSlop={10}>
        <MaterialCommunityIcons
          name={isDark ? 'white-balance-sunny' : 'moon-waning-crescent'}
          size={20}
          color={COLORS.text}
        />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="bus-multiple" size={34} color={COLORS.onPrimary} />
          </View>
          <Text style={styles.appName}>Transporte Urbano</Text>
          <RouteLine width={140} color={COLORS.accent} />
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

          <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.onPrimary} />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Entrar</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color={COLORS.onPrimary} />
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

function makeStyles(COLORS, RADIUS, SHADOW) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    container: { flex: 1, padding: 24, justifyContent: 'center' },

    themeToggle: {
      position: 'absolute',
      top: 54,
      right: 20,
      zIndex: 10,
      width: 38,
      height: 38,
      borderRadius: RADIUS.pill,
      backgroundColor: COLORS.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...SHADOW.sm,
    },

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
    },
    appName: { fontSize: 28, fontWeight: '800', color: COLORS.ink, letterSpacing: -0.3, marginBottom: 10 },
    subtitle: { fontSize: 15, color: COLORS.muted, marginTop: 10 },

    card: {
      backgroundColor: COLORS.surface,
      borderRadius: RADIUS.lg,
      padding: 22,
      ...SHADOW.sm,
    },

    errorBox: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: COLORS.dangerBg, borderRadius: RADIUS.sm, padding: 12, marginBottom: 16,
    },
    errorText: { color: COLORS.danger, fontSize: 13, flex: 1 },

    inputRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      backgroundColor: COLORS.background, borderRadius: RADIUS.md,
      borderWidth: 1.2, borderColor: COLORS.border, paddingHorizontal: 14, height: 50, marginTop: 6,
    },
    input: { flex: 1, fontSize: 15, color: COLORS.text },

    forgotPassword: { alignSelf: 'flex-end', marginTop: 14, marginBottom: 20 },
    forgotPasswordText: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },

    primaryButton: {
      flexDirection: 'row', gap: 8, backgroundColor: COLORS.primary, height: 52,
      borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', ...SHADOW.sm,
    },
    buttonDisabled: { opacity: 0.6 },
    primaryButtonText: { color: COLORS.onPrimary, fontSize: 16, fontWeight: '700' },

    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
    footerText: { color: COLORS.muted, fontSize: 14 },
    footerLink: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
  });
}