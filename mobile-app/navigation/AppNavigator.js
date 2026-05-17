import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ScannerScreen from '../screens/ScannerScreen';
import MovementsScreen from '../screens/MovementsScreen';
import AlertsScreen from '../screens/AlertsScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import ReportesScreen from '../screens/ReportesScreen';
import ClienteCatalogoScreen from '../screens/ClienteCatalogoScreen';
import ClienteCarritoScreen from '../screens/ClienteCarritoScreen';
import ClientePedidosScreen from '../screens/ClientePedidosScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
    const { user } = useContext(AuthContext);
    const isAdmin = user?.rol !== 'cliente';

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: '#3E2723' },
                    headerTintColor: '#FFF',
                    headerTitleStyle: { fontWeight: 'bold' }
                }}
            >
                {user ? (
                    isAdmin ? (
                        <>
                            <Stack.Screen name='Dashboard' component={DashboardScreen} options={{ title: 'CafeSys', headerLeft: () => null }} />
                            <Stack.Screen name='Productos' component={ProductsScreen} options={{ title: 'Inventario' }} />
                            <Stack.Screen name='Scanner' component={ScannerScreen} options={{ title: 'Escanear' }} />
                            <Stack.Screen name='Categorias' component={CategoriesScreen} options={{ title: 'Categorías' }} />
                            <Stack.Screen name='Movimientos' component={MovementsScreen} options={{ title: 'Movimientos' }} />
                            <Stack.Screen name='Alertas' component={AlertsScreen} options={{ title: 'Alertas' }} />
                            <Stack.Screen name='Reportes' component={ReportesScreen} options={{ headerShown: false }} />
                        </>
                    ) : (
                        <>
                            <Stack.Screen name='ClienteCatalogo' component={ClienteCatalogoScreen} options={{ headerShown: false }} />
                            <Stack.Screen name='ClienteCarrito' component={ClienteCarritoScreen} options={{ headerShown: false }} />
                            <Stack.Screen name='ClientePedidos' component={ClientePedidosScreen} options={{ headerShown: false }} />
                        </>
                    )
                ) : (
                    <Stack.Screen name='Login' component={LoginScreen} options={{ headerShown: false }} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default AppNavigator;
