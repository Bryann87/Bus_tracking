import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';

export default function AdminPanelScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { colors: COLORS, type: TYPE, radius: RADIUS, shadow: SHADOW, isDark, toggleTheme } = useTheme();
  const styles = makeStyles(COLORS, RADIUS, SHADOW);

  const SECTIONS = [
    {
      title: 'Operación',
      items: [
        { key: 'Rutas', label: 'Rutas', desc: 'Crear y editar rutas de la ciudad', icon: 'routes', color: COLORS.primary },
        { key: 'Paradas', label: 'Paradas', desc: 'Registrar paradas con ubicación GPS', icon: 'map-marker-radius-outline', color: COLORS.accent },
        { key: 'Buses', label: 'Buses', desc: 'Flota, placas y asignación de conductor', icon: 'bus', color: COLORS.success },
        { key: 'Conductores', label: 'Conductores', desc: 'Crear cuentas de conductor', icon: 'account-tie-outline', color: COLORS.primary },
        { key: 'AsignarParadas', label: 'Vincular recorrido', desc: 'Asignar el orden de paradas de cada ruta', icon: 'vector-polyline', color: COLORS.accent },
      ],
    },
    {
      title: 'Monitoreo',
      items: [
        { key: 'Dashboard', label: 'Mapa en vivo', desc: 'Ver todos los buses activos', icon: 'map-outline', color: COLORS.primary },
        { key: 'Reportes', label: 'Reportes', desc: 'Incidencias reportadas por pasajeros', icon: 'alert-circle-outline', color: COLORS.danger },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={TYPE.label}>Panel de administrador</Text>
          <Text style={styles.title}>Hola, {user?.name?.split(' ')[0] ?? 'Admin'}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleTheme} hitSlop={8}>
            <MaterialCommunityIcons name={isDark ? 'white-balance-sunny' : 'moon-waning-crescent'} size={19} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={logout} hitSlop={8}>
            <MaterialCommunityIcons name="logout" size={20} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {SECTIONS.map((section) => (
          <View key={section.title} style={{ marginBottom: 22 }}>
            <Text style={TYPE.label}>{section.title}</Text>
            <View style={styles.grid}>
              {section.items.map((item) => (
                <TouchableOpacity key={item.key} style={styles.card} activeOpacity={0.8} onPress={() => navigation.navigate(item.key)}>
                  <View style={[styles.iconWrap, { backgroundColor: item.color }]}>
                    <MaterialCommunityIcons name={item.icon} size={22} color={item.color === COLORS.accent ? COLORS.onAccent : COLORS.onPrimary} />
                  </View>
                  <Text style={styles.cardLabel}>{item.label}</Text>
                  <Text style={styles.cardDesc}>{item.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(COLORS, RADIUS, SHADOW) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
    title: { fontSize: 22, fontWeight: '800', color: COLORS.ink },
    iconButton: { width: 40, height: 40, borderRadius: RADIUS.pill, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
    scroll: { paddingHorizontal: 20, paddingBottom: 40 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
    card: { width: '47%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 16, ...SHADOW.sm },
    iconWrap: { width: 40, height: 40, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    cardLabel: { fontSize: 15, fontWeight: '700', color: COLORS.ink, marginBottom: 3 },
    cardDesc: { fontSize: 12, color: COLORS.muted, lineHeight: 16 },
  });
}