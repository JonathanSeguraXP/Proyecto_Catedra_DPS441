import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Loader from '../components/Loader';
import { getMovements, createMovement } from '../services/movementService';
import { getProducts } from '../services/productService';
import { Plus, X, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Swal from 'sweetalert2';

function Movements() {
    const [movements, setMovements] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ producto_id: '', tipo: 'entrada', cantidad: '', descripcion: '' });
    const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));

    const fetchData = async () => {
        try {
            const [mRes, pRes] = await Promise.all([getMovements(), getProducts()]);
            setMovements(mRes.data);
            setProducts(pRes.data);
        } catch {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los datos' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.producto_id || !form.cantidad) {
            Swal.fire({ icon: 'warning', title: 'Campos requeridos' });
            return;
        }
        try {
            const { data } = await createMovement({
                ...form,
                cantidad: Number(form.cantidad),
                usuario_id: user.id
            });
            Swal.fire({ icon: 'success', title: 'Movimiento registrado', text: `Stock actual: ${data.stock_actual}`, timer: 2000, showConfirmButton: false });
            setShowForm(false);
            setForm({ producto_id: '', tipo: 'entrada', cantidad: '', descripcion: '' });
            fetchData();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error al registrar' });
        }
    };

    if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className='flex justify-between items-center mb-6'>
                <div>
                    <h1 className='text-4xl font-bold'>Movimientos</h1>
                    <p className='text-gray-500'>{movements.length} movimientos registrados</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className='bg-[#5D4037] text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-[#4E342E] transition'>
                    <Plus size={20} /> Nuevo Movimiento
                </button>
            </div>

            {showForm && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
                    <div className='bg-white p-8 rounded-3xl shadow-2xl w-[450px] relative'>
                        <button onClick={() => setShowForm(false)}
                            className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'>
                            <X size={24} />
                        </button>
                        <h2 className='text-2xl font-bold mb-6'>Registrar Movimiento</h2>
                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div>
                                <label className='text-sm text-gray-600'>Producto</label>
                                <select className='w-full border p-3 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#5D4037]'
                                    value={form.producto_id} onChange={(e) => setForm({ ...form, producto_id: e.target.value })}>
                                    <option value=''>Seleccionar...</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className='text-sm text-gray-600'>Tipo</label>
                                <div className='flex gap-4 mt-2'>
                                    <label className={`flex-1 p-3 rounded-xl border-2 text-center cursor-pointer transition ${form.tipo === 'entrada' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200'}`}>
                                        <input type='radio' name='tipo' value='entrada' className='hidden'
                                            checked={form.tipo === 'entrada'} onChange={(e) => setForm({ ...form, tipo: e.target.value })} />
                                        <ArrowDownRight size={20} className='inline mr-1' /> Entrada
                                    </label>
                                    <label className={`flex-1 p-3 rounded-xl border-2 text-center cursor-pointer transition ${form.tipo === 'salida' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200'}`}>
                                        <input type='radio' name='tipo' value='salida' className='hidden'
                                            checked={form.tipo === 'salida'} onChange={(e) => setForm({ ...form, tipo: e.target.value })} />
                                        <ArrowUpRight size={20} className='inline mr-1' /> Salida
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className='text-sm text-gray-600'>Cantidad</label>
                                <input type='number' min='1' className='w-full border p-3 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#5D4037]'
                                    value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} />
                            </div>
                            <div>
                                <label className='text-sm text-gray-600'>Descripción (opcional)</label>
                                <input type='text' className='w-full border p-3 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#5D4037]'
                                    value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
                            </div>
                            <button type='submit' className='w-full bg-[#5D4037] text-white p-3 rounded-xl hover:bg-[#4E342E] transition'>
                                Registrar Movimiento
                            </button>
                        </form>
                    </div>
                </div>
            )}

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
                        {movements.length === 0 ? (
                            <tr><td colSpan={7} className='p-8 text-center text-gray-400'>No hay movimientos</td></tr>
                        ) : (
                            movements.map((mov) => (
                                <tr key={mov.id} className='border-b hover:bg-gray-50 transition'>
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
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
}

export default Movements;
