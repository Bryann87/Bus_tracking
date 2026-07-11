import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const reportesDemo = [
  { id: '1', asunto: 'Bus averiado', detalle: 'La unidad ABC-1234 se detuvo cerca de Tarqui.', estado: 'Pendiente', fecha: 'Hoy, 10:30 AM' },
  { id: '2', asunto: 'Retraso en parada', detalle: 'Llevo 40 minutos esperando en la parada central.', estado: 'Resuelto', fecha: 'Ayer, 14:15 PM' },
];

export default function ReportesScreen({ navigation }) {
  
  const renderItem = ({ item }) => {
    const isPendiente = item.estado === 'Pendiente';
    
    return (
      <View style={styles.reportCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.reportSubject}>{item.asunto}</Text>
          <View style={[styles.badge, { backgroundColor: isPendiente ? '#FEF3C7' : '#DCFCE7' }]}>
            <Text style={[styles.badgeText, { color: isPendiente ? '#D97706' : '#16A34A' }]}>
              {item.estado}
            </Text>
          </View>
        </View>
        
        <Text style={styles.reportDetail}>{item.detalle}</Text>
        
        <View style={styles.cardFooter}>
          <MaterialCommunityIcons name="clock-outline" size={14} color="#94A3B8" />
          <Text style={styles.reportDate}>{item.fecha}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Reportes de Usuarios</Text>
      </View>

      <FlatList
        data={reportesDemo}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Botón flotante para crear nuevo reporte */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  backButton: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  listContainer: { paddingHorizontal: 24, paddingBottom: 80 },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportSubject: { fontSize: 16, fontWeight: '700', color: '#1E293B', flex: 1 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  reportDetail: { fontSize: 14, color: '#64748B', lineHeight: 20, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center' },
  reportDate: { fontSize: 12, color: '#94A3B8', marginLeft: 4 },
  
  // Botón flotante
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});