import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import api from '../services/api';
import { FileText, Download, Filter, ArrowLeft } from 'lucide-react-native';

function ReportesScreen({ navigation }) {
    const [inventory, setInventory] = useState([]);
    const [movements, setMovements] = useState([]);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('inventario');
    const [filters, setFilters] = useState({ desde: '', hasta: '', tipo: '' });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        Promise.all([
            api.get('/reportes/inventario'),
            api.get('/reportes/movimientos'),
            api.get('/reportes/ventas')
        ])
            .then(([invRes, movRes, venRes]) => {
                setInventory(invRes.data);
                setMovements(movRes.data);
                setSales(venRes.data);
            })
            .catch(() => Alert.alert('Error', 'No se pudieron cargar los reportes'))
            .finally(() => setLoading(false));
    }, []);

    const filterSales = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.desde) params.append('desde', filters.desde);
            if (filters.hasta) params.append('hasta', filters.hasta);
            const { data } = await api.get(`/reportes/ventas?${params}`);
            setSales(data);
        } catch {
            Alert.alert('Error', 'Error al filtrar ventas');
        }
    };

    const filterMovements = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.desde) params.append('desde', filters.desde);
            if (filters.hasta) params.append('hasta', filters.hasta);
            if (filters.tipo) params.append('tipo', filters.tipo);
            const { data } = await api.get(`/reportes/movimientos?${params}`);
            setMovements(data);
        } catch {
            Alert.alert('Error', 'Error al filtrar');
        }
    };

    const totalValor = inventory.reduce((sum, item) => sum + Number(item.valor_total || 0), 0);

    const exportInventoryPDF = useCallback(async () => {
        try {
            const rows = inventory.map(item => `
                <tr>
                    <td>${item.nombre}</td>
                    <td>${item.categoria || '---'}</td>
                    <td style="text-align:center">${item.stock}</td>
                    <td style="text-align:center">${item.stock_minimo}</td>
                    <td style="text-align:right">$${Number(item.precio).toFixed(2)}</td>
                    <td style="text-align:right;font-weight:bold">$${Number(item.valor_total).toFixed(2)}</td>
                    <td style="text-align:center">${item.fecha_vencimiento ? new Date(item.fecha_vencimiento).toLocaleDateString() : '---'}</td>
                </tr>
            `).join('');

            const html = `
                <html>
                <head><meta charset="utf-8"/><style>
                    body { font-family: sans-serif; padding: 20px; }
                    h1 { color: #3E2723; font-size: 22px; }
                    .meta { color: #666; font-size: 12px; margin-bottom: 10px; }
                    .total { font-size: 18px; font-weight: bold; color: #3E2723; margin-bottom: 15px; }
                    table { width: 100%; border-collapse: collapse; font-size: 11px; }
                    th { background: #3E2723; color: #FFF; padding: 8px; text-align: left; }
                    td { padding: 6px 8px; border-bottom: 1px solid #EEE; }
                    tr:nth-child(even) { background: #F5F5F5; }
                </style></head>
                <body>
                    <h1>CafeSys - Reporte de Inventario</h1>
                    <p class="meta">Generado: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                    <p class="total">Valor total del inventario: $${totalValor.toFixed(2)}</p>
                    <table>
                        <tr><th>Producto</th><th>Categoría</th><th>Stock</th><th>Stock Mín.</th><th>Precio</th><th>Valor Total</th><th>Vencimiento</th></tr>
                        ${rows}
                    </table>
                </body></html>`;

            const { uri } = await Print.printToFileAsync({ html });
            const pdfUri = FileSystem.documentDirectory + `inventario_${new Date().toISOString().split('T')[0]}.pdf`;
            await FileSystem.moveAsync({ from: uri, to: pdfUri });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(pdfUri);
            } else {
                Alert.alert('PDF generado', `Guardado en: ${pdfUri}`);
            }
        } catch (err) {
            Alert.alert('Error', 'No se pudo generar el PDF');
        }
    }, [inventory, totalValor]);

    const exportMovementsPDF = useCallback(async () => {
        try {
            const rows = movements.map(mov => `
                <tr>
                    <td>${new Date(mov.fecha).toLocaleString()}</td>
                    <td>${mov.producto}</td>
                    <td style="text-align:center"><span style="color:${mov.tipo === 'entrada' ? 'green' : 'red'}">${mov.tipo === 'entrada' ? 'Entrada' : 'Salida'}</span></td>
                    <td style="text-align:right">${mov.cantidad}</td>
                    <td style="text-align:right">${mov.stock_resultante ?? '---'}</td>
                    <td>${mov.descripcion || '---'}</td>
                    <td>${mov.usuario || '---'}</td>
                </tr>
            `).join('');

            let filterText = '';
            if (filters.desde || filters.hasta || filters.tipo) {
                const parts = [];
                if (filters.desde) parts.push(`Desde: ${filters.desde}`);
                if (filters.hasta) parts.push(`Hasta: ${filters.hasta}`);
                if (filters.tipo) parts.push(`Tipo: ${filters.tipo}`);
                filterText = `<p class="meta">Filtros: ${parts.join(' | ')}</p>`;
            }

            const html = `
                <html>
                <head><meta charset="utf-8"/><style>
                    body { font-family: sans-serif; padding: 20px; }
                    h1 { color: #3E2723; font-size: 22px; }
                    .meta { color: #666; font-size: 12px; margin-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; font-size: 10px; }
                    th { background: #3E2723; color: #FFF; padding: 8px; text-align: left; }
                    td { padding: 5px 6px; border-bottom: 1px solid #EEE; }
                    tr:nth-child(even) { background: #F5F5F5; }
                </style></head>
                <body>
                    <h1>CafeSys - Reporte de Movimientos</h1>
                    <p class="meta">Generado: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                    ${filterText}
                    <table>
                        <tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Stock Res.</th><th>Descripción</th><th>Usuario</th></tr>
                        ${rows}
                    </table>
                </body></html>`;

            const { uri } = await Print.printToFileAsync({ html });
            const pdfUri = FileSystem.documentDirectory + `movimientos_${new Date().toISOString().split('T')[0]}.pdf`;
            await FileSystem.moveAsync({ from: uri, to: pdfUri });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(pdfUri);
            } else {
                Alert.alert('PDF generado', `Guardado en: ${pdfUri}`);
            }
        } catch (err) {
            Alert.alert('Error', 'No se pudo generar el PDF');
        }
    }, [movements, filters]);

    const exportSalesPDF = useCallback(async () => {
        try {
            const rows = sales.map(ven => `
                <tr>
                    <td>${ven.id}</td>
                    <td>${ven.usuario || '---'}</td>
                    <td>${ven.email_usuario || '---'}</td>
                    <td>${ven.items || '---'}</td>
                    <td style="text-align:right;font-weight:bold">$${Number(ven.total).toFixed(2)}</td>
                    <td style="text-align:center">${ven.estado}</td>
                    <td>${new Date(ven.created_at).toLocaleString()}</td>
                </tr>
            `).join('');

            let filterText = '';
            if (filters.desde || filters.hasta) {
                const parts = [];
                if (filters.desde) parts.push(`Desde: ${filters.desde}`);
                if (filters.hasta) parts.push(`Hasta: ${filters.hasta}`);
                filterText = `<p class="meta">Filtros: ${parts.join(' | ')}</p>`;
            }

            const html = `
                <html>
                <head><meta charset="utf-8"/><style>
                    body { font-family: sans-serif; padding: 20px; }
                    h1 { color: #3E2723; font-size: 22px; }
                    .meta { color: #666; font-size: 12px; margin-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; font-size: 10px; }
                    th { background: #3E2723; color: #FFF; padding: 8px; text-align: left; }
                    td { padding: 5px 6px; border-bottom: 1px solid #EEE; }
                    tr:nth-child(even) { background: #F5F5F5; }
                </style></head>
                <body>
                    <h1>CafeSys - Reporte de Ventas</h1>
                    <p class="meta">Generado: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                    ${filterText}
                    <table>
                        <tr><th>#</th><th>Cliente</th><th>Email</th><th>Productos</th><th>Total</th><th>Estado</th><th>Fecha</th></tr>
                        ${rows}
                    </table>
                </body></html>`;

            const { uri } = await Print.printToFileAsync({ html });
            const pdfUri = FileSystem.documentDirectory + `ventas_${new Date().toISOString().split('T')[0]}.pdf`;
            await FileSystem.moveAsync({ from: uri, to: pdfUri });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(pdfUri);
            } else {
                Alert.alert('PDF generado', `Guardado en: ${pdfUri}`);
            }
        } catch (err) {
            Alert.alert('Error', 'No se pudo generar el PDF');
        }
    }, [sales, filters]);

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.header}>
                    <ArrowLeft size={24} color='#FFF' onPress={() => navigation.goBack()} />
                    <Text style={styles.headerTitle}>Reportes</Text>
                </View>
                <ActivityIndicator size='large' color='#5D4037' style={{ marginTop: 60 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
                    <ArrowLeft size={24} color='#FFF' />
                </TouchableOpacity>
                <FileText size={22} color='#FFF' />
                <Text style={styles.headerTitle}>Reportes</Text>
            </View>

            <View style={styles.tabRow}>
                <TouchableOpacity style={[styles.tab, tab === 'inventario' && styles.tabActive]} onPress={() => setTab('inventario')}>
                    <Text style={[styles.tabText, tab === 'inventario' && styles.tabTextActive]}>Inventario</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, tab === 'movimientos' && styles.tabActive]} onPress={() => setTab('movimientos')}>
                    <Text style={[styles.tabText, tab === 'movimientos' && styles.tabTextActive]}>Movimientos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, tab === 'ventas' && styles.tabActive]} onPress={() => setTab('ventas')}>
                    <Text style={[styles.tabText, tab === 'ventas' && styles.tabTextActive]}>Ventas</Text>
                </TouchableOpacity>
            </View>

            {tab === 'inventario' && (
                <View style={{ flex: 1 }}>
                    <View style={styles.totalCard}>
                        <View>
                            <Text style={styles.totalLabel}>Valor total del inventario</Text>
                            <Text style={styles.totalValue}>${totalValor.toFixed(2)}</Text>
                        </View>
                        <TouchableOpacity style={styles.pdfBtn} onPress={exportInventoryPDF}>
                            <Download size={22} color='#FFF' />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={inventory}
                        keyExtractor={(item, i) => String(i)}
                        renderItem={({ item }) => (
                            <View style={styles.row}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.rowName}>{item.nombre}</Text>
                                    <Text style={styles.rowCategory}>{item.categoria || '---'}</Text>
                                </View>
                                <View style={styles.rowRight}>
                                    <Text style={[styles.rowStock, item.stock <= item.stock_minimo && { color: '#EF4444' }]}>{item.stock}</Text>
                                    <Text style={styles.rowPrice}>${Number(item.precio).toFixed(2)}</Text>
                                </View>
                            </View>
                        )}
                        contentContainerStyle={{ padding: 12 }}
                    />
                </View>
            )}

            {tab === 'ventas' && (
                <View style={{ flex: 1 }}>
                    <TouchableOpacity style={styles.filterToggle} onPress={() => setShowFilters(!showFilters)}>
                        <Filter size={18} color='#5D4037' />
                        <Text style={styles.filterToggleText}>{showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}</Text>
                    </TouchableOpacity>
                    {showFilters && (
                        <View style={styles.filterPanel}>
                            <Text style={styles.filterLabel}>Desde (YYYY-MM-DD)</Text>
                            <TextInput style={styles.dateInput} value={filters.desde}
                                onChangeText={(t) => setFilters({ ...filters, desde: t })}
                                placeholder='Ej: 2026-01-01' placeholderTextColor='#BBB' />
                            <Text style={styles.filterLabel}>Hasta (YYYY-MM-DD)</Text>
                            <TextInput style={styles.dateInput} value={filters.hasta}
                                onChangeText={(t) => setFilters({ ...filters, hasta: t })}
                                placeholder='Ej: 2026-12-31' placeholderTextColor='#BBB' />
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity style={styles.filterApplyBtn} onPress={filterSales}>
                                    <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>Filtrar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.filterPdfBtn} onPress={exportSalesPDF}>
                                    <Download size={16} color='#FFF' />
                                    <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>PDF</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    <FlatList
                        data={sales}
                        keyExtractor={(item, i) => String(i)}
                        renderItem={({ item }) => (
                            <View style={styles.saleCard}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <Text style={{ fontWeight: 'bold', color: '#5D4037' }}>#{item.id}</Text>
                                    <Text style={[styles.saleBadge, item.estado === 'completado' ? styles.saleBadgeOk : styles.saleBadgePend]}>
                                        {item.estado}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', flex: 1 }} numberOfLines={1}>{item.usuario || '---'}</Text>
                                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#5D4037' }}>${Number(item.total).toFixed(2)}</Text>
                                </View>
                                <Text style={{ fontSize: 11, color: '#999' }} numberOfLines={1}>{item.items || '---'}</Text>
                                <Text style={{ fontSize: 10, color: '#BBB', marginTop: 4 }}>{new Date(item.created_at).toLocaleString()}</Text>
                            </View>
                        )}
                        contentContainerStyle={{ padding: 12 }}
                    />
                </View>
            )}

            {tab === 'movimientos' && (
                <View style={{ flex: 1 }}>
                    <TouchableOpacity style={styles.filterToggle} onPress={() => setShowFilters(!showFilters)}>
                        <Filter size={18} color='#5D4037' />
                        <Text style={styles.filterToggleText}>{showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}</Text>
                    </TouchableOpacity>
                    {showFilters && (
                        <View style={styles.filterPanel}>
                            <Text style={styles.filterLabel}>Desde (YYYY-MM-DD)</Text>
                            <TextInput style={styles.dateInput} value={filters.desde}
                                onChangeText={(t) => setFilters({ ...filters, desde: t })}
                                placeholder='Ej: 2026-01-01' placeholderTextColor='#BBB' />
                            <Text style={styles.filterLabel}>Hasta (YYYY-MM-DD)</Text>
                            <TextInput style={styles.dateInput} value={filters.hasta}
                                onChangeText={(t) => setFilters({ ...filters, hasta: t })}
                                placeholder='Ej: 2026-12-31' placeholderTextColor='#BBB' />
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                                <TouchableOpacity style={[styles.filterTypeBtn, filters.tipo === '' && styles.filterTypeActive]} onPress={() => setFilters({ ...filters, tipo: '' })}>
                                    <Text style={[styles.filterTypeText, filters.tipo === '' && styles.filterTypeTextActive]}>Todos</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.filterTypeBtn, filters.tipo === 'entrada' && styles.filterTypeActive]} onPress={() => setFilters({ ...filters, tipo: 'entrada' })}>
                                    <Text style={[styles.filterTypeText, filters.tipo === 'entrada' && styles.filterTypeTextActive]}>Entrada</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.filterTypeBtn, filters.tipo === 'salida' && styles.filterTypeActive]} onPress={() => setFilters({ ...filters, tipo: 'salida' })}>
                                    <Text style={[styles.filterTypeText, filters.tipo === 'salida' && styles.filterTypeTextActive]}>Salida</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity style={styles.filterApplyBtn} onPress={filterMovements}>
                                    <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>Filtrar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.filterPdfBtn} onPress={exportMovementsPDF}>
                                    <Download size={16} color='#FFF' />
                                    <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>PDF</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    <FlatList
                        data={movements}
                        keyExtractor={(item, i) => String(i)}
                        renderItem={({ item }) => (
                            <View style={styles.movRow}>
                                <View style={styles.movLeft}>
                                    <Text style={styles.movProduct} numberOfLines={1}>{item.producto}</Text>
                                    <Text style={styles.movDate}>{new Date(item.fecha).toLocaleDateString()}</Text>
                                </View>
                                <View style={styles.movRight}>
                                    <Text style={[styles.movQty, item.tipo === 'entrada' ? { color: '#16A34A' } : { color: '#EF4444' }]}>
                                        {item.tipo === 'entrada' ? '+' : '-'}{item.cantidad}
                                    </Text>
                                    <Text style={[styles.movBadge, item.tipo === 'entrada' ? styles.movBadgeIn : styles.movBadgeOut]}>
                                        {item.tipo === 'entrada' ? 'E' : 'S'}
                                    </Text>
                                </View>
                            </View>
                        )}
                        contentContainerStyle={{ padding: 12 }}
                    />
                </View>
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
    tabRow: { flexDirection: 'row', padding: 12, gap: 8 },
    tab: {
        flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FFF',
        alignItems: 'center'
    },
    tabActive: { backgroundColor: '#5D4037' },
    tabText: { fontSize: 15, fontWeight: '600', color: '#666' },
    tabTextActive: { color: '#FFF' },
    totalCard: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#5D4037', margin: 12, padding: 16, borderRadius: 16
    },
    totalLabel: { color: '#D7CCC8', fontSize: 13 },
    totalValue: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginTop: 4 },
    pdfBtn: {
        backgroundColor: '#FFFFFF33', padding: 14, borderRadius: 14
    },
    row: {
        flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12,
        padding: 12, marginBottom: 6, alignItems: 'center'
    },
    rowName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    rowCategory: { fontSize: 11, color: '#999', marginTop: 2 },
    rowRight: { alignItems: 'flex-end' },
    rowStock: { fontSize: 16, fontWeight: 'bold', color: '#16A34A' },
    rowPrice: { fontSize: 13, color: '#5D4037', fontWeight: '600', marginTop: 2 },
    filterToggle: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        padding: 12, marginHorizontal: 12, marginTop: 4
    },
    filterToggleText: { color: '#5D4037', fontWeight: '600', fontSize: 13 },
    filterPanel: {
        backgroundColor: '#FFF', margin: 12, padding: 14, borderRadius: 14,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3
    },
    filterLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
    dateInput: {
        borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12,
        marginBottom: 8, backgroundColor: '#FAFAFA'
    },
    filterTypeBtn: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
        backgroundColor: '#F3F3F3'
    },
    filterTypeActive: { backgroundColor: '#5D4037' },
    filterTypeText: { fontSize: 13, color: '#666', fontWeight: '600' },
    filterTypeTextActive: { color: '#FFF' },
    filterApplyBtn: {
        flex: 1, backgroundColor: '#5D4037', paddingVertical: 12,
        borderRadius: 12, alignItems: 'center'
    },
    filterPdfBtn: {
        flexDirection: 'row', backgroundColor: '#4E342E', paddingVertical: 12,
        paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', gap: 6
    },
    movRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#FFF', borderRadius: 12, padding: 12, marginBottom: 6
    },
    movLeft: { flex: 1 },
    movProduct: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    movDate: { fontSize: 11, color: '#999', marginTop: 2 },
    movRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    movQty: { fontSize: 16, fontWeight: 'bold' },
    movBadge: {
        width: 24, height: 24, borderRadius: 12, textAlign: 'center',
        lineHeight: 24, fontSize: 12, fontWeight: 'bold', overflow: 'hidden'
    },
    movBadgeIn: { backgroundColor: '#DCFCE7', color: '#16A34A' },
    movBadgeOut: { backgroundColor: '#FEE2E2', color: '#EF4444' },
    saleCard: {
        backgroundColor: '#FFF', borderRadius: 12, padding: 12, marginBottom: 6,
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2
    },
    saleBadge: {
        fontSize: 11, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 2,
        borderRadius: 8, overflow: 'hidden'
    },
    saleBadgeOk: { backgroundColor: '#DCFCE7', color: '#16A34A' },
    saleBadgePend: { backgroundColor: '#FEF3C7', color: '#D97706' },
});

export default ReportesScreen;
