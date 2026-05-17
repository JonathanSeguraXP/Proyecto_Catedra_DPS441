import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMovements, createMovement } from '../services/movementService';
import { getProducts } from '../services/productService';
import { Plus, X, ArrowDownRight, ArrowUpRight, Filter } from 'lucide-react-native';

function MovementsScreen({ navigation }) {
    const [movements, setMovements] = useState([]);
    const [filteredMovements, setFilteredMovements] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [filterType, setFilterType] = useState('todos');
    const [form, setForm] = useState({ producto_id: '', producto_nombre: '', tipo: 'entrada', cantidad: '', descripcion: '' });

    const fetchData = async () => {
        try {
            const [mRes, pRes] = await Promise.all([getMovements(), getProducts()]);
            setMovements(mRes.data);
            setFilteredMovements(mRes.data);
            setProducts(pRes.data);
        } catch { }
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (filterType === 'todos') setFilteredMovements(movements);
        else setFilteredMovements(movements.filter(m => m.tipo === filterType));
    }, [filterType, movements]);

    const onRefresh = () => { setRefreshing(true); fetchData(); };

    const handleSubmit = async () => {
        if (!form.producto_id || !form.cantidad) {
            Alert.alert('Error', 'Selecciona un producto y una cantidad');
            return;
        }
        try {
            const { data } = await createMovement({
                producto_id: Number(form.producto_id),
                tipo: form.tipo,
                cantidad: Number(form.cantidad),
                descripcion: form.descripcion || undefined
            });
            Alert.alert('✅ Movimiento registrado', `Stock actual: ${data.stock_actual}`);
            setShowForm(false);
            setForm({ producto_id: '', producto_nombre: '', tipo: 'entrada', cantidad: '', descripcion: '' });
            fetchData();
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Error al registrar');
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size='large' color='#5D4037' />
            </View>
        );
    }

    const Filters = () => (
        <View style={styles.filterRow}>
            {['todos', 'entrada', 'salida'].map(t => (
                <TouchableOpacity key={t} style={[styles.filterBtn, filterType === t && styles.filterActive]}
                    onPress={() => setFilterType(t)}>
                    <Text style={[styles.filterText, filterType === t && styles.filterTextActive]}>
                        {t === 'todos' ? 'Todos' : t === 'entrada' ? 'Entradas' : 'Salidas'}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)} activeOpacity={0.8}>
                    <Plus size={20} color='#FFF' />
                    <Text style={styles.addButtonText}>Nuevo Movimiento</Text>
                </TouchableOpacity>

                <Filters />

                <Modal visible={showForm} animationType='slide' transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modal}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Registrar Movimiento</Text>
                                <TouchableOpacity onPress={() => setShowForm(false)}><X size={24} color='#666' /></TouchableOpacity>
                            </View>

                            <Text style={styles.label}>Producto</Text>
                            <FlatList
                                data={products}
                                keyExtractor={item => item.id.toString()}
                                style={styles.productList}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[styles.productItem, form.producto_id === item.id.toString() && styles.productItemActive]}
                                        onPress={() => setForm({ ...form, producto_id: item.id.toString(), producto_nombre: item.nombre })}>
                                        <Text style={[styles.productItemText, form.producto_id === item.id.toString() && styles.productItemTextActive]}>
                                            {item.nombre}
                                        </Text>
                                        <Text style={[styles.productItemStock, form.producto_id === item.id.toString() && { color: '#FFF' }]}>Stock: {item.stock}</Text>
                                    </TouchableOpacity>
                                )}
                            />

                            {form.producto_id ? <Text style={styles.selectedProduct}>✓ {form.producto_nombre}</Text> : null}

                            <Text style={styles.label}>Tipo</Text>
                            <View style={styles.tipoRow}>
                                <TouchableOpacity style={[styles.tipoBtn, form.tipo === 'entrada' && styles.tipoEntradaActive]}
                                    onPress={() => setForm({ ...form, tipo: 'entrada' })}>
                                    <ArrowDownRight size={18} color={form.tipo === 'entrada' ? '#FFF' : '#16A34A'} />
                                    <Text style={[styles.tipoText, form.tipo === 'entrada' && { color: '#FFF' }]}>Entrada</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.tipoBtn, form.tipo === 'salida' && styles.tipoSalidaActive]}
                                    onPress={() => setForm({ ...form, tipo: 'salida' })}>
                                    <ArrowUpRight size={18} color={form.tipo === 'salida' ? '#FFF' : '#DC2626'} />
                                    <Text style={[styles.tipoText, form.tipo === 'salida' && { color: '#FFF' }]}>Salida</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>Cantidad</Text>
                            <TextInput style={styles.input} placeholder='0' placeholderTextColor='#999'
                                keyboardType='number-pad' value={form.cantidad} onChangeText={t => setForm({ ...form, cantidad: t })} />

                            <Text style={styles.label}>Descripción (opcional)</Text>
                            <TextInput style={styles.input} placeholder='Ej: Compra semanal' placeholderTextColor='#999'
                                value={form.descripcion} onChangeText={t => setForm({ ...form, descripcion: t })} />

                            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
                                <Text style={styles.submitText}>Registrar Movimiento</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <FlatList
                    data={filteredMovements}
                    keyExtractor={(item) => item.id.toString()}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No hay movimientos</Text></View>}
                    renderItem={({ item }) => (
                        <View style={styles.movementCard}>
                            <View style={styles.movHeader}>
                                <Text style={styles.movProduct} numberOfLines={1}>{item.producto}</Text>
                                <View style={[styles.tipoBadge, item.tipo === 'entrada' ? styles.entradaBadge : styles.salidaBadge]}>
                                    <Text style={styles.tipoBadgeText}>{item.tipo === 'entrada' ? 'Entrada' : 'Salida'}</Text>
                                </View>
                            </View>
                            <View style={styles.movBody}>
                                <Text style={styles.movDate}>{new Date(item.fecha).toLocaleString()}</Text>
                                <Text style={styles.movCant}>Cant: <Text style={styles.movCantValue}>{item.cantidad}</Text></Text>
                            </View>
                            {item.descripcion ? <Text style={styles.movDesc} numberOfLines={1}>{item.descripcion}</Text> : null}
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#EFEBE9' },
    container: { flex: 1, padding: 16, paddingBottom: 0 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EFEBE9' },
    addButton: {
        backgroundColor: '#5D4037', flexDirection: 'row', padding: 14, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center', marginBottom: 10, gap: 8
    },
    addButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
    filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#FFF' },
    filterActive: { backgroundColor: '#5D4037' },
    filterText: { fontSize: 13, fontWeight: '600', color: '#666' },
    filterTextActive: { color: '#FFF' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    label: { fontSize: 14, fontWeight: '600', color: '#555', marginTop: 12, marginBottom: 6 },
    input: { backgroundColor: '#F5F5F5', padding: 14, borderRadius: 12, fontSize: 15, color: '#333' },
    productList: { maxHeight: 150, marginBottom: 4 },
    productItem: { padding: 12, borderRadius: 10, marginBottom: 4, backgroundColor: '#F5F5F5', flexDirection: 'row', justifyContent: 'space-between' },
    productItemActive: { backgroundColor: '#5D4037' },
    productItemText: { color: '#333', fontSize: 14, flex: 1 },
    productItemTextActive: { color: '#FFF', fontWeight: '600' },
    productItemStock: { fontSize: 12, color: '#888' },
    selectedProduct: { fontSize: 13, color: '#16A34A', fontWeight: '600', marginBottom: 4 },
    tipoRow: { flexDirection: 'row', gap: 12 },
    tipoBtn: { flex: 1, flexDirection: 'row', padding: 14, borderRadius: 12, borderWidth: 2, borderColor: '#DDD', alignItems: 'center', justifyContent: 'center', gap: 6 },
    tipoEntradaActive: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
    tipoSalidaActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
    tipoText: { fontWeight: '600', color: '#666' },
    submitBtn: { backgroundColor: '#5D4037', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 20 },
    submitText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    movementCard: { backgroundColor: '#FFF', padding: 14, borderRadius: 16, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
    movHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    movProduct: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 8 },
    tipoBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
    entradaBadge: { backgroundColor: '#DCFCE7' },
    salidaBadge: { backgroundColor: '#FEE2E2' },
    tipoBadgeText: { fontSize: 12, fontWeight: 'bold' },
    movBody: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
    movDate: { fontSize: 11, color: '#999' },
    movCant: { fontSize: 13, color: '#666' },
    movCantValue: { fontWeight: 'bold', color: '#5D4037', fontSize: 15 },
    movDesc: { fontSize: 12, color: '#AAA', marginTop: 4, fontStyle: 'italic' },
    empty: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#999', fontSize: 16 }
});

export default MovementsScreen;
