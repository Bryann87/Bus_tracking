import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import RouteLine from '../theme/RouteLine';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?\d{7,15}$/;

function validateForm(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'El nombre es obligatorio.';
  else if (form.name.trim().length < 2) errors.name = 'El nombre es demasiado corto.';

  if (!form.cedula.trim()) errors.cedula = 'La cédula es obligatoria.';
  else if (!/^\d{10}$/.test(form.cedula.trim())) errors.cedula = 'La cédula debe tener 10 dígitos.';

  if (!form.email.trim()) errors.email = 'El correo es obligatorio.';
  else if (!EMAIL_REGEX.test(form.email.trim())) errors.email = 'Ingresa un correo válido.';

  if (form.telefono.trim() && !PHONE_REGEX.test(form.telefono.trim())) errors.telefono = 'Ingresa un teléfono válido.';
  if (!form.ubicacion.trim()) errors.ubicacion = 'La ubicación es obligatoria.';
  if (!form.password) errors.password = 'La contraseña es obligatoria.';
  else if (form.password.length < 8) errors.password = 'Debe tener al menos 8 caracteres.';
  if (form.password_confirmation !== form.password) errors.password_confirmation = 'Las contraseñas no coinciden.';
  return errors;
}

function extractApiErrorMessage(error) {
  const data = error?.response?.data;
  if (data?.errors) {
    const firstKey = Object.keys(data.errors)[0];
    const firstMsg = data.errors[firstKey]?.[0];
    if (firstMsg) return firstMsg;
  }
  if (data?.message) return data.message;
  if (error?.message === 'Network Error') return 'No hay conexión con el servidor. Verifica tu internet.';
  return 'No se pudo completar el registro. Intenta de nuevo.';
}

const initialForm = { name: '', cedula: '', email: '', telefono: '', ubicacion: '', password: '', password_confirmation: '' };

export default function RegistroScreen({ navigation }) {
  const { register } = useAuth();
  const { colors: COLORS, type: TYPE, radius: RADIUS, shadow: SHADOW } = useTheme();
  const styles = makeStyles(COLORS, RADIUS, SHADOW);

  const [form, setForm] = useState(initialForm);
  const [coords, setCoords] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const update = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (apiError) setApiError(null);
  }, [apiError]);

  const handleBlur = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validateForm(form));
  }, [form]);

  const isFormValid = useMemo(() => Object.keys(validateForm(form)).length === 0, [form]);

  async function handleUseCurrentLocation() {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setApiError('Necesitamos permiso de ubicación para continuar.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = position.coords;
      setCoords({ latitude, longitude });
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (place) {
        const parts = [place.street, place.city || place.subregion, place.region].filter(Boolean);
        update('ubicacion', parts.join(', '));
      } else {
        update('ubicacion', `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      }
    } catch (error) {
      setApiError('No se pudo obtener tu ubicación. Ingrésala manualmente.');
    } finally {
      setLocating(false);
    }
  }

  async function handleRegister() {
    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    setTouched({ name: true, cedula: true, email: true, telefono: true, ubicacion: true, password: true, password_confirmation: true });
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    setApiError(null);
    try {
      await register({
        ...form,
        name: form.name.trim(),
        cedula: form.cedula.trim(),
        email: form.email.trim().toLowerCase(),
        telefono: form.telefono.trim(),
        ubicacion: form.ubicacion.trim(),
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      });
    } catch (error) {
      setApiError(extractApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function renderInput({ field, placeholder, icon, secure, toggleSecure, secureVisible, keyboardType = 'default', autoCapitalize = 'sentences', rightSlot }) {
    const hasError = touched[field] && errors[field];
    return (
      <View style={styles.inputWrapper}>
        <View style={[styles.inputRow, hasError && styles.inputRowError]}>
          <MaterialCommunityIcons name={icon} size={19} color={hasError ? COLORS.danger : COLORS.muted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={COLORS.faint}
            value={form[field]}
            onChangeText={(v) => update(field, v)}
            onBlur={() => handleBlur(field)}
            secureTextEntry={secure && !secureVisible}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            editable={!loading}
            returnKeyType="next"
          />
          {toggleSecure && (
            <TouchableOpacity onPress={toggleSecure} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialCommunityIcons name={secureVisible ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.muted} />
            </TouchableOpacity>
          )}
          {rightSlot}
        </View>
        {hasError ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.headerArea}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="account-plus-outline" size={30} color={COLORS.onPrimary} />
          </View>
          <Text style={styles.title}>Crear cuenta</Text>
          <RouteLine width={120} color={COLORS.accent} />
          <Text style={styles.subtitle}>Regístrate como pasajero</Text>
        </View>

        <View style={styles.card}>
          {apiError && (
            <View style={styles.apiErrorBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={18} color={COLORS.danger} />
              <Text style={styles.apiErrorText}>{apiError}</Text>
            </View>
          )}

          <Text style={TYPE.label}>Datos personales</Text>

          {renderInput({ field: 'name', placeholder: 'Nombre completo', icon: 'account-outline' })}
          {renderInput({ field: 'cedula', placeholder: 'Cédula (10 dígitos)', icon: 'card-account-details-outline', keyboardType: 'number-pad' })}
          {renderInput({ field: 'email', placeholder: 'Correo electrónico', icon: 'email-outline', keyboardType: 'email-address', autoCapitalize: 'none' })}
          {renderInput({ field: 'telefono', placeholder: 'Teléfono (opcional)', icon: 'phone-outline', keyboardType: 'phone-pad' })}

          {renderInput({
            field: 'ubicacion',
            placeholder: 'Tu ubicación',
            icon: 'map-marker-outline',
            rightSlot: (
              <TouchableOpacity onPress={handleUseCurrentLocation} disabled={locating} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.locateButton}>
                {locating ? <ActivityIndicator size="small" color={COLORS.primary} /> : <MaterialCommunityIcons name="crosshairs-gps" size={19} color={COLORS.primary} />}
              </TouchableOpacity>
            ),
          })}
          {coords && (
            <Text style={styles.coordsHint}>📍 Coordenadas detectadas: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}</Text>
          )}

          <Text style={[TYPE.label, { marginTop: 8 }]}>Seguridad</Text>

          {renderInput({ field: 'password', placeholder: 'Contraseña', icon: 'lock-outline', secure: true, secureVisible: showPassword, toggleSecure: () => setShowPassword((v) => !v) })}
          {renderInput({ field: 'password_confirmation', placeholder: 'Confirmar contraseña', icon: 'lock-outline', secure: true, secureVisible: showPasswordConfirm, toggleSecure: () => setShowPasswordConfirm((v) => !v) })}

          <TouchableOpacity style={[styles.button, (loading || !isFormValid) && styles.buttonDisabled]} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color={COLORS.onPrimary} /> : <Text style={styles.buttonText}>Registrarme</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading} style={styles.linkWrapper}>
          <Text style={styles.link}>¿Ya tienes cuenta? <Text style={styles.linkBold}>Inicia sesión</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(COLORS, RADIUS, SHADOW) {
  return StyleSheet.create({
    screen: { flexGrow: 1, backgroundColor: COLORS.background, padding: 20, paddingTop: 48, paddingBottom: 40 },
    headerArea: { alignItems: 'center', marginBottom: 20 },
    logoCircle: { width: 60, height: 60, borderRadius: RADIUS.xl, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12, ...SHADOW.md },
    title: { fontSize: 24, fontWeight: '700', color: COLORS.ink, marginBottom: 10 },
    subtitle: { fontSize: 15, color: COLORS.muted, marginTop: 10 },
    card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 20, ...SHADOW.sm },
    apiErrorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.dangerBg, borderRadius: RADIUS.sm, padding: 12, marginBottom: 16 },
    apiErrorText: { color: COLORS.danger, fontSize: 13, flex: 1 },
    inputWrapper: { marginBottom: 14 },
    inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1.3, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 14 },
    inputRowError: { borderColor: COLORS.danger, backgroundColor: COLORS.dangerBg },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, paddingVertical: 13, fontSize: 15, color: COLORS.text },
    errorText: { color: COLORS.danger, fontSize: 12, marginTop: 5, marginLeft: 4 },
    locateButton: { marginLeft: 8, paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: COLORS.border },
    coordsHint: { fontSize: 11, color: COLORS.muted, marginTop: -8, marginBottom: 12, marginLeft: 4 },
    button: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 16, alignItems: 'center', marginTop: 6, ...SHADOW.sm },
    buttonDisabled: { opacity: 0.5, shadowOpacity: 0 },
    buttonText: { color: COLORS.onPrimary, fontWeight: '700', fontSize: 16 },
    linkWrapper: { marginTop: 22, alignItems: 'center' },
    link: { color: COLORS.muted, fontSize: 14 },
    linkBold: { color: COLORS.accent, fontWeight: '700' },
  });
}