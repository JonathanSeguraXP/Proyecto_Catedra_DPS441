import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, RefreshControl, Modal, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';
import { getCategories } from '../services/categoryService';
import { createMovement } from '../services/movementService';
import { Package, Search, AlertTriangle, DollarSign, Tag, Plus, Minus, Barcode, X, Pencil, Trash2 } from 'lucide-react-native';

function ProductsScreen({ navigation }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [stockModal, setStockModal] = useState(null);
    const [stockQty, setStockQty] = useState('1');
    const [stockTipo, setStockTipo] = useState('entrada');
    const [formModal, setFormModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [form, setForm] = useState({
        nombre: '', categoria_id: '', stock: '', stock_minimo: '', precio: '',
        fecha_vencimiento: '', codigo_barras: ''
    });

    const fetchData = async () => {
        try {
            const [pRes, cRes] = await Promise.all([getProducts(), getCategories()]);
            setProducts(pRes.data);
            setCategories(cRes.data);
            setFiltered(pRes.data);
        } catch { }
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        const filteredData = products.filter(p =>
            p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
            p.codigo_barras?.includes(search)
        );
        setFiltered(filteredData);
    }, [search, products]);

    const onRefresh = () => { setRefreshing(true); fetchData(); };

    const openCreate = () => {
        setEditProduct(null);
        setForm({ nombre: '', categoria_id: '', stock: '', stock_minimo: '', precio: '', fecha_vencimiento: '', codigo_barras: '' });
        setFormModal(true);
    };

    const openEdit = (product) => {
        setEditProduct(product);
        setForm({
            nombre: product.nombre || '',
            categoria_id: product.categoria_id ? String(product.categoria_id) : '',
            stock: String(product.stock ?? ''),
            stock_minimo: String(product.stock_minimo ?? ''),
            precio: String(product.precio ?? ''),
            fecha_vencimiento: product.fecha_vencimiento ? product.fecha_vencimiento.split('T')[0] : '',
            codigo_barras: product.codigo_barras || ''
        });
        setFormModal(true);
    };

    const handleFormSubmit = async () => {
        if (!form.nombre || !form.precio) {
            Alert.alert('Validación', 'Nombre y precio son obligatorios');
            return;
        }
        const payload = {
            nombre: form.nombre,
            categoria_id: form.categoria_id ? Number(form.categoria_id) : undefined,
            stock: Number(form.stock) || 0,
            stock_minimo: Number(form.stock_minimo) || 0,
            precio: Number(form.precio),
            fecha_vencimiento: form.fecha_vencimiento || undefined,
            codigo_barras: form.codigo_barras || undefined
        };
        try {
            if (editProduct) {
                await updateProduct(editProduct.id, payload);
                Alert.alert('Actualizado', 'Producto actualizado correctamente');
            } else {
                await createProduct(payload);
                Alert.alert('Creado', 'Producto creado correctamente');
            }
            setFormModal(false);
            setEditProduct(null);
            fetchData();
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Error al guardar');
        }
    };

    const handleDelete = (product) => {
        Alert.alert(
            'Eliminar producto',
            `Se eliminará "${product.nombre}"`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteProduct(product.id);
                            Alert.alert('Eliminado', 'Producto eliminado');
                            fetchData();
                        } catch (err) {
                            Alert.alert('Error', err.response?.data?.message || 'No se pudo eliminar');
                        }
                    }
                }
            ]
        );
    };

    const handleQuickStock = async () => {
        if (!stockQty || Number(stockQty) <= 0) {
            Alert.alert('Error', 'Ingresa una cantidad válida');
            return;
        }
        try {
            const { data } = await createMovement({
                producto_id: stockModal.id,
                tipo: stockTipo,
                cantidad: Number(stockQty)
            });
            Alert.alert('Movimiento registrado', `${stockTipo === 'entrada' ? 'Entrada' : 'Salida'} de ${stockQty} - Stock actual: ${data.stock_actual}`);
            setStockModal(null);
            setStockQty('1');
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

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.topRow}>
                    <View style={styles.searchRow}>
                        <Search size={18} color='#999' style={styles.searchIcon} />
                        <TextInput
                            placeholder='Buscar por nombre o código...'
                            placeholderTextColor='#999'
                            style={styles.search}
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                    <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
                        <Plus size={20} color='#FFF' />
                    </TouchableOpacity>
                </View>

                <Text style={styles.countText}>{filtered.length} producto(s)</Text>

                {/* Modal formulario crear/editar producto */}
                <Modal visible={formModal} animationType='slide' transparent>
                    <View style={styles.modalOverlay}>
                        <ScrollView style={styles.formModalScroll} contentContainerStyle={styles.formModalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{editProduct ? 'Editar Producto' : 'Nuevo Producto'}</Text>
                                <TouchableOpacity onPress={() => { setFormModal(false); setEditProduct(null); }}>
                                    <X size={24} color='#666' />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>Nombre *</Text>
                            <TextInput style={styles.input} placeholder='Nombre del producto' placeholderTextColor='#999'
                                value={form.nombre} onChangeText={(t) => setForm({ ...form, nombre: t })} />

                            <Text style={styles.label}>Categoría</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                                <TouchableOpacity style={[styles.catChip, !form.categoria_id && styles.catChipActive]}
                                    onPress={() => setForm({ ...form, categoria_id: '' })}>
                                    <Text style={[styles.catChipText, !form.categoria_id && styles.catChipTextActive]}>Sin categoría</Text>
                                </TouchableOpacity>
                                {categories.map((cat) => (
                                    <TouchableOpacity key={cat.id} style={[styles.catChip, form.categoria_id == cat.id && styles.catChipActive]}
                                        onPress={() => setForm({ ...form, categoria_id: String(cat.id) })}>
                                        <Text style={[styles.catChipText, form.categoria_id == cat.id && styles.catChipTextActive]}>{cat.nombre}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <View style={styles.row}>
                                <View style={styles.half}>
                                    <Text style={styles.label}>Stock</Text>
                                    <TextInput style={styles.input} placeholder='0' placeholderTextColor='#999'
                                        value={form.stock} onChangeText={(t) => setForm({ ...form, stock: t })} keyboardType='number-pad' />
                                </View>
                                <View style={styles.half}>
                                    <Text style={styles.label}>Stock Mínimo</Text>
                                    <TextInput style={styles.input} placeholder='0' placeholderTextColor='#999'
                                        value={form.stock_minimo} onChangeText={(t) => setForm({ ...form, stock_minimo: t })} keyboardType='number-pad' />
                                </View>
                            </View>

                            <Text style={styles.label}>Precio *</Text>
                            <TextInput style={styles.input} placeholder='0.00' placeholderTextColor='#999'
                                value={form.precio} onChangeText={(t) => setForm({ ...form, precio: t })} keyboardType='decimal-pad' />

                            <View style={styles.row}>
                                <View style={styles.half}>
                                    <Text style={styles.label}>Vencimiento</Text>
                                    <TextInput style={styles.input} placeholder='YYYY-MM-DD' placeholderTextColor='#999'
                                        value={form.fecha_vencimiento} onChangeText={(t) => setForm({ ...form, fecha_vencimiento: t })} />
                                </View>
                                <View style={styles.half}>
                                    <Text style={styles.label}>Código Barras</Text>
                                    <TextInput style={styles.input} placeholder='Código' placeholderTextColor='#999'
                                        value={form.codigo_barras} onChangeText={(t) => setForm({ ...form, codigo_barras: t })} />
                                </View>
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleFormSubmit}>
                                    <Text style={styles.saveBtnText}>{editProduct ? 'Actualizar' : 'Crear Producto'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setFormModal(false); setEditProduct(null); }}>
                                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </Modal>

                {/* Modal rápido de stock */}
                <Modal visible={!!stockModal} animationType='slide' transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Ajustar Stock</Text>
                                <TouchableOpacity onPress={() => setStockModal(null)}><X size={24} color='#666' /></TouchableOpacity>
                            </View>
                            {stockModal && (
                                <>
                                    <Text style={styles.modalProduct}>{stockModal.nombre}</Text>
                                    <Text style={styles.modalStock}>Stock actual: <Text style={styles.modalStockVal}>{stockModal.stock}</Text></Text>

                                    <View style={styles.tipoRow}>
                                        <TouchableOpacity style={[styles.tipoBtn, stockTipo === 'entrada' && styles.tipoEntrada]}
                                            onPress={() => setStockTipo('entrada')}>
                                            <Text style={[styles.tipoText, stockTipo === 'entrada' && { color: '#FFF' }]}>+ Entrada</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.tipoBtn, stockTipo === 'salida' && styles.tipoSalida]}
                                            onPress={() => setStockTipo('salida')}>
                                            <Text style={[styles.tipoText, stockTipo === 'salida' && { color: '#FFF' }]}>- Salida</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.label}>Cantidad</Text>
                                    <View style={styles.qtyRow}>
                                        <TouchableOpacity style={styles.qtyBtn} onPress={() => setStockQty(String(Math.max(1, Number(stockQty) - 1)))}>
                                            <Minus size={20} color='#FFF' />
                                        </TouchableOpacity>
                                        <TextInput style={styles.qtyInput} value={stockQty} onChangeText={setStockQty}
                                            keyboardType='number-pad' textAlign='center' />
                                        <TouchableOpacity style={styles.qtyBtn} onPress={() => setStockQty(String(Number(stockQty) + 1))}>
                                            <Plus size={20} color='#FFF' />
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity style={styles.confirmBtn} onPress={handleQuickStock}>
                                        <Text style={styles.confirmBtnText}>
                                            {stockTipo === 'entrada' ? 'Registrar Entrada' : 'Registrar Salida'}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                </Modal>

                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id.toString()}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Package size={50} color='#CCC' />
                            <Text style={styles.emptyText}>No hay productos</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardTop}>
                                <View style={styles.nameSection}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.name} numberOfLines={1}>{item.nombre}</Text>
                                        {item.stock <= item.stock_minimo && (
                                            <AlertTriangle size={16} color='#DC2626' />
                                        )}
                                    </View>
                                    <View style={styles.badgeRow}>
                                        {item.stock === 0 ? (
                                            <View style={[styles.stockBadge, styles.stockZero]}>
                                                <Text style={[styles.stockText, { color: '#FFF' }]}>AGOTADO</Text>
                                            </View>
                                        ) : (
                                            <>
                                                <View style={[styles.stockBadge, item.stock <= item.stock_minimo ? styles.stockLow : styles.stockOk]}>
                                                    <Text style={[styles.stockText, item.stock <= item.stock_minimo && { color: '#DC2626' }]}>
                                                        Stock: {item.stock}
                                                    </Text>
                                                </View>
                                                {item.stock <= item.stock_minimo && (
                                                    <Text style={styles.minText}>Mín: {item.stock_minimo}</Text>
                                                )}
                                            </>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.actionCol}>
                                    <TouchableOpacity style={styles.smallBtn} onPress={() => { setStockModal(item); setStockTipo('entrada'); setStockQty('1'); }}>
                                        <Plus size={18} color='#16A34A' />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.smallBtn, styles.smallBtnDanger]} onPress={() => { setStockModal(item); setStockTipo('salida'); setStockQty('1'); }}>
                                        <Minus size={18} color='#DC2626' />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.cardMeta}>
                                {item.categoria ? (
                                    <View style={styles.metaChip}>
                                        <Tag size={12} color='#888' />
                                        <Text style={styles.metaText} numberOfLines={1}>{item.categoria}</Text>
                                    </View>
                                ) : null}
                                <View style={styles.metaChip}>
                                    <DollarSign size={12} color='#888' />
                                    <Text style={styles.metaText}>${Number(item.precio).toFixed(2)}</Text>
                                </View>
                            </View>

                            {item.codigo_barras ? (
                                <View style={styles.barcodeRow}>
                                    <Barcode size={16} color='#555' />
                                    <Text style={styles.barcodeText}>{item.codigo_barras}</Text>
                                </View>
                            ) : null}

                            <View style={styles.cardFooter}>
                                <TouchableOpacity style={styles.footerEditBtn} onPress={() => openEdit(item)}>
                                    <Pencil size={16} color='#2563EB' />
                                    <Text style={styles.footerEditText}>Editar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.footerDeleteBtn} onPress={() => handleDelete(item)}>
                                    <Trash2 size={16} color='#DC2626' />
                                    <Text style={styles.footerDeleteText}>Eliminar</Text>
                                </TouchableOpacity>
                            </View>
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
    topRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
    searchRow: { position: 'relative', flex: 1 },
    searchIcon: { position: 'absolute', left: 15, top: 15, zIndex: 1 },
    search: { backgroundColor: '#FFF', padding: 14, paddingLeft: 42, borderRadius: 15, fontSize: 15, color: '#333' },
    addBtn: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#5D4037', alignItems: 'center', justifyContent: 'center' },
    countText: { fontSize: 13, color: '#888', marginBottom: 10 },

    card: {
        backgroundColor: '#FFF', padding: 14, borderRadius: 16, marginBottom: 10,
        shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
    nameSection: { flex: 1, marginRight: 10 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    name: { fontSize: 17, fontWeight: 'bold', color: '#333', flexShrink: 1 },
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
    stockBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
    stockOk: { backgroundColor: '#DCFCE7' },
    stockLow: { backgroundColor: '#FEE2E2' },
    stockZero: { backgroundColor: '#6B7280' },
    stockText: { fontSize: 13, fontWeight: 'bold', color: '#16A34A' },
    minText: { fontSize: 11, color: '#B91C1C' },

    actionCol: { gap: 6, justifyContent: 'center' },
    smallBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
    smallBtnDanger: { backgroundColor: '#FEE2E2' },

    cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
    metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F5F5F5', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
    metaText: { fontSize: 12, color: '#666' },

    barcodeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, backgroundColor: '#F9F9F9', padding: 8, borderRadius: 8 },
    barcodeText: { fontSize: 13, color: '#555', fontFamily: 'monospace', fontWeight: '600', letterSpacing: 1 },

    cardFooter: { flexDirection: 'row', gap: 12, marginTop: 10, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
    footerEditBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    footerEditText: { fontSize: 13, color: '#2563EB', fontWeight: '600' },
    footerDeleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    footerDeleteText: { fontSize: 13, color: '#DC2626', fontWeight: '600' },

    empty: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#999', marginTop: 10, fontSize: 16 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
    formModalScroll: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    formModalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, marginTop: 60 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    modalProduct: { fontSize: 18, fontWeight: 'bold', color: '#5D4037', marginBottom: 4 },
    modalStock: { fontSize: 14, color: '#666', marginBottom: 16 },
    modalStockVal: { fontWeight: 'bold', fontSize: 18, color: '#333' },

    label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 4 },
    input: { backgroundColor: '#F5F5F5', padding: 14, borderRadius: 12, fontSize: 15, color: '#333', marginBottom: 12 },
    row: { flexDirection: 'row', gap: 12 },
    half: { flex: 1 },
    catScroll: { marginBottom: 12 },
    catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0', marginRight: 8 },
    catChipActive: { backgroundColor: '#5D4037' },
    catChipText: { fontSize: 13, color: '#666' },
    catChipTextActive: { color: '#FFF', fontWeight: '600' },

    tipoRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    tipoBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 2, borderColor: '#DDD', alignItems: 'center' },
    tipoEntrada: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
    tipoSalida: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
    tipoText: { fontWeight: '700', fontSize: 15, color: '#666' },

    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    qtyBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#5D4037', alignItems: 'center', justifyContent: 'center' },
    qtyInput: { flex: 1, backgroundColor: '#F5F5F5', padding: 12, borderRadius: 12, fontSize: 22, fontWeight: 'bold', color: '#333' },

    confirmBtn: { backgroundColor: '#5D4037', padding: 16, borderRadius: 14, alignItems: 'center' },
    confirmBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

    modalActions: { gap: 10, marginTop: 8 },
    saveBtn: { backgroundColor: '#5D4037', padding: 16, borderRadius: 14, alignItems: 'center' },
    saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    cancelBtn: { backgroundColor: '#E5E5E5', padding: 16, borderRadius: 14, alignItems: 'center' },
    cancelBtnText: { color: '#666', fontWeight: '600', fontSize: 16 }
});

export default ProductsScreen;
