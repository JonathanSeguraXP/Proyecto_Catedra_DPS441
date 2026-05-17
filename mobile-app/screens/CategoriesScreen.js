import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCategories } from '../services/categoryService';
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
                <Text style={styles.count}>{categories.length} categorías</Text>

                <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id.toString()}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No hay categorías</Text></View>}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardContent}>
                                <Text style={styles.catName} numberOfLines={1}>{item.nombre}</Text>
                                <View style={styles.catMeta}>
                                    <Package size={14} color='#888' />
                                    <Text style={styles.catCount}>{item.total_productos} producto(s)</Text>
                                </View>
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
    count: { fontSize: 13, color: '#888', marginBottom: 10 },
    card: {
        backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 10,
        shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2
    },
    cardContent: {},
    catName: { fontSize: 17, fontWeight: 'bold', color: '#333' },
    catMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
    catCount: { fontSize: 13, color: '#888' },
    empty: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#999', fontSize: 16 }
});

export default CategoriesScreen;
