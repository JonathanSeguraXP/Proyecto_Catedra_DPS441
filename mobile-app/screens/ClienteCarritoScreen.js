import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { ShoppingCart, Trash2, ArrowLeft, CreditCard } from 'lucide-react-native';

function ClienteCarritoScreen({ navigation }) {
    const [cart, setCart] = useState([]);
    const [checking, setChecking] = useState(false);

    const loadCart = useCallback(async () => {
        try {
            const stored = await AsyncStorage.getItem('cart');
            if (stored) setCart(JSON.parse(stored));
        } catch {}
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', loadCart);
        return unsubscribe;
    }, [navigation, loadCart]);

    const saveAndSet = useCallback(async (newCart) => {
        setCart(newCart);
        await AsyncStorage.setItem('cart', JSON.stringify(newCart));
    }, []);

    const updateCantidad = (producto_id, delta) => {
        saveAndSet(cart.map(item => {
            if (item.producto_id !== producto_id) return item;
            const nueva = item.cantidad + delta;
            if (nueva <= 0) return null;
            return { ...item, cantidad: Math.min(nueva, item.stock) };
        }).filter(Boolean));
    };

    const removeItem = (producto_id) => {
        saveAndSet(cart.filter(item => item.producto_id !== producto_id));
    };

    const total = cart.reduce((s, i) => s + i.precio * i.cantidad, 0);

    const checkout = async () => {
        if (!cart.length) return;
        setChecking(true);
        try {
            const items = cart.map(({ producto_id, cantidad }) => ({ producto_id, cantidad }));
            const { data } = await api.post('/ventas', { items });
            await AsyncStorage.removeItem('cart');
            setCart([]);
            Alert.alert('Compra realizada!', `Venta #${data.venta_id} - Total: $${data.total.toFixed(2)}`);
            navigation.navigate('ClientePedidos');
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Error al procesar la compra');
        } finally {
            setChecking(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemRow}>
            <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={1}>{item.nombre}</Text>
                <Text style={styles.itemPrice}>${Number(item.precio).toFixed(2)} c/u</Text>
            </View>
            <View style={styles.quantityRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCantidad(item.producto_id, -1)}>
                    <Text style={styles.qtyBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{item.cantidad}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCantidad(item.producto_id, 1)}>
                    <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.itemSubtotal}>${(item.precio * item.cantidad).toFixed(2)}</Text>
            <TouchableOpacity onPress={() => removeItem(item.producto_id)} style={{ padding: 4 }}>
                <Trash2 size={18} color='#EF4444' />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
                    <ArrowLeft size={24} color='#FFF' />
                </TouchableOpacity>
                <ShoppingCart size={22} color='#FFF' />
                <Text style={styles.headerTitle}>Carrito</Text>
                <Text style={styles.headerCount}>{cart.length} producto{cart.length !== 1 ? 's' : ''}</Text>
            </View>

            {cart.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ShoppingCart size={60} color='#DDD' />
                    <Text style={{ color: '#999', marginTop: 12, marginBottom: 20 }}>Carrito vacío</Text>
                    <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('ClienteCatalogo')}>
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Ver productos</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={cart}
                        keyExtractor={(item) => String(item.producto_id)}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                    />
                    <View style={styles.footer}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                        </View>
                        <TouchableOpacity style={styles.payBtn} onPress={checkout} disabled={checking}>
                            <CreditCard size={20} color='#FFF' />
                            <Text style={styles.payBtnText}>
                                {checking ? 'Procesando...' : `Pagar $${total.toFixed(2)}`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F5F5F5' },
    header: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#3E2723',
        paddingHorizontal: 16, paddingVertical: 12, gap: 8
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', flex: 1 },
    headerCount: { color: '#D7CCC8', fontSize: 13 },
    list: { padding: 12 },
    itemRow: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
        borderRadius: 14, padding: 12, marginBottom: 8, gap: 8
    },
    itemName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    itemPrice: { fontSize: 12, color: '#999', marginTop: 2 },
    quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    qtyBtn: {
        width: 28, height: 28, borderRadius: 14, backgroundColor: '#F3F3F3',
        justifyContent: 'center', alignItems: 'center'
    },
    qtyBtnText: { fontWeight: 'bold', fontSize: 16, color: '#5D4037' },
    qtyValue: { fontWeight: 'bold', fontSize: 14, width: 18, textAlign: 'center' },
    itemSubtotal: { fontWeight: 'bold', fontSize: 14, width: 65, textAlign: 'right' },
    footer: {
        backgroundColor: '#FFF', padding: 16, borderTopLeftRadius: 20, borderTopRightRadius: 20,
        shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 8
    },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    totalValue: { fontSize: 22, fontWeight: 'bold', color: '#5D4037' },
    payBtn: {
        flexDirection: 'row', backgroundColor: '#5D4037', padding: 16,
        borderRadius: 14, justifyContent: 'center', alignItems: 'center', gap: 8
    },
    payBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    emptyBtn: {
        backgroundColor: '#5D4037', paddingHorizontal: 24, paddingVertical: 14,
        borderRadius: 14
    }
});

export default ClienteCarritoScreen;
