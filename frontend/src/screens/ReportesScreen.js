import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';

const TIPO_ICON = {
  retraso: 'clock-alert-outline',
  averia: 'wrench-outline',
  seguridad: 'shield-alert-outline',
  limpieza: 'broom',
  otro: 'dots-horizontal-circle-outline',
};

function tiempoRelativo(fechaISO) {
  const diffMs = Date.now() - new Date(fechaISO).getTime();
  const minutos = Math.floor(diffMs / 60000);
  if (minutos < 1) return 'Justo ahora';
  if (minutos < 60) return `Hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;
  return `Hace ${Math.floor(horas / 24)} día(s)`;
}

export default function ReportesScreen({ navigation }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { colors: COLORS, radius: RADIUS, shadow: SHADOW } = useTheme();
  const styles = makeStyles(COLORS, RADIUS, SHADOW);

  const ESTADO_STYLE = {
    pendiente: { bg: COLORS.warningBg, color: COLORS.accentDark ?? COLORS.accent, label: 'Pendiente' },
    revisado: { bg: COLORS.primaryLight, color: COLORS.primary, label: 'Revisado' },
    resuelto: { bg: COLORS.successBg, color: COLORS.success, label: 'Resuelto' },
  };

  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      cargarReportes();
    }, [])
  );

  async function cargarReportes() {
    setLoading(true);
    try {
      const { data } = await api.get('/reportes');
      setReportes(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los reportes.');
    } finally {
      setLoading(false);
    }
  }

  function avanzarEstado(reporte) {
    const siguiente = { pendiente: 'revisado', revisado: 'resuelto' }[reporte.estado];
    if (!siguiente) return;
    Alert.alert('Actualizar estado', `¿Marcar como "${ESTADO_STYLE[siguiente].label}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          try {
            await api.put(`/reportes/${reporte.id}`, { estado: siguiente });
            setReportes((prev) => prev.map((r) => (r.id === reporte.id ? { ...r, estado: siguiente } : r)));
          } catch (e) {
            Alert.alert('Error', 'No se pudo actualizar el estado.');
          }
        },
      },
    ]);
  }

  const renderItem = ({ item }) => {
    const estadoInfo = ESTADO_STYLE[item.estado] ?? ESTADO_STYLE.pendiente;
    return (
      <TouchableOpacity
        style={styles.reportCard}
        activeOpacity={isAdmin && item.estado !== 'resuelto' ? 0.7 : 1}
        onPress={() => isAdmin && avanzarEstado(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.subjectRow}>
            <MaterialCommunityIcons name={TIPO_ICON[item.tipo] ?? 'alert-circle-outline'} size={18} color={COLORS.primary} />
            <Text style={styles.reportSubject}>
              {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
              {item.bus ? ` · Bus ${item.bus.placa}` : ''}
              {item.parada ? ` · ${item.parada.nombre}` : ''}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: estadoInfo.bg }]}>
            <Text style={[styles.badgeText, { color: estadoInfo.color }]}>{estadoInfo.label}</Text>
          </View>
        </View>

        <Text style={styles.reportDetail}>{item.descripcion}</Text>

        <View style={styles.cardFooter}>
          <MaterialCommunityIcons name="clock-outline" size={14} color={COLORS.faint} />
          <Text style={styles.reportDate}>{tiempoRelativo(item.created_at)}</Text>
          {isAdmin && item.user?.name && <Text style={styles.reportUser}>· {item.user.name}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>{isAdmin ? 'Reportes de usuarios' : 'Mis reportes'}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={reportes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay reportes por aquí todavía.</Text>}
        />
      )}

      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => navigation.navigate('ReporteForm')}>
        <MaterialCommunityIcons name="plus" size={28} color={COLORS.onPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function makeStyles(COLORS, RADIUS, SHADOW) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingBottom: 16 },
    backButton: { marginRight: 16 },
    title: { fontSize: 22, fontWeight: 'bold', color: COLORS.ink },
    listContainer: { paddingHorizontal: 24, paddingBottom: 80 },
    emptyText: { textAlign: 'center', color: COLORS.muted, marginTop: 40 },
    reportCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 16, marginBottom: 16, ...SHADOW.sm },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
    subjectRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
    reportSubject: { fontSize: 14, fontWeight: '700', color: COLORS.text, flexShrink: 1 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.pill },
    badgeText: { fontSize: 11, fontWeight: 'bold' },
    reportDetail: { fontSize: 14, color: COLORS.muted, lineHeight: 20, marginBottom: 12 },
    cardFooter: { flexDirection: 'row', alignItems: 'center' },
    reportDate: { fontSize: 12, color: COLORS.faint, marginLeft: 4 },
    reportUser: { fontSize: 12, color: COLORS.faint, marginLeft: 4 },
    fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', ...SHADOW.md },
  });
}