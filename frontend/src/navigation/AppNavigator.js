import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

// Pantallas
import LoginScreen from '../screens/LoginScreen';
import RegistroScreen from '../screens/RegistroScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';
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
import AsignarParadasScreen from '../screens/AsignarParadasScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: COLORS.primary },
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

// Determina qué pantalla ve primero cada rol al iniciar sesión
function getInitialRouteName(role) {
  if (role === 'admin') return 'AdminPanel';
  if (role === 'conductor') return 'MiBus';
  return 'Dashboard'; // pasajero
}

function MainStack({ role }) {
  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      initialRouteName={getInitialRouteName(role)}
    >
      {/* Home según rol — diseño propio, sin barra nativa */}
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminPanel" component={AdminPanelScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MiBus" component={MiBusScreen} options={{ title: 'Mi bus - GPS' }} />

      {/* Gestión — solo debería llegar aquí un admin (el backend también lo valida) */}
      <Stack.Screen name="Rutas" component={RutasScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RutaForm" component={RutaFormScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RutaDetalle" component={RutaDetalleScreen} options={{ title: 'Detalle de ruta' }} />
      <Stack.Screen name="Paradas" component={ParadasScreen} options={{ title: 'Paradas' }} />
      <Stack.Screen name="ParadaForm" component={ParadaFormScreen} options={{ title: 'Registrar parada' }} />
      <Stack.Screen name="Buses" component={BusesScreen} options={{ title: 'Buses' }} />
      <Stack.Screen name="BusForm" component={BusFormScreen} options={{ title: 'Registrar bus' }} />
      <Stack.Screen
        name="AsignarParadas"
        component={AsignarParadasScreen}
        options={{ title: 'Vincular ruta' }}
      />

      {/* Comunes a todos los roles */}
      <Stack.Screen name="Mapa" component={MapaTiempoRealScreen} options={{ title: 'Mapa en vivo' }} />
      <Stack.Screen name="Reportes" component={ReportesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ReporteForm" component={ReporteFormScreen} options={{ title: 'Nuevo reporte' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        // key fuerza que el Navigator se re-monte si cambia el rol
        // (ej. si en el futuro un admin puede "impersonar" o cambiar de cuenta)
        <MainStack key={user.role} role={user.role} />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}