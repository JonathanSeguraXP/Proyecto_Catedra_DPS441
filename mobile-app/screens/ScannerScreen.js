import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProducts } from '../services/productService';
import { createMovement } from '../services/movementService';
import { Package, AlertTriangle, Barcode, Plus, Minus, ArrowDownRight, ArrowUpRight } from 'lucide-react-native';

function ScannerScreen({ navigation }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [qty, setQty] = useState('1');

    useEffect(() => {
        if (!permission) requestPermission();
    }, [permission]);

    const handleBarcodeScanned = async ({ data }) => {
        if (scanned) return;
        setScanned(true);
        setLoading(true);
        try {
            const { data: products } = await getProducts();
            const found = products.find(p => p.codigo_barras === data);
            if (found) {
                setProduct(found);
                setShowActions(false);
                setQty('1');
            } else {
                Alert.alert('No encontrado', `Código: ${data}\n¿Registrar nuevo producto?`, [
                    { text: 'Cerrar', onPress: () => setScanned(false) }
                ]);
            }
        } catch {
            Alert.alert('Error', 'Error al buscar');
            setScanned(false);
        } finally {
            setLoading(false);
        }
    };

    const handleMovement = async (tipo) => {
        if (!qty || Number(qty) <= 0) {
            Alert.alert('Error', 'Cantidad inválida');
            return;
        }
        try {
            const { data } = await createMovement({
                producto_id: product.id,
                tipo,
                cantidad: Number(qty)
            });
            Alert.alert('✅ Movimiento registrado',
                `${product.nombre}: ${tipo === 'entrada' ? '+' : '-'}${qty}\nStock actual: ${data.stock_actual}`
            );
            // Recargar producto para mostrar stock actualizado
            const { data: products } = await getProducts();
            const updated = products.find(p => p.id === product.id);
            setProduct(updated);
            setShowActions(false);
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Error al registrar');
        }
    };

    if (!permission) {
        return <View style={styles.center}><ActivityIndicator size='large' color='#5D4037' /></View>;
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={styles.permissionText}>Permiso de cámara requerido</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Permitir</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size='large' color='#5D4037' />
                    <Text style={{ marginTop: 10, color: '#5D4037' }}>Buscando...</Text>
                </View>
            ) : product ? (
                <SafeAreaView style={styles.resultContainer}>
                    <View style={styles.resultCard}>
                        <View style={styles.resultIcon}>
                            <Package size={36} color='#5D4037' />
                        </View>
                        <Text style={styles.resultName}>{product.nombre}</Text>

                        {product.codigo_barras && (
                            <View style={styles.barcodeChip}>
                                <Barcode size={14} color='#555' />
                                <Text style={styles.barcodeText}>{product.codigo_barras}</Text>
                            </View>
                        )}

                        <View style={styles.stockDisplay}>
                            <Text style={styles.stockLabel}>Stock actual</Text>
                            <Text style={[styles.stockValue, product.stock <= product.stock_minimo && { color: '#DC2626' }]}>
                                {product.stock}
                            </Text>
                            {product.stock <= product.stock_minimo && (
                                <View style={styles.lowBadge}>
                                    <AlertTriangle size={14} color='#FFF' />
                                    <Text style={styles.lowText}>Stock bajo</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Precio:</Text>
                            <Text style={styles.infoValue}>${Number(product.precio).toFixed(2)}</Text>
                        </View>
                        {product.categoria && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Categoría:</Text>
                                <Text style={styles.infoValue}>{product.categoria}</Text>
                            </View>
                        )}

                        {!showActions ? (
                            <View style={styles.actionBtns}>
                                <TouchableOpacity style={styles.entryBtn} onPress={() => setShowActions(true)}>
                                    <ArrowDownRight size={20} color='#FFF' />
                                    <Text style={styles.actionBtnText}>Entrada</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.exitBtn} onPress={() => setShowActions(true)}>
                                    <ArrowUpRight size={20} color='#FFF' />
                                    <Text style={styles.actionBtnText}>Salida</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.qtySection}>
                                <Text style={styles.qtyLabel}>Cantidad</Text>
                                <View style={styles.qtyRow}>
                                    <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(String(Math.max(1, Number(qty) - 1)))}>
                                        <Minus size={20} color='#FFF' />
                                    </TouchableOpacity>
                                    <TextInput style={styles.qtyInput} value={qty} onChangeText={setQty}
                                        keyboardType='number-pad' textAlign='center' />
                                    <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(String(Number(qty) + 1))}>
                                        <Plus size={20} color='#FFF' />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.confirmRow}>
                                    <TouchableOpacity style={styles.confirmEntry} onPress={() => handleMovement('entrada')}>
                                        <Text style={styles.confirmText}>+ Entrada</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.confirmExit} onPress={() => handleMovement('salida')}>
                                        <Text style={styles.confirmText}>- Salida</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <View style={styles.bottomRow}>
                            <TouchableOpacity style={styles.againBtn} onPress={() => { setProduct(null); setScanned(false); setShowActions(false); }}>
                                <Text style={styles.againText}>Escanear otro</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            ) : (
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    barcodeScannerSettings={{ barcodeTypes: ['ean13', 'code128', 'ean8', 'upc_a', 'qr'] }}
                    onBarcodeScanned={handleBarcodeScanned}
                >
                    <View style={styles.overlay}>
                        <View style={styles.scanFrame} />
                        <Text style={styles.scanHint}>Coloca el código de barras en el centro</Text>
                    </View>
                </CameraView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#EFEBE9' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EFEBE9', padding: 20 },
    permissionText: { fontSize: 16, color: '#333', textAlign: 'center', marginBottom: 20 },
    button: { backgroundColor: '#5D4037', padding: 15, borderRadius: 15 },
    buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scanFrame: { width: 250, height: 150, borderWidth: 3, borderColor: '#FFF', borderRadius: 20 },
    scanHint: { color: '#FFF', marginTop: 20, fontSize: 14, backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 10 },
    resultContainer: { flex: 1, justifyContent: 'center' },
    resultCard: {
        backgroundColor: '#FFF', margin: 16, borderRadius: 24, padding: 24,
        shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 15, elevation: 5
    },
    resultIcon: { alignSelf: 'center', backgroundColor: '#EFEBE9', padding: 16, borderRadius: 20, marginBottom: 12 },
    resultName: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center' },
    barcodeChip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 },
    barcodeText: { fontSize: 14, color: '#555', fontFamily: 'monospace', fontWeight: '600', letterSpacing: 1 },
    stockDisplay: { alignItems: 'center', marginVertical: 16, padding: 16, backgroundColor: '#F9F9F9', borderRadius: 16 },
    stockLabel: { fontSize: 14, color: '#666' },
    stockValue: { fontSize: 40, fontWeight: 'bold', color: '#333' },
    lowBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#DC2626', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 10, marginTop: 6 },
    lowText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    infoLabel: { fontSize: 15, color: '#666' },
    infoValue: { fontSize: 15, fontWeight: '600', color: '#333' },
    actionBtns: { flexDirection: 'row', gap: 12, marginTop: 20 },
    entryBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#16A34A', padding: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 8 },
    exitBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#DC2626', padding: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 8 },
    actionBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    qtySection: { marginTop: 16, padding: 16, backgroundColor: '#F5F5F5', borderRadius: 16 },
    qtyLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8, textAlign: 'center' },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    qtyBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#5D4037', alignItems: 'center', justifyContent: 'center' },
    qtyInput: { flex: 1, backgroundColor: '#FFF', padding: 10, borderRadius: 12, fontSize: 22, fontWeight: 'bold', color: '#333' },
    confirmRow: { flexDirection: 'row', gap: 12 },
    confirmEntry: { flex: 1, backgroundColor: '#16A34A', padding: 14, borderRadius: 12, alignItems: 'center' },
    confirmExit: { flex: 1, backgroundColor: '#DC2626', padding: 14, borderRadius: 12, alignItems: 'center' },
    confirmText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
    bottomRow: { marginTop: 16 },
    againBtn: { backgroundColor: '#5D4037', padding: 14, borderRadius: 14, alignItems: 'center' },
    againText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 }
});

export default ScannerScreen;
