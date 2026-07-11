import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RutaFormScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tarifa, setTarifa] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.container}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.title}>Nueva Ruta</Text>
            <View style={styles.placeholderSpace} /> {/* Para centrar el título */}
          </View>

          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Nombre de la ruta</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="bus-marker" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ej: Ruta 4"
                placeholderTextColor="#94A3B8"
                value={nombre}
                onChangeText={setNombre}
              />
            </View>

            <Text style={styles.inputLabel}>Trayecto / Descripción</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="map-marker-path" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ej: Centro - ULEAM - San Mateo"
                placeholderTextColor="#94A3B8"
                value={descripcion}
                onChangeText={setDescripcion}
              />
            </View>

            <Text style={styles.inputLabel}>Tarifa base ($)</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="currency-usd" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="0.35"
                placeholderTextColor="#94A3B8"
                keyboardType="decimal-pad"
                value={tarifa}
                onChangeText={setTarifa}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} activeOpacity={0.8}>
            <MaterialCommunityIcons name="content-save" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.saveButtonText}>Guardar Ruta</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardView: { flex: 1 },
  container: { padding: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: { padding: 4 },
  placeholderSpace: { width: 32 },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  formSection: { marginBottom: 32 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#1E293B' },
  saveButton: {
    backgroundColor: '#0284c7',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});