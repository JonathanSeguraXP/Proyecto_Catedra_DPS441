import { registerRootComponent } from 'expo';
import AuthProvider from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';

function App() {
    return (
        <AuthProvider>
            <AppNavigator />
        </AuthProvider>
    );
}

registerRootComponent(App);
