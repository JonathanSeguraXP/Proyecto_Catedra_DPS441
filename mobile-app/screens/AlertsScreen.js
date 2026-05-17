import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAlerts } from '../services/alertService';
import { AlertTriangle, CheckCircle, Package, TrendingDown } from 'lucide-react-native';

function AlertsScreen({ navigation }) {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const { data } = await getAlerts();
            setAlerts(data);
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
                <View style={[styles.headerCard, alerts.length === 0 && styles.headerSuccess]}>
                    {alerts.length > 0 ? (
                        <>
                            <AlertTriangle size={32} color='#DC2626' />
                            <Text style={styles.headerTitle}>{alerts.length} alerta(s)</Text>
                            <Text style={styles.headerSub}>Productos con stock bajo</Text>
                        </>
                    ) : (
                        <>
                            <CheckCircle size={32} color='#16A34A' />
                            <Text style={[styles.headerTitle, { color: '#16A34A' }]}>Sin alertas</Text>
                            <Text style={styles.headerSub}>Todos los productos tienen stock suficiente</Text>
                        </>
                    )}
                </View>

                <FlatList
                    data={alerts}
                    keyExtractor={(item) => item.id.toString()}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <CheckCircle size={60} color='#16A34A' />
                            <Text style={styles.emptyTitle}>Stock suficiente</Text>
                            <Text style={styles.emptySub}>Todo en orden</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.alertCard}>
                            <View style={styles.alertLeft}>
                                <View style={styles.alertIconWrap}>
                                    <TrendingDown size={22} color='#DC2626' />
                                </View>
                            </View>
                            <View style={styles.alertRight}>
                                <Text style={styles.alertName} numberOfLines={1}>{item.nombre}</Text>
                                {item.categoria ? <Text style={styles.alertCat}>{item.categoria}</Text> : null}
                                <View style={styles.alertStockRow}>
                                    <Package size={14} color='#B91C1C' />
                                    <Text style={styles.alertStock}>
                                        Stock: <Text style={styles.alertStockValue}>{item.stock}</Text>
                                        <Text style={styles.alertMin}> / mín: {item.stock_minimo}</Text>
                                    </Text>
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
    headerCard: {
        backgroundColor: '#FFF', padding: 20, borderRadius: 20, alignItems: 'center',
        marginBottom: 16, borderLeftWidth: 5, borderLeftColor: '#DC2626',
        shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2
    },
    headerSuccess: { borderLeftColor: '#16A34A' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#DC2626', marginTop: 6 },
    headerSub: { fontSize: 14, color: '#666', marginTop: 2 },
    alertCard: {
        backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
        padding: 14, borderRadius: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center'
    },
    alertLeft: { marginRight: 12 },
    alertIconWrap: { backgroundColor: '#FEE2E2', padding: 10, borderRadius: 12 },
    alertRight: { flex: 1 },
    alertName: { fontSize: 17, fontWeight: 'bold', color: '#991B1B' },
    alertCat: { fontSize: 12, color: '#B91C1C', marginTop: 2 },
    alertStockRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
    alertStock: { fontSize: 14, color: '#7F1D1D' },
    alertStockValue: { fontSize: 20, fontWeight: 'bold' },
    alertMin: { fontSize: 12, color: '#B91C1C' },
    emptyState: { alignItems: 'center', marginTop: 40 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#16A34A', marginTop: 12 },
    emptySub: { fontSize: 14, color: '#666', marginTop: 4 }
});

export default AlertsScreen;
