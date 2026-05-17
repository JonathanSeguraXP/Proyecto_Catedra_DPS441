import { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { IMAGES_URL } from '../services/config';
import { Coffee, Search, ShoppingCart, Plus, Minus, LogOut } from 'lucide-react-native';

function ClienteCatalogoScreen({ navigation }) {
    const { user, logout } = useContext(AuthContext);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);

    const loadCart = useCallback(async () => {
        try {
            const stored = await AsyncStorage.getItem('cart');
            if (stored) setCart(JSON.parse(stored));
        } catch {}
    }, []);

    const saveCart = useCallback(async (newCart) => {
        setCart(newCart);
        await AsyncStorage.setItem('cart', JSON.stringify(newCart));
    }, []);

    useEffect(() => {
        api.get('/ventas/productos')
            .then(({ data }) => setProductos(data))
            .catch(() => Alert.alert('Error', 'No se pudieron cargar los productos'))
            .finally(() => setLoading(false));
        loadCart();
    }, [loadCart]);

    const addToCart = async (producto) => {
        if (producto.stock <= 0) return;
        const prev = [...cart];
        const i = prev.findIndex(p => p.producto_id === producto.id);
        if (i >= 0) {
            prev[i] = { ...prev[i], cantidad: Math.min(prev[i].cantidad + 1, producto.stock) };
        } else {
            prev.push({ producto_id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1, stock: producto.stock });
        }
        await saveCart(prev);
    };

    const removeFromCart = async (producto_id) => {
        const prev = [...cart];
        const i = prev.findIndex(p => p.producto_id === producto_id);
        if (i >= 0) {
            if (prev[i].cantidad > 1) {
                prev[i] = { ...prev[i], cantidad: prev[i].cantidad - 1 };
            } else {
                prev.splice(i, 1);
            }
        }
        await saveCart(prev);
    };

    const cartCount = cart.reduce((s, p) => s + p.cantidad, 0);
    const filtered = productos.filter(p =>
        p.nombre.toLowerCase().includes(search.toLowerCase())
    );

    const renderItem = ({ item }) => {
        const inCart = cart.find(p => p.producto_id === item.id);
        return (
            <View style={styles.card}>
                {item.imagen && (
                    <Image source={{ uri: `${IMAGES_URL}/uploads/${item.imagen}` }}
                        style={styles.cardImage} resizeMode='cover' />
                )}
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.nombre}</Text>
                        <Text style={styles.cardCategory}>{item.categoria || ''}</Text>
                    </View>
                    <Text style={styles.cardPrice}>${Number(item.precio).toFixed(2)}</Text>
                </View>
                <View style={styles.cardFooter}>
                    {item.stock === 0 ? (
                        <View style={styles.agotadoBadge}>
                            <Text style={styles.agotadoText}>AGOTADO</Text>
                        </View>
                    ) : (
                        <Text style={[styles.stock, item.stock <= item.stock_minimo && { color: '#EF4444' }]}>
                            {item.stock} disp.
                        </Text>
                    )}
                    <View style={styles.cartActions}>
                        {inCart && (
                            <>
                                <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(item.id)}>
                                    <Minus size={16} color='#5D4037' />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{inCart.cantidad}</Text>
                            </>
                        )}
                        <TouchableOpacity style={[styles.addBtn, item.stock === 0 && styles.addBtnDisabled]} onPress={() => item.stock > 0 && addToCart(item)}>
                            <Plus size={18} color={item.stock === 0 ? '#999' : '#FFF'} />
                            <Text style={[styles.addText, item.stock === 0 && { color: '#999' }]}>{item.stock === 0 ? 'Agotado' : inCart ? 'Agregar' : 'Comprar'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <Coffee size={28} color='#FFF' />
                <Text style={styles.headerTitle}>CafeSys</Text>
                <Text style={{ color: '#D7CCC8', fontSize: 12, flex: 1, marginLeft: 8 }}>{user?.nombre}</Text>
                <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('ClienteCarrito')}>
                    <ShoppingCart size={22} color='#FFF' />
                    {cartCount > 0 && <Text style={styles.cartBadge}>{cartCount}</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={logout} style={{ padding: 4 }}>
                    <LogOut size={20} color='#D7CCC8' />
                </TouchableOpacity>
            </View>

            <View style={styles.searchRow}>
                <View style={styles.searchBar}>
                    <Search size={18} color='#999' />
                    <TextInput
                        placeholder='Buscar productos...'
                        placeholderTextColor='#999'
                        style={styles.searchInput}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                <TouchableOpacity style={styles.ordersBtn} onPress={() => navigation.navigate('ClientePedidos')}>
                    <Text style={styles.ordersBtnText}>Pedidos</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size='large' color='#5D4037' style={{ marginTop: 60 }} />
            ) : filtered.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#999', fontSize: 16 }}>No hay productos disponibles</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
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
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
    cartBtn: { position: 'relative', padding: 4 },
    cartBadge: {
        position: 'absolute', top: -4, right: -4, backgroundColor: '#FBBF24',
        color: '#000', fontSize: 11, fontWeight: 'bold', width: 18, height: 18,
        borderRadius: 9, textAlign: 'center', lineHeight: 18, overflow: 'hidden'
    },
    searchRow: { flexDirection: 'row', padding: 12, gap: 8, alignItems: 'center' },
    searchBar: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 12, height: 44
    },
    searchInput: { flex: 1, fontSize: 15, color: '#333', marginLeft: 8 },
    ordersBtn: {
        backgroundColor: '#FFF', borderWidth: 1, borderColor: '#5D4037',
        borderRadius: 12, paddingHorizontal: 14, height: 44, justifyContent: 'center'
    },
    ordersBtnText: { color: '#5D4037', fontWeight: '600', fontSize: 13 },
    list: { paddingHorizontal: 12, paddingBottom: 20 },
    card: {
        backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 10,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3
    },
    cardImage: { width: '100%', height: 100, borderRadius: 10, marginBottom: 10 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    cardCategory: { fontSize: 12, color: '#999', marginTop: 2 },
    cardPrice: { fontSize: 18, fontWeight: 'bold', color: '#5D4037' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    stock: { fontSize: 13, color: '#666' },
    cartActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    qtyBtn: {
        width: 30, height: 30, borderRadius: 15, backgroundColor: '#F3F3F3',
        justifyContent: 'center', alignItems: 'center'
    },
    qtyText: { fontWeight: 'bold', fontSize: 15, width: 20, textAlign: 'center' },
    addBtn: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#5D4037',
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, gap: 4
    },
    addBtnDisabled: { backgroundColor: '#E0E0E0' },
    addText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
    agotadoBadge: {
        backgroundColor: '#6B7280', paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 8
    },
    agotadoText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' }
});

export default ClienteCatalogoScreen;
