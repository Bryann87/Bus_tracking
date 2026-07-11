import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Importación de pantallas
import LoginScreen from '../screens/LoginScreen';
import RegistroScreen from '../screens/RegistroScreen';
import DashboardScreen from '../screens/DashboardScreen';
import RutasScreen from '../screens/RutasScreen';
import RutaFormScreen from '../screens/RutaFormScreen';
import RutaDetalleScreen from '../screens/RutaDetalleScreen';
import ParadasScreen from '../screens/ParadasScreen';
import ParadaFormScreen from '../screens/ParadaFormScreen';
import BusesScreen from '../screens/BusesScreen';
import BusFormScreen from '../screens/BusFormScreen';
import MiBusScreen from '../screens/MiBusScreen';
import MapaTiempoRealScreen from '../screens/MapaTiempoRealScreen';
import ReportesScreen from '../screens/ReportesScreen';
import ReporteFormScreen from '../screens/ReporteFormScreen';

const Stack = createNativeStackNavigator();

// Estilo de la barra superior nativa (para las pantallas que aún no rediseñamos)
const screenOptions = {
  headerStyle: { backgroundColor: '#1565C0' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Registro" component={RegistroScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {/* Pantallas con diseño moderno y limpio (sin barra azul nativa) */}
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Rutas" component={RutasScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RutaForm" component={RutaFormScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Reportes" component={ReportesScreen} options={{ headerShown: false }} />
      
      {/* Pantallas que mantienen la barra azul superior por ahora */}
      <Stack.Screen name="RutaDetalle" component={RutaDetalleScreen} options={{ title: 'Detalle de ruta' }} />
      <Stack.Screen name="Paradas" component={ParadasScreen} options={{ title: 'Paradas' }} />
      <Stack.Screen name="ParadaForm" component={ParadaFormScreen} options={{ title: 'Registrar parada' }} />
      <Stack.Screen name="Buses" component={BusesScreen} options={{ title: 'Buses' }} />
      <Stack.Screen name="BusForm" component={BusFormScreen} options={{ title: 'Registrar bus' }} />
      <Stack.Screen name="MiBus" component={MiBusScreen} options={{ title: 'Mi bus - GPS' }} />
      <Stack.Screen name="Mapa" component={MapaTiempoRealScreen} options={{ title: 'Mapa en vivo' }} />
      <Stack.Screen name="ReporteForm" component={ReporteFormScreen} options={{ title: 'Nuevo reporte' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1565C0" />
      </View>
    );
  }

  // La magia ocurre aquí: si hay usuario, muestra MainStack; si no, AuthStack
  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}