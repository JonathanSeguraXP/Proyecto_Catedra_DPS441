import { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { login } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Coffee } from 'lucide-react-native';

function LoginScreen() {
    const { setUser } = useContext(AuthContext);
    const [form, setForm] = useState({ email: 'maria@gmail.com', password: 'admin123' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!form.email || !form.password) {
            setError('Completa todos los campos');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const { data } = await login(form);
            await AsyncStorage.setItem('token', data.token);
            await AsyncStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.inner}>
                <Coffee size={70} color='#5D4037' style={{ alignSelf: 'center' }} />
                <Text style={styles.title}>CafeSys</Text>
                <Text style={styles.subtitle}>Control de inventario</Text>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TextInput
                    placeholder='Correo electrónico'
                    placeholderTextColor='#999'
                    style={styles.input}
                    value={form.email}
                    onChangeText={(text) => setForm({ ...form, email: text })}
                    autoCapitalize='none'
                    keyboardType='email-address'
                />
                <TextInput
                    placeholder='Contraseña'
                    placeholderTextColor='#999'
                    style={styles.input}
                    value={form.password}
                    onChangeText={(text) => setForm({ ...form, password: text })}
                    secureTextEntry
                />
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color='#FFF' />
                    ) : (
                        <Text style={styles.buttonText}>Ingresar</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#3E2723', justifyContent: 'center' },
    inner: { padding: 30 },
    title: { fontSize: 40, fontWeight: 'bold', textAlign: 'center', color: '#FFF', marginTop: 10 },
    subtitle: { textAlign: 'center', color: '#D7CCC8', marginBottom: 40, fontSize: 16 },
    input: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 15,
        marginBottom: 15,
        fontSize: 16,
        color: '#333'
    },
    button: {
        backgroundColor: '#5D4037',
        padding: 16,
        borderRadius: 15,
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#795548'
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#FFF', textAlign: 'center', fontWeight: 'bold', fontSize: 17 },
    error: {
        backgroundColor: '#FEE2E2',
        color: '#DC2626',
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: '600'
    }
});

export default LoginScreen;
