import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const rutasDemo = [
  { id: '1', nombre: 'Ruta 1', descripcion: 'Centro - Andrés de Vera', tarifa: '$0.35' },
  { id: '2', nombre: 'Ruta 2', descripcion: 'Terminal - ULEAM', tarifa: '$0.35' },
  { id: '3', nombre: 'Ruta 3', descripcion: 'Tarqui - Los Esteros', tarifa: '$0.35' },
];

export default function RutasScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.routeItem} 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('RutaDetalle', { rutaId: item.id })}
    >
      <View style={styles.routeIconContainer}>
        <MaterialCommunityIcons name="bus" size={24} color="#0284c7" />
      </View>
      <View style={styles.routeInfo}>
        <Text style={styles.routeName}>{item.nombre}</Text>
        <Text style={styles.routeDescription}>{item.descripcion}</Text>
      </View>
      <View style={styles.routeAction}>
        <Text style={styles.routePrice}>{item.tarifa}</Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Rutas Disponibles</Text>
      </View>
      <FlatList
        data={rutasDemo}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  listContainer: {
    paddingHorizontal: 24,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    // Sombra muy sutil
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  routeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  routeDescription: {
    fontSize: 13,
    color: '#64748B',
  },
  routeAction: {
    alignItems: 'flex-end',
  },
  routePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981', // Verde para el precio
    marginBottom: 4,
  }
});