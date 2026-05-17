import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { Package, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react-native';

function ClientePedidosScreen({ navigation }) {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        api.get('/ventas')
            .then(({ data }) => setPedidos(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const renderItem = ({ item }) => {
        const items = typeof item.items === 'string' ? JSON.parse(item.items) : item.items || [];
        const isExpanded = expanded === item.id;
        return (
            <View style={styles.card}>
                <TouchableOpacity style={styles.cardHeader} onPress={() => setExpanded(isExpanded ? null : item.id)}>
                    <View style={{ flex: 1 }}>
                        <View style={styles.titleRow}>
                            <Text style={styles.pedidoId}>Pedido #{item.id}</Text>
                            <View style={[styles.badge, item.estado === 'completada' ? styles.badgeOk : styles.badgePending]}>
                                <Text style={[styles.badgeText, item.estado === 'completada' ? styles.badgeTextOk : styles.badgeTextPending]}>
                                    {item.estado === 'completada' ? 'Completado' : item.estado}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.date}>
                            {new Date(item.created_at).toLocaleDateString()} - <Text style={styles.total}>${Number(item.total).toFixed(2)}</Text>
                        </Text>
                    </View>
                    {isExpanded ? <ChevronUp size={20} color='#999' /> : <ChevronDown size={20} color='#999' />}
                </TouchableOpacity>
                {isExpanded && items.length > 0 && (
                    <View style={styles.details}>
                        {items.map((det, i) => (
                            <View key={i} style={styles.detailRow}>
                                <Text style={styles.detailProduct}>{det.producto} <Text style={styles.detailQty}>x{det.cantidad}</Text></Text>
                                <Text style={styles.detailSubtotal}>${Number(det.subtotal).toFixed(2)}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
                    <ArrowLeft size={24} color='#FFF' />
                </TouchableOpacity>
                <Package size={22} color='#FFF' />
                <Text style={styles.headerTitle}>Mis pedidos</Text>
            </View>

            {loading ? (
                <ActivityIndicator size='large' color='#5D4037' style={{ marginTop: 60 }} />
            ) : pedidos.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Package size={60} color='#DDD' />
                    <Text style={{ color: '#999', marginTop: 12, marginBottom: 20 }}>No tienes pedidos aún</Text>
                    <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('ClienteCatalogo')}>
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Ir a comprar</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={pedidos}
                    keyExtractor={item => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
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
    list: { padding: 12 },
    card: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 10, overflow: 'hidden' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    pedidoId: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    badgeOk: { backgroundColor: '#DCFCE7' },
    badgePending: { backgroundColor: '#FEF9C3' },
    badgeText: { fontSize: 11, fontWeight: '600' },
    badgeTextOk: { color: '#16A34A' },
    badgeTextPending: { color: '#CA8A04' },
    date: { fontSize: 12, color: '#999', marginTop: 4 },
    total: { fontWeight: 'bold', color: '#5D4037' },
    details: { borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingHorizontal: 14, paddingVertical: 8 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
    detailProduct: { fontSize: 13, color: '#555' },
    detailQty: { color: '#999' },
    detailSubtotal: { fontSize: 13, fontWeight: '600', color: '#333' },
    emptyBtn: {
        backgroundColor: '#5D4037', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14
    }
});

export default ClientePedidosScreen;
