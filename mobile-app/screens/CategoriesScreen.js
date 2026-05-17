import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService';
import { Pencil, Plus, Trash2, X, Package } from 'lucide-react-native';

function CategoriesScreen({ navigation }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editCat, setEditCat] = useState(null);
    const [form, setForm] = useState({ nombre: '', descripcion: '' });

    const fetchData = async () => {
        try {
            const { data } = await getCategories();
            setCategories(data);
        } catch { }
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => { fetchData(); }, []);

    const onRefresh = () => { setRefreshing(true); fetchData(); };

    const openCreate = () => {
        setEditCat(null);
        setForm({ nombre: '', descripcion: '' });
        setShowModal(true);
    };

    const openEdit = (cat) => {
        setEditCat(cat);
        setForm({ nombre: cat.nombre, descripcion: cat.descripcion || '' });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!form.nombre || form.nombre.trim().length < 2) {
            Alert.alert('Validación', 'El nombre debe tener al menos 2 caracteres');
            return;
        }
        try {
            if (editCat) {
                await updateCategory(editCat.id, form);
                Alert.alert('Actualizada', 'Categoría actualizada correctamente');
            } else {
                await createCategory(form);
                Alert.alert('Creada', 'Categoría creada correctamente');
            }
            setShowModal(false);
            setEditCat(null);
            setForm({ nombre: '', descripcion: '' });
            fetchData();
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Error al guardar');
        }
    };

    const handleDelete = (cat) => {
        Alert.alert(
            'Eliminar categoría',
            `Se eliminará "${cat.nombre}"`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteCategory(cat.id);
                            Alert.alert('Eliminada', 'Categoría eliminada');
                            fetchData();
                        } catch (err) {
                            Alert.alert('Error', err.response?.data?.message || 'No se pudo eliminar');
                        }
                    }
                }
            ]
        );
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
                <View style={styles.headerRow}>
                    <Text style={styles.count}>{categories.length} categorías</Text>
                    <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
                        <Plus size={20} color='#FFF' />
                        <Text style={styles.addBtnText}>Nueva</Text>
                    </TouchableOpacity>
                </View>

                <Modal visible={showModal} animationType='slide' transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{editCat ? 'Editar Categoría' : 'Nueva Categoría'}</Text>
                                <TouchableOpacity onPress={() => { setShowModal(false); setEditCat(null); }}>
                                    <X size={24} color='#666' />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>Nombre *</Text>
                            <TextInput style={styles.input} placeholder='Nombre de la categoría' placeholderTextColor='#999'
                                value={form.nombre} onChangeText={(t) => setForm({ ...form, nombre: t })} />

                            <Text style={styles.label}>Descripción (opcional)</Text>
                            <TextInput style={[styles.input, styles.textArea]} placeholder='Descripción' placeholderTextColor='#999'
                                value={form.descripcion} onChangeText={(t) => setForm({ ...form, descripcion: t })}
                                multiline numberOfLines={3} textAlignVertical='top' />

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
                                    <Text style={styles.saveBtnText}>{editCat ? 'Actualizar' : 'Crear'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowModal(false); setEditCat(null); }}>
                                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id.toString()}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No hay categorías</Text></View>}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardContent}>
                                <Text style={styles.catName} numberOfLines={1}>{item.nombre}</Text>
                                {item.descripcion ? (
                                    <Text style={styles.catDesc} numberOfLines={2}>{item.descripcion}</Text>
                                ) : null}
                                <View style={styles.catMeta}>
                                    <Package size={14} color='#888' />
                                    <Text style={styles.catCount}>{item.total_productos} producto(s)</Text>
                                </View>
                            </View>
                            <View style={styles.cardActions}>
                                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                                    <Pencil size={18} color='#2563EB' />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                                    <Trash2 size={18} color='#DC2626' />
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
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    count: { fontSize: 13, color: '#888' },
    addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#5D4037', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, gap: 6 },
    addBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
    card: {
        backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 10,
        shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2,
        flexDirection: 'row'
    },
    cardContent: { flex: 1 },
    catName: { fontSize: 17, fontWeight: 'bold', color: '#333' },
    catDesc: { fontSize: 13, color: '#888', marginTop: 4 },
    catMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
    catCount: { fontSize: 13, color: '#888' },
    cardActions: { justifyContent: 'center', gap: 12, paddingLeft: 12 },
    editBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center' },
    deleteBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
    empty: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#999', fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6 },
    input: { backgroundColor: '#F5F5F5', padding: 14, borderRadius: 12, fontSize: 15, color: '#333', marginBottom: 16 },
    textArea: { minHeight: 80 },
    modalActions: { gap: 10, marginTop: 4 },
    saveBtn: { backgroundColor: '#5D4037', padding: 16, borderRadius: 14, alignItems: 'center' },
    saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    cancelBtn: { backgroundColor: '#E5E5E5', padding: 16, borderRadius: 14, alignItems: 'center' },
    cancelBtnText: { color: '#666', fontWeight: '600', fontSize: 16 }
});

export default CategoriesScreen;
