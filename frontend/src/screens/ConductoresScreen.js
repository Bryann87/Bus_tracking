import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

export default function ConductoresScreen({ navigation }) {
    const { colors: COLORS, radius: RADIUS, shadow: SHADOW } = useTheme();
const styles = makeStyles(COLORS, RADIUS, SHADOW);

  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [])
  );

  async function cargar() {
    setLoading(true);
    try {
      const { data } = await api.get('/users', { params: { role: 'conductor' } });
      setConductores(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los conductores.');
    } finally {
      setLoading(false);
    }
  }

  function eliminar(conductor) {
    Alert.alert('Confirmar', `¿Eliminar la cuenta de "${conductor.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/users/${conductor.id}`);
            setConductores((prev) => prev.filter((c) => c.id !== conductor.id));
          } catch (e) {
            Alert.alert('Error', e.response?.data?.message || 'No se pudo eliminar.');
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Conductores</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={conductores}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>Aún no has registrado ningún conductor.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.avatar}>
                <MaterialCommunityIcons name="account" size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
              <View style={[styles.badge, item.bus_asignado_count > 0 ? styles.badgeOk : styles.badgeWarn]}>
                <Text style={[styles.badgeText, { color: item.bus_asignado_count > 0 ? COLORS.success : COLORS.accentDark }]}>
                  {item.bus_asignado_count > 0 ? 'Con bus' : 'Sin bus'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => eliminar(item)} hitSlop={8} style={{ marginLeft: 10 }}>
                <MaterialCommunityIcons name="trash-can-outline" size={20} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('ConductorForm')}>
        <MaterialCommunityIcons name="plus" size={22} color="#fff" />
        <Text style={styles.fabText}>Nuevo conductor</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function makeStyles(COLORS, RADIUS, SHADOW) {
  return StyleSheet.create({ 
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.ink },
  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  emptyText: { textAlign: 'center', color: COLORS.muted, marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 14, borderRadius: RADIUS.lg, marginBottom: 10, ...SHADOW.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  email: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.pill },
  badgeOk: { backgroundColor: COLORS.successBg },
  badgeWarn: { backgroundColor: COLORS.warningBg },
  badgeText: { fontSize: 11, fontWeight: '700' },
  fab: { position: 'absolute', bottom: 24, right: 24, left: 24, backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: RADIUS.md, gap: 8, ...SHADOW.md, shadowColor: COLORS.primary },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
}