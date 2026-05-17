import { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { getSummary } from '../services/alertService';
import { Coffee, Package, AlertTriangle, TrendingUp, DollarSign, LogOut, Tags, FileText } from 'lucide-react-native';

function DashboardScreen({ navigation }) {
    const { logout } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const { data: summary } = await getSummary();
            setData(summary);
        } catch { }
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => { fetchData(); }, []);

    const onRefresh = () => { setRefreshing(true); fetchData(); };

    const Card = ({ title, value, icon, color, onPress }) => (
        <TouchableOpacity style={[styles.card, { borderLeftColor: color || '#5D4037' }]} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.cardContent}>
                <View style={styles.cardTextWrap}>
                    <Text style={styles.cardValue} numberOfLines={1}>{value ?? '---'}</Text>
                    <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
                </View>
                <View style={styles.cardIcon}>{icon}</View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size='large' color='#5D4037' />
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Coffee size={35} color='#FFF' />
                    <Text style={styles.title}>CafeSys</Text>
                    <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                        <LogOut size={22} color='#FFF' />
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionLabel}>Resumen</Text>
                <View style={styles.cardsGrid}>
                    <View style={styles.cardHalf}>
                        <Card title='Productos' value={data?.total_productos} icon={<Package size={28} color='#5D4037' />}
                            color='#5D4037' onPress={() => navigation.navigate('Productos')} />
                    </View>
                    <View style={styles.cardHalf}>
                        <Card title='Alertas' value={data?.alertas_stock} icon={<AlertTriangle size={28} color='#DC2626' />}
                            color='#DC2626' onPress={() => navigation.navigate('Alertas')} />
                    </View>
                    <View style={styles.cardHalf}>
                        <Card title='Movimientos' value={data?.movimientos_recientes} icon={<TrendingUp size={28} color='#2563EB' />}
                            color='#2563EB' onPress={() => navigation.navigate('Movimientos')} />
                    </View>
                    <View style={styles.cardHalf}>
                        <Card title='Valor Inventario' value={`$${Number(data?.valor_inventario ?? 0).toFixed(2)}`}
                            icon={<DollarSign size={28} color='#16A34A' />} color='#16A34A' />
                    </View>
                </View>

                <Text style={styles.sectionLabel}>Acceso rápido</Text>
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Productos')} activeOpacity={0.7}>
                        <Package size={26} color='#5D4037' />
                        <Text style={styles.actionText}>Inventario</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Categorias')} activeOpacity={0.7}>
                        <Tags size={26} color='#5D4037' />
                        <Text style={styles.actionText}>Categorías</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Scanner')} activeOpacity={0.7}>
                        <Text style={styles.emoji}>📷</Text>
                        <Text style={styles.actionText}>Escanear</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Movimientos')} activeOpacity={0.7}>
                        <TrendingUp size={26} color='#5D4037' />
                        <Text style={styles.actionText}>Movimientos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Reportes')} activeOpacity={0.7}>
                        <FileText size={26} color='#5D4037' />
                        <Text style={styles.actionText}>Reportes</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#3E2723' },
    container: { flex: 1, backgroundColor: '#EFEBE9' },
    scrollContent: { paddingBottom: 30 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EFEBE9' },
    loadingText: { marginTop: 10, color: '#5D4037', fontWeight: '600' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3E2723',
        padding: 20,
        paddingTop: 20,
        paddingBottom: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30
    },
    title: { fontSize: 26, fontWeight: 'bold', color: '#FFF', flex: 1, marginLeft: 10 },
    logoutBtn: { padding: 8 },
    sectionLabel: { fontSize: 18, fontWeight: 'bold', color: '#3E2723', marginTop: 20, marginHorizontal: 16, marginBottom: 5 },
    cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
    cardHalf: { width: '50%', paddingHorizontal: 6 },
    card: {
        backgroundColor: '#FFF',
        padding: 14,
        borderRadius: 18,
        borderLeftWidth: 4,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2
    },
    cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTextWrap: { flex: 1, marginRight: 8 },
    cardValue: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    cardTitle: { fontSize: 12, color: '#666', marginTop: 2 },
    cardIcon: { opacity: 0.5 },
    actionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        marginTop: 8,
        gap: 10
    },
    actionBtn: {
        width: '47%',
        backgroundColor: '#FFF',
        padding: 18,
        borderRadius: 18,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2
    },
    actionText: { marginTop: 8, fontWeight: '600', color: '#5D4037', fontSize: 13 },
    emoji: { fontSize: 26 }
});

export default DashboardScreen;
