import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Loader from '../components/Loader';
import api from '../services/api';
import { FileText, Download } from 'lucide-react';
import Swal from 'sweetalert2';

function Reports() {
    const [inventory, setInventory] = useState([]);
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('inventario');
    const [sales, setSales] = useState([]);
    const [filters, setFilters] = useState({ desde: '', hasta: '', tipo: '' });

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
            .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los reportes' }))
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
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al filtrar ventas' });
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
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al filtrar' });
        }
    };

    const totalValor = inventory.reduce((sum, item) => sum + Number(item.valor_total || 0), 0);

    const exportInventoryPDF = useCallback(async () => {
        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text('CafeSys - Reporte de Inventario', 14, 20);
            doc.setFontSize(10);
            doc.text(`Generado: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 28);
            doc.text(`Valor total del inventario: $${totalValor.toFixed(2)}`, 14, 34);

            autoTable(doc, {
                startY: 40,
                head: [['Producto', 'Categoría', 'Stock', 'Stock Mín.', 'Precio', 'Valor Total', 'Vencimiento']],
                body: inventory.map(item => [
                    item.nombre,
                    item.categoria || '---',
                    item.stock,
                    item.stock_minimo,
                    `$${Number(item.precio).toFixed(2)}`,
                    `$${Number(item.valor_total).toFixed(2)}`,
                    item.fecha_vencimiento ? new Date(item.fecha_vencimiento).toLocaleDateString() : '---'
                ]),
                theme: 'striped',
                headStyles: { fillColor: [62, 39, 35], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                styles: { fontSize: 9 }
            });

            doc.save(`inventario_${new Date().toISOString().split('T')[0]}.pdf`);
            Swal.fire({ icon: 'success', title: 'PDF descargado', timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: `Error: ${err.message}` });
        }
    }, [inventory, totalValor]);

    const exportMovementsPDF = useCallback(async () => {
        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text('CafeSys - Reporte de Movimientos', 14, 20);
            doc.setFontSize(10);
            doc.text(`Generado: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 28);
            if (filters.desde || filters.hasta || filters.tipo) {
                const parts = [];
                if (filters.desde) parts.push(`Desde: ${filters.desde}`);
                if (filters.hasta) parts.push(`Hasta: ${filters.hasta}`);
                if (filters.tipo) parts.push(`Tipo: ${filters.tipo}`);
                doc.text(`Filtros: ${parts.join(' | ')}`, 14, 34);
            }

            autoTable(doc, {
                startY: 40,
                head: [['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Stock Resultante', 'Descripción', 'Usuario']],
                body: movements.map(mov => [
                    new Date(mov.fecha).toLocaleString(),
                    mov.producto,
                    mov.tipo === 'entrada' ? 'Entrada' : 'Salida',
                    mov.cantidad,
                    mov.stock_resultante ?? '---',
                    mov.descripcion || '---',
                    mov.usuario || '---'
                ]),
                theme: 'striped',
                headStyles: { fillColor: [62, 39, 35], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                styles: { fontSize: 8 }
            });

            doc.save(`movimientos_${new Date().toISOString().split('T')[0]}.pdf`);
            Swal.fire({ icon: 'success', title: 'PDF descargado', timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: `Error: ${err.message}` });
        }
    }, [movements, filters]);

    const exportSalesPDF = useCallback(async () => {
        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text('CafeSys - Reporte de Ventas', 14, 20);
            doc.setFontSize(10);
            doc.text(`Generado: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 28);
            if (filters.desde || filters.hasta) {
                const parts = [];
                if (filters.desde) parts.push(`Desde: ${filters.desde}`);
                if (filters.hasta) parts.push(`Hasta: ${filters.hasta}`);
                doc.text(`Filtros: ${parts.join(' | ')}`, 14, 34);
            }

            autoTable(doc, {
                startY: 40,
                head: [['#', 'Cliente', 'Email', 'Items', 'Total', 'Estado', 'Fecha']],
                body: sales.map(ven => [
                    ven.id,
                    ven.usuario || '---',
                    ven.email_usuario || '---',
                    ven.items || '---',
                    `$${Number(ven.total).toFixed(2)}`,
                    ven.estado,
                    new Date(ven.created_at).toLocaleString()
                ]),
                theme: 'striped',
                headStyles: { fillColor: [62, 39, 35], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                styles: { fontSize: 8 }
            });

            doc.save(`ventas_${new Date().toISOString().split('T')[0]}.pdf`);
            Swal.fire({ icon: 'success', title: 'PDF descargado', timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: `Error: ${err.message}` });
        }
    }, [sales, filters]);

    if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className='flex items-center gap-3 mb-2'>
                <FileText size={32} className='text-[#5D4037]' />
                <h1 className='text-4xl font-bold'>Reportes</h1>
            </div>

            <div className='flex gap-4 mb-8 mt-4'>
                <button onClick={() => setTab('inventario')}
                    className={`px-6 py-3 rounded-xl font-semibold transition ${tab === 'inventario' ? 'bg-[#5D4037] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                    Inventario
                </button>
                <button onClick={() => setTab('movimientos')}
                    className={`px-6 py-3 rounded-xl font-semibold transition ${tab === 'movimientos' ? 'bg-[#5D4037] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                    Movimientos
                </button>
                <button onClick={() => setTab('ventas')}
                    className={`px-6 py-3 rounded-xl font-semibold transition ${tab === 'ventas' ? 'bg-[#5D4037] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                    Ventas
                </button>
            </div>

            {tab === 'inventario' && (
                <div>
                    <div className='bg-[#5D4037] text-white p-6 rounded-2xl mb-6 flex justify-between items-center'>
                        <div>
                            <p className='text-lg opacity-80'>Valor total del inventario</p>
                            <p className='text-4xl font-bold'>${totalValor.toFixed(2)}</p>
                        </div>
                        <button onClick={exportInventoryPDF}
                            className='bg-white/20 hover:bg-white/30 p-4 rounded-2xl transition cursor-pointer' title='Descargar PDF'>
                            <Download size={32} className='text-white' />
                        </button>
                    </div>
                    <div className='overflow-auto bg-white rounded-3xl shadow-xl'>
                        <table className='w-full'>
                            <thead className='bg-[#5D4037] text-white'>
                                <tr>
                                    <th className='p-4 text-left'>Producto</th>
                                    <th className='p-4 text-left'>Categoría</th>
                                    <th className='p-4 text-center'>Stock</th>
                                    <th className='p-4 text-center'>Stock Mín.</th>
                                    <th className='p-4 text-right'>Precio</th>
                                    <th className='p-4 text-right'>Valor Total</th>
                                    <th className='p-4 text-center'>Vencimiento</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map((item, i) => (
                                    <tr key={i} className='border-b hover:bg-gray-50'>
                                        <td className='p-4 font-medium'>{item.nombre}</td>
                                        <td className='p-4'>{item.categoria || '---'}</td>
                                        <td className={`p-4 text-center font-bold ${item.stock <= item.stock_minimo ? 'text-red-500' : ''}`}>{item.stock}</td>
                                        <td className='p-4 text-center'>{item.stock_minimo}</td>
                                        <td className='p-4 text-right'>${Number(item.precio).toFixed(2)}</td>
                                        <td className='p-4 text-right font-bold'>${Number(item.valor_total).toFixed(2)}</td>
                                        <td className='p-4 text-center text-sm'>{item.fecha_vencimiento ? new Date(item.fecha_vencimiento).toLocaleDateString() : '---'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'ventas' && (
                <div>
                    <div className='bg-white p-6 rounded-2xl shadow-lg mb-6 flex flex-wrap gap-4 items-end'>
                        <div>
                            <label className='text-sm text-gray-600'>Desde</label>
                            <input type='date' className='border p-2 rounded-lg ml-2'
                                value={filters.desde} onChange={(e) => setFilters({ ...filters, desde: e.target.value })} />
                        </div>
                        <div>
                            <label className='text-sm text-gray-600'>Hasta</label>
                            <input type='date' className='border p-2 rounded-lg ml-2'
                                value={filters.hasta} onChange={(e) => setFilters({ ...filters, hasta: e.target.value })} />
                        </div>
                        <button onClick={filterSales} className='bg-[#5D4037] text-white px-5 py-2 rounded-lg hover:bg-[#4E342E] transition'>
                            Filtrar
                        </button>
                        <button onClick={exportSalesPDF}
                            className='bg-[#5D4037] text-white px-5 py-2 rounded-lg hover:bg-[#4E342E] transition flex items-center gap-2'>
                            <Download size={18} /> PDF
                        </button>
                    </div>
                    <div className='overflow-auto bg-white rounded-3xl shadow-xl'>
                        <table className='w-full'>
                            <thead className='bg-[#5D4037] text-white'>
                                <tr>
                                    <th className='p-4 text-left'>#</th>
                                    <th className='p-4 text-left'>Cliente</th>
                                    <th className='p-4 text-left'>Email</th>
                                    <th className='p-4 text-left'>Productos</th>
                                    <th className='p-4 text-right'>Total</th>
                                    <th className='p-4 text-center'>Estado</th>
                                    <th className='p-4 text-left'>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map((ven, i) => (
                                    <tr key={i} className='border-b hover:bg-gray-50'>
                                        <td className='p-4 font-mono text-sm'>{ven.id}</td>
                                        <td className='p-4 font-medium'>{ven.usuario || '---'}</td>
                                        <td className='p-4 text-sm text-gray-500'>{ven.email_usuario || '---'}</td>
                                        <td className='p-4 text-sm max-w-xs truncate' title={ven.items}>{ven.items || '---'}</td>
                                        <td className='p-4 text-right font-bold text-[#5D4037]'>${Number(ven.total).toFixed(2)}</td>
                                        <td className='p-4 text-center'>
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${ven.estado === 'completado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {ven.estado}
                                            </span>
                                        </td>
                                        <td className='p-4 text-sm'>{new Date(ven.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {sales.length === 0 && (
                                    <tr><td colSpan='7' className='p-8 text-center text-gray-400'>No hay ventas registradas</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'movimientos' && (
                <div>
                    <div className='bg-white p-6 rounded-2xl shadow-lg mb-6 flex flex-wrap gap-4 items-end'>
                        <div>
                            <label className='text-sm text-gray-600'>Desde</label>
                            <input type='date' className='border p-2 rounded-lg ml-2'
                                value={filters.desde} onChange={(e) => setFilters({ ...filters, desde: e.target.value })} />
                        </div>
                        <div>
                            <label className='text-sm text-gray-600'>Hasta</label>
                            <input type='date' className='border p-2 rounded-lg ml-2'
                                value={filters.hasta} onChange={(e) => setFilters({ ...filters, hasta: e.target.value })} />
                        </div>
                        <div>
                            <label className='text-sm text-gray-600'>Tipo</label>
                            <select className='border p-2 rounded-lg ml-2'
                                value={filters.tipo} onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}>
                                <option value=''>Todos</option>
                                <option value='entrada'>Entrada</option>
                                <option value='salida'>Salida</option>
                            </select>
                        </div>
                        <button onClick={filterMovements} className='bg-[#5D4037] text-white px-5 py-2 rounded-lg hover:bg-[#4E342E] transition'>
                            Filtrar
                        </button>
                        <button onClick={exportMovementsPDF}
                            className='bg-[#5D4037] text-white px-5 py-2 rounded-lg hover:bg-[#4E342E] transition flex items-center gap-2'>
                            <Download size={18} /> PDF
                        </button>
                    </div>
                    <div className='overflow-auto bg-white rounded-3xl shadow-xl'>
                        <table className='w-full'>
                            <thead className='bg-[#5D4037] text-white'>
                                <tr>
                                    <th className='p-4 text-left'>Fecha</th>
                                    <th className='p-4 text-left'>Producto</th>
                                    <th className='p-4 text-center'>Tipo</th>
                                    <th className='p-4 text-right'>Cantidad</th>
                                    <th className='p-4 text-right'>Stock Resultante</th>
                                    <th className='p-4 text-left'>Descripción</th>
                                    <th className='p-4 text-left'>Usuario</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movements.map((mov, i) => (
                                    <tr key={i} className='border-b hover:bg-gray-50'>
                                        <td className='p-4 text-sm'>{new Date(mov.fecha).toLocaleString()}</td>
                                        <td className='p-4 font-medium'>{mov.producto}</td>
                                        <td className='p-4 text-center'>
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${mov.tipo === 'entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {mov.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                                            </span>
                                        </td>
                                        <td className='p-4 text-right font-bold'>{mov.cantidad}</td>
                                        <td className='p-4 text-right'>{mov.stock_resultante}</td>
                                        <td className='p-4 text-sm text-gray-500'>{mov.descripcion || '---'}</td>
                                        <td className='p-4 text-sm'>{mov.usuario || '---'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default Reports;
